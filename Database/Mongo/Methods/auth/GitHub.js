import express from 'express';
import passport from 'passport';
import session from 'express-session';
import GitHubStrategy from 'passport-github2';
import User from '../../model.js'; // استيراد نموذج المستخدم
import crypto from 'crypto';

const router = express.Router();

// إعداد passport مع استراتيجية GitHub
passport.use(new GitHubStrategy({
  clientID: global.githubID,
  clientSecret: global.githubSecret,
  callbackURL: 'http://stitch-api.vercel.app/api/v1/auth/github/callback' // قم بتعديل هذه إلى عنوان URL الخاص بك
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // تأكد من وجود البريد الإلكتروني
    const { login, email, avatar_url } = profile;

    if (!email) {
      return done(null, false, { message: 'GitHub account missing email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const username = login + crypto.randomBytes(2).toString('hex');
      const apiKey = crypto.randomBytes(16).toString('hex');
      const token = crypto.randomBytes(32).toString('hex');

      user = new User({
        name: profile.displayName || login,
        email,
        username,
        loginType: 'github',
        apiKey,
        token,
        avatar: avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || login)}&background=random`,
        update: { first: new Date() },
        plan: {
          name: 'Free',
          price: 0,
          description: 'Basic free plan',
          durationDays: 30,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        limited: 1000,
        coins: 10
      });

      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// تعيين كيف يتم تخزين واسترجاع المستخدم بعد تسجيل الدخول
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// إعداد الجلسات
router.use(session({
  secret: 'your_session_secret', // ضع هنا سر الجلسة
  resave: false,
  saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());

// الخطوة الأولى: إعادة توجيه المستخدم إلى GitHub OAuth
router.get('/github', (req, res, next) => {
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

// الخطوة الثانية: استلام الكود وإنشاء الحساب
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { failureRedirect: '/' }, async (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ success: false, message: 'GitHub login failed' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error during session setup' });
      }

      return res.status(200).json({
        success: true,
        message: 'GitHub OAuth successful',
        user: {
          name: user.name,
          email: user.email,
          username: user.username,
          apiKey: user.apiKey,
          token: user.token,
          avatar: user.avatar,
          role: user.role,
          plan: user.plan,
          coins: user.coins
        }
      });
    });
  })(req, res, next);
});

export default router;

import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../model.js';  // تأكد من أن المسار صحيح
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// تعيين القيم المطلوبة في global
global.redirectUri = 'https://stitch-api.vercel.app/api/v1/auth/google/callback';  // عيّن قيمة الرابط المعاد توجيه المستخدم إليه

// إعداد passport
passport.use(new GoogleStrategy({
  clientID: global.googleID,
  clientSecret: global.googleSecret,
  callbackURL: global.redirectUri  // استخدام الرابط من global
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });

  if (!user) {
    // إذا لم يكن المستخدم موجودًا، إنشاء حساب جديد
    const username = profile.emails[0].value.split('@')[0] + crypto.randomBytes(2).toString('hex');
    const apiKey = crypto.randomBytes(16).toString('hex');
    const token = crypto.randomBytes(32).toString('hex');
    
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      username,
      loginType: 'google',
      apiKey,
      token,
      avatar: profile.photos[0].value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random`,
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
}));

// تهيئة session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// إعداد session في express واستخدام `token` في `secret`
router.use(passport.initialize());
router.use(passport.session());

// مسار إعادة التوجيه إلى صفحة Google لتوثيق الدخول
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// التعامل مع رد Google بعد التوثيق
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',  // في حالة الفشل، التوجيه إلى صفحة تسجيل الدخول
}), (req, res) => {
  const user = req.user;
  
  // إنشاء توكن JWT
  const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, global.jwtSecret, { expiresIn: '1h' });
  
  // إرسال التوكن للمستخدم (يمكن تخزينه في الـ cookie أو في رأس الـ Authorization)
  res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600 * 1000 }); // إرسال التوكن عبر الـ cookies
  res.redirect('/dashboard');  // إعادة التوجيه إلى صفحة لوحة التحكم
});

export default router;

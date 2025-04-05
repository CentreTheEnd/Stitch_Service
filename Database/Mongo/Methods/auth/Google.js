import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../model.js';  // تأكد من أن المسار صحيح
import crypto from 'crypto';

const router = express.Router();

// تعيين القيم المطلوبة في global

global.redirectUri = 'https://stitch-api.vercel.app/api/v1/auth/google/callback';  // عيّن قيمة الرابط المعاد توجيه المستخدم إليه

// إعداد passport
passport.use(new GoogleStrategy({
  clientID: global.googleID,  // استخدام معرف Google في global
  clientSecret: global.googleSecret,  // استخدام السر من global
  callbackURL: global.redirectUri  // استخدام الرابط من global
}, async (accessToken, refreshToken, profile, done) => {
  // البحث عن المستخدم في قاعدة البيانات بناءً على البريد الإلكتروني
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

  // إذا كان المستخدم موجودًا، قم بإرجاعه
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
router.use(session({
  secret: (req) => req.user ? req.user.token : 'default_secret',  // استخدام الـ token للمستخدم في الـ secret
  resave: false,
  saveUninitialized: true,
}));

router.use(passport.initialize());
router.use(passport.session());

// إعادة توجيه المستخدم إلى Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// التعامل مع رد Google بعد التوثيق
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',  // في حالة الفشل، التوجيه إلى صفحة تسجيل الدخول
  successRedirect: '/dashboard'  // في حالة النجاح، التوجيه إلى لوحة التحكم
}));



export default router;

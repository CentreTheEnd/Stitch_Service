import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';  // إضافة مكتبة JWT
import User from '../../model.js';  // تأكد من أن المسار صحيح
import crypto from 'crypto';

const router = express.Router();

// تعيين القيم المطلوبة في global
global.redirectUri = 'https://stitch-api.vercel.app/api/v1/auth/google/callback';  // عيّن قيمة الرابط المعاد توجيه المستخدم إليه

// توليد jwtSecret عشوائي باستخدام crypto
global.jwtSecret = crypto.randomBytes(64).toString('hex');  // توليد 64 بايت وتحويله إلى سلسلة هكساديسمل

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

// إنشاء JWT بعد التوثيق
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',  // في حالة الفشل، التوجيه إلى صفحة تسجيل الدخول
}), (req, res) => {
  // بعد نجاح التوثيق، إنشاء JWT
  const user = req.user;
  
  // إنشاء توكن JWT
  const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, global.jwtSecret, { expiresIn: '1h' });
  
  // إرسال التوكن للمستخدم (يمكن تخزينه في الـ cookie أو في رأس الـ Authorization)
  res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600 * 1000 }); // إرسال التوكن عبر الـ cookies
  // أو يمكن إرسال التوكن في الـ header
  // res.setHeader('Authorization', `Bearer ${token}`);
  
  // إعادة التوجيه إلى لوحة التحكم أو الصفحة الرئيسية
  res.redirect('/dashboard');  // أو إعادة التوجيه إلى صفحة أخرى
});

// مسار لتوثيق المستخدم باستخدام JWT
router.get('/profile', (req, res) => {
  const token = req.cookies.token;  // الحصول على التوكن من الـ cookies (أو من الـ header)
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, global.jwtSecret);
    res.status(200).json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

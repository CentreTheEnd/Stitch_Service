import express from 'express';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import User from '../../model.js';  // أو المسار الخاص بنموذج المستخدم لديك
import crypto from 'crypto';

const router = express.Router();

// إعداد استراتيجية Discord
passport.use(new DiscordStrategy({
  clientID: global.discordID,  // استخدام المتغير global لتخزين معرّف العميل
  clientSecret: global.discordSecret,  // استخدام المتغير global لتخزين السر
  callbackURL: 'https://stitch-api.vercel.app/api/v1/auth/discord/callback',  // الرابط الموجه للـ callback
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { username, email, avatar } = profile;

    if (!email) {
      return done(null, false, { message: 'Discord account missing email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUsername = username + crypto.randomBytes(2).toString('hex');
      const apiKey = crypto.randomBytes(16).toString('hex');
      const token = crypto.randomBytes(32).toString('hex');

      user = new User({
        name: username,
        email,
        username: newUsername,
        loginType: 'discord',
        apiKey,
        token,
        avatar: avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatar}.png` : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
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

// إعادة توجيه المستخدم إلى Discord OAuth
router.get('/discord', passport.authenticate('discord'));

// استلام الكود وإنشاء الحساب عند العودة من Discord
router.get('/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }), 
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Discord OAuth successful',
      user: {
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        apiKey: req.user.apiKey,
        token: req.user.token,
        avatar: req.user.avatar,
        role: req.user.role,
        plan: req.user.plan,
        coins: req.user.coins
      }
    });
  }
);

export default router;

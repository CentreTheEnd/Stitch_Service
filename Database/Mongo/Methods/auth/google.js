import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import User from '../../model.js';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// الخطوة الأولى: إعادة توجيه المستخدم إلى Google OAuth
router.get('/google', (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(redirectUrl);
});

// الخطوة الثانية: استلام الكود وإنشاء الحساب
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Missing authorization code' });
  }

  try {
    // تبادل الكود بـ access_token
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
    });

    const { access_token } = tokenRes.data;

    // جلب بيانات المستخدم
    const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { name, email, picture } = userInfoRes.data;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account missing email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const username = email.split('@')[0] + crypto.randomBytes(2).toString('hex');
      const apiKey = crypto.randomBytes(16).toString('hex');
      const token = crypto.randomBytes(32).toString('hex');

      user = new User({
        name,
        email,
        username,
        loginType: 'google',
        apiKey,
        token,
        avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
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

    return res.status(200).json({
      success: true,
      message: 'Google OAuth successful',
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

  } catch (err) {
    console.error('Google OAuth Error:', err.message);
    return res.status(500).json({ success: false, message: 'Google login failed', error: err.message });
  }
});

export default router;


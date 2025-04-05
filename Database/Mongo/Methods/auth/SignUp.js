import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../model.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Missing name, email or password' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0] + crypto.randomBytes(2).toString('hex');
    const apiKey = crypto.randomBytes(16).toString('hex');
    const token = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      loginType: 'email',
      apiKey,
      token,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
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

    res.status(200).json({
      success: true,
      message: 'User registered successfully',
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
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Signup failed', error: err.message });
  }
});

export default router;

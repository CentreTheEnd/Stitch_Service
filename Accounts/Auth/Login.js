import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../Database/Mongo/models.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Missing email or password' });

  try {
    const user = await User.findOne({ email });

    if (!user || user.loginType !== 'email') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    user.update.last = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
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
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

export default router;

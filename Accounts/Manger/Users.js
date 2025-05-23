
import express from 'express';

const router = express.Router();

router.get('/users', async (req, res) => {
  
  try {
    
const users = await global.db.users.getUsers();
  
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


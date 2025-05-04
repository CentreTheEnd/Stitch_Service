

import express from 'express';

const router = express.Router();

router.get('/genreat/apikey', async (req, res) => {
  
  try {
    
const apikey = await global.db.genrate.APIKey("sayeddaana221166@gmail.com", "key");
  
    res.status(200).json({
      success: true,
      apikey: apikey
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const usedRouterKeys = {
  tag: "Generate image",
  model: "ai4chat",
  description: "AI converts text to image",
  query: {
    q: "text prompt",
    ratio: "number size image",
  },
  limited: 5,
  status: true,
  price: "free"
};

const ai4chat = {
  url: "https://www.ai4chat.co/api/image",
  ratios: [
    "1:1", "16:9", "2:3", "3:2", "4:5", "5:4", "9:16", "21:9", "9:21"
  ],
  image: async (prompt, ratioIndex = 0) => {
    const ratio = ai4chat.ratios[ratioIndex] || "1:1";
    const imageUrl = `${ai4chat.url}/generate?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio}`;

    const response = await fetch(imageUrl);
    const data = await response.json();

    return data.image_link;
  }
};

router.get('/text2image/ai4chat', async (req, res) => {
  try {
    const { q, ratio } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Missing required parameter: ?q=(prompt)' });
    }

    if (typeof ratio === 'undefined') {
      const ratiosList = ai4chat.ratios.map((value, index) => ({
        index,
        ratio: value
      }));
      return res.json({
        status: true,
        message: "Please provide a ratio index using &ratio=number",
        ratios: ratiosList
      });
    }

    const ratioIndex = parseInt(ratio);
    if (isNaN(ratioIndex) || ratioIndex < 0 || ratioIndex >= ai4chat.ratios.length) {
      return res.status(400).json({ error: 'Invalid ratio index.' });
    }

    const imageUrl = await ai4chat.image(q, ratioIndex);

    res.json({
      status: true,
      creator: "ai4chat",
      data: imageUrl,
      prompt: q,
      ratio: ai4chat.ratios[ratioIndex]
    });

  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { usedRouterKeys };
export default router;

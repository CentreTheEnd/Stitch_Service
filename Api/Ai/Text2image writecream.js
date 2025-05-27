import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();

const usedRouterKeys = {
  tag: "Generate image",
  model: "writecream",
  description: "AI converts text to image",
  query: {
    q: "text prompt",
    ratio: "number size image",
  },
  limited: 5,
  status: true,
  price: "free"
};

const CATBOX_UPLOAD_URL = 'https://catbox.moe/user/api.php';

const writecream = {
  url: "https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image",
  ratios: [
    "1:1", "16:9", "2:3", "3:2", "4:5", "5:4", "9:16", "21:9", "9:21"
  ],
  headers: {
    'Host': '1yjs1yldj7.execute-api.us-east-1.amazonaws.com',
    'Connection': 'keep-alive',
    'sec-ch-ua-platform': '"Android"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Android WebView";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?1',
    'Accept': '*/*',
    'Origin': 'https://www.writecream.com',
    'X-Requested-With': 'mark.via.gp',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://www.writecream.com/',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en,ar-EG;q=0.9,ar;q=0.8,en-US;q=0.7'
  },
  image: async (prompt, ratioIndex = 0) => {
    const ratio = writecream.ratios[ratioIndex] || "1:1";
    try {
      const imageUrl = `${writecream.url}?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio}&link=writecream.com`;

      const response = await axios.get(imageUrl, {
        headers: writecream.headers,
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data);
      
      const imageName = `image_writecream.png`;

      const form = new FormData();
      form.append('fileToUpload', imageBuffer, { filename: imageName });
      form.append('reqtype', 'fileupload');

      const uploadRes = await fetch(CATBOX_UPLOAD_URL, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });

      const uploadLink = await uploadRes.text();

      if (!uploadLink.startsWith('https://')) throw new Error('File upload failed: ' + uploadLink);

      return uploadLink;

    } catch (error) {
      throw new Error('Image generation/upload error: ' + error.message);
    }
  }
};

router.get('/text2image/writecream', async (req, res) => {
  try {
    const { q, ratio } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Missing required parameter: ?q=(prompt)' });
    }

    if (typeof ratio === 'undefined') {
      const ratiosList = writecream.ratios.map((value, index) => ({
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
    if (isNaN(ratioIndex) || ratioIndex < 0 || ratioIndex >= writecream.ratios.length) {
      return res.status(400).json({ error: 'Invalid ratio index.' });
    }

    const imageUrl = await writecream.image(q, ratioIndex);

    res.json({
      status: true,
      creator: "writecream",
      data: imageUrl,
      prompt: q,
      ratio: writecream.ratios[ratioIndex]
    });

  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ message: "Error generating image.", error: error.message });
  }
});

export { usedRouterKeys };
export default router;

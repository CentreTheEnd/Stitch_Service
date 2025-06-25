import express from 'express';
import axios from 'axios';

const router = express.Router();

const clean = e => (e = e.replace(/(<br?\s?\/>)/gi, " \n")).replace(/(<([^>] )>)/gi, "");

async function shortener(e) {
  return e;
}

router.get('/Tiktok/lovetik', async (req, res) => {

    const { url } = req.query;
    try {

    if (!url) {
      return res.status(500).json({ 
        status: false,
        author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'يرجي إدخال الرابط',
        example: '?url= link video'
      });
    }
    
    const response = await tiktok(url);
    res.status(200).json({ 
        status: true,
        author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        data: response
        });
    
    } catch (error) {
        res.status(404).json({ 
        status: false,
        author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'حدث خطأ أثناء جلب الملف.',
        error: error.message
        });
    }
});

const usedRouterKeys = {
  tag: "Tiktok",
  model: "lovetik",
  description: "Downloader video from Tiktok",
  query: { 
    url: "url video",
  },
  limited: 5,
  status: true,
  price: "free"
};

export { usedRouterKeys };


export default router;

async function tiktok(url) {
  return new Promise(async (resolve, reject) => {
    try {
      let t = await axios("https://lovetik.com/api/ajax/search", { method: "post", data: new URLSearchParams(Object.entries({ query: url })) });

      const result = {};
      result.title = clean(t.data.desc);
      result.likes = t.data.like || t.data.likes;
      result.author = clean(t.data.author);
      result.author_name = clean(t.data.author_name);
      result.audio_url = t.data.links[3].a || ""
      result.thumbnail = t.data.cover;
      result.imagel = t.data.author_a;
      result.video = t.data.links[2].a || "";
      result.audio = t.data.links[3].a || "";

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

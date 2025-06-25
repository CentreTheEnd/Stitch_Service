import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';


const router = express.Router();



router.get('/Facebook/yt5sIo', async (req, res) => {

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
    
    const response = await yt5sIo(url);
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
  tag: "Facebook",
  model: "yt5sIo",
  description: "Downloader video from Facebook",
  query: { 
    url: "url video",
  },
  limited: 5,
  status: true,
  price: "free"
};

export { usedRouterKeys };


export default router;


async function yt5sIo(url) {
   try {
   const form = new URLSearchParams();
                form.append("q", url);
                form.append("vt", "home");
  const { data } = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
                headers: {
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                
  if (data.status !== "ok") throw new Error("Gagal mengambil data.");
  
  const $ = cheerio.load(data.data);
 
  if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
  const thumb = $('img').attr("src");
  let links = [];
              
              $('table tbody tr').each((_, el) => {
              const quality = $(el).find('.video-quality').text().trim();
              const link = $(el).find('a.download-link-fb').attr("href");
              if (quality && link) links.push({ quality, link });
                    });
              
              if (links.length === 0) throw new Error("Tidak ada video yang dapat diunduh.");

                    return { thumb, video: links[0].link, audio_url: links[0].link };
                } else if (/^(https?:\/\/)?(www\.)?(instagram\.com\/(p|reel)\/).+/i.test(url)) {
                    const video = $('a[title="Download Video"]').attr("href");
                    const thumb = $('img').attr("src");
                    if (!video || !thumb) throw new Error("Video tidak ditemukan.");
                    return { thumb, video, audio_url: video};
                } else {
                    throw new Error("URL tidak valid. Gunakan link Facebook atau Instagram.");
                }
            } catch (error) {
                 throw new Error(error.message);
            }
        }

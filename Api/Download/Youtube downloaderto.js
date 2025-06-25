import fetch from 'node-fetch';
import axios from 'axios';
import express from 'express';

const router = express.Router();

router.get('/Youtube/downloaderto', async (req, res) => {
  try {
    const { url } = req.query; 

    if (!url) {
      return res.status(400).json({ 
        status: false,
        author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'يرجى تقديم رابط للتحميل.',
      });
    }

    const { data } = await downloaderto.download(url, "720")

    res.status(200).json({
      status: true,
      author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
      data: data,
    });

  } catch (error) {
    res.status(500).json({ 
      status: false,
      author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
      message: 'حدث خطأ أثناء التحميل.',
      error: error.message,
    });
  }
});

  
const usedRouterKeys = {
  tag: "YouTube",
  model: "downloaderto",
  description: "Downloader video from YouTube",
  query: { 
    url: "url video",
  },
  limited: 5,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;


const downloaderto = {
    urls: {
      download: "https://p.oceansaver.in/ajax/download.php",
      progress: "https://p.oceansaver.in/api/progress",
      media: "https://dave15.oceansaver.in/pacific/?"
    },
    headers: {
      'Host': 'p.oceansaver.in',
      'Connection': 'keep-alive',
      'sec-ch-ua-platform': '"Android"',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 12; V2027 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.7151.88 Mobile Safari/537.36',
      'sec-ch-ua': '"Android WebView";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'Accept': '*/*',
      'Origin': 'https://downloaderto.com',
      'X-Requested-With': 'mark.via.gp',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://downloaderto.com/',
      'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    formats: [
  { name: 'Audio - MP3', format: 'mp3' },
  { name: 'Audio - M4A', format: 'm4a' },
  { name: 'Audio - WEBM', format: 'webm' },
  { name: 'Audio - AAC', format: 'aac' },
  { name: 'Audio - FLAC', format: 'flac' },
  { name: 'Audio - OPUS', format: 'opus' },
  { name: 'Audio - OGG', format: 'ogg' },
  { name: 'Audio - WAV', format: 'wav' },
  { name: 'Video - MP4 (144p)', format: '144' },
  { name: 'Video - MP4 (240p)', format: '240' },
  { name: 'Video - MP4 (360p)', format: '360' },
  { name: 'Video - MP4 (480p)', format: '480' },
  { name: 'Video - MP4 (720p)', format: '720' },
  { name: 'Video - MP4 (1080p)', format: '1080' },
  { name: 'Video - MP4 (1440p)', format: '1440' },
  { name: 'Video - WEBM (4K)', format: '4k' },
  { name: 'Video - WEBM (8K)', format: '8k' }
],
    async download(url, format = null) {
      try {
        const { urls, headers, formats } = downloaderto;
        const selectformat = formats.find(f => f.format === format);
        if (!selectformat) {
          return {
  success: false,
  error: `Format '${format}' is not supported.`,
  availableFormats: formats.map(f => ({
    label: f.name,
    value: f.format
  }))
};

        }
        const { data } = await axios.get(urls.download, {
          params: {
            copyright: '0',
            format: selectformat.format,
            url
          },
          headers
        });
        const { id, title, info } = data;
        let download_url = null;
        let attempts = 0;
        while (!download_url && attempts < 15) {
          const progressResp = await axios.get(urls.progress, {
            params: { id },
            headers
          });
          download_url = progressResp.data.download_url;
          if (!download_url) await new Promise(res => setTimeout(res, 1000));
          attempts++;
        }

        if (!download_url) {
          return { success: false, error: 'Failed to retrieve download URL after multiple attempts.' };
        }

        const res = {
          title,
          audio_url: download_url,
          thumbnail: info.image,
          image: info.image,
          video: download_url,
          audio: download_url
        };
        return { success: true, data: res };
      } catch (err) {
        
      }
    }
  };

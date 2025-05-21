import express from 'express';
import axios from 'axios';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const usedRouterKeys = {
  tag: "Converter Url",
  model: "local",
  description: "tools convert file to url",
  query: { 
    file: "file buffer, url or base64",
    name: "file name"
  },
  limited: 3,
  status: true,
  price: "free"
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

router.post('/Converter/url/local', upload.single('file'), async (req, res) => {
  try {
    let fileBuffer, fileName;

    if (req.file && req.file.buffer) {
      // 1. ملف مرفوع مباشرًا
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname || `file-${getFormattedTimestamp()}`;

    } else if (req.body.file && typeof req.body.file === 'string') {
      const input = req.body.file.trim();

      // 2. إذا كان رابط
      const isValidUrl = /^https?:\/\/.+/i.test(input);

      if (isValidUrl) {
        const response = await axios.get(input, { responseType: 'arraybuffer' });
        fileBuffer = Buffer.from(response.data);
        const urlParts = input.split('/');
        fileName = req.body.name ? req.body.name : urlParts[urlParts.length - 1];

      } else {
        // 3. إذا كان base64
        const base64Match = input.match(/^data:(.*?);base64,(.*)$/);
        const base64Data = base64Match ? base64Match[2] : input;

        try {
          fileBuffer = Buffer.from(base64Data, 'base64');
          fileName = req.body.name || `file-${getFormattedTimestamp()}`;
        } catch (e) {
          return res.status(400).json({ status: false, error: 'Invalid base64 format' });
        }
      }
    } else {
      return res.status(400).json({ status: false, error: 'No file, URL or base64 provided' });
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return res.status(413).json({
        status: false,
        error: 'File size exceeds the 100MB limit'
      });
    }

    const fileType = await fileTypeFromBuffer(fileBuffer);
    const fileMime = fileType?.mime || 'application/octet-stream';
    const fileExt = fileType?.ext || 'bin';

    if (!fileName.includes('.')) {
    fileName = fileName + '.' + fileExt;
    }

    const { name, url, size, path } = await global.shortLinks.upload(fileBuffer, fileName); 
    
    const links = await global.shortLinks.get();
    links[name] = { name, url, size, path };
    
    await global.shortLinks.save(links);
    
    const link = `https://${req.get('host')}/api/v3/Converter/url/local/view/${name}`;
    
    const file = { name, url: link, size: formatSize(size) };
    
    res.status(200).json({ status: true, file });

  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function getFormattedTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());

  return `${year}_${month}_${day}_${hour}_${minute}_${second}`;
}

export { usedRouterKeys };
export default router;

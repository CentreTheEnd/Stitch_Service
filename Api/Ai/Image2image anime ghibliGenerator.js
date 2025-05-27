import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { fileTypeFromBuffer } from 'file-type';
import multer from 'multer';

const router = express.Router();
const upload = multer();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const usedRouterKeys = {
  tag: "converter image",
  model: "ghibliGenerator",
  description: "AI converts image to image",
  query: {
    q: "image URL or local path",
    size: "optional aspect ratio key, e.g. '1:1', '3:2'",
    prompt: "image converter prompt"
  },
  limited: 5,
  status: true,
  price: "free"
};

const ghibliGenerator = {
  api: {
    base: 'https://ghibli-image-generator.com',
    imageBase: 'https://imgs.ghibli-image-generator.com',
    endpoints: {
      signed: '/api/trpc/uploads.signedUploadUrl?batch=1',
      create: '/api/trpc/ai.create4oImage?batch=1',
      task: '/api/trpc/ai.getTaskInfo?batch=1'
    }
  },
  
  defaults: {
    prompt: "restyle image in studio ghibli style, keep all details",
    fmt: ['jpg', 'jpeg', 'png', 'webp'],
    size: {
      "1:1": "Square - 1:1",
      "3:2": "Landscape - 3:2",
      "2:3": "Portrait - 2:3"
    }
  },

  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'origin': 'https://ghibli-image-generator.com',
    'referer': 'https://ghibli-image-generator.com/',
    'user-agent': 'Postify/1.0.0'
  },

  axiosInstance: axios.create({
    timeout: 30000,
    validateStatus: status => status >= 200 && status < 300
  }),

  isImage: (input) => {
    if (!input || input.trim() === '') return { valid: false, status: false, error: "Input is empty" };
    try {
      if (/^https?:\/\//.test(input)) {
        const ext = input.split('.').pop().toLowerCase();
        if (!ghibliGenerator.defaults.fmt.includes(ext)) return { valid: false, status: false, error: `Unsupported format: ${ext}` };
        return { valid: true, status: true, isUrl: true };
      }
      if (!fs.existsSync(input)) return { valid: false, status: false, error: "File not found" };
      const ext = path.extname(input).substring(1).toLowerCase();
      if (!ghibliGenerator.defaults.fmt.includes(ext)) return { valid: false, status: false, error: `Unsupported format: ${ext}` };
      const stats = fs.statSync(input);
      if (stats.size === 0) return { valid: false, status: false, error: "File is empty" };
      return { valid: true, status: true, isUrl: false };
    } catch (err) {
      return { valid: false, status: false, error: err.message };
    }
  },

  isSize: (size) => {
    if (!size) return true;
    if (!ghibliGenerator.defaults.size[size]) {
      return { valid: false, error: `Invalid size. Choose one of: ${Object.keys(ghibliGenerator.defaults.size).join(', ')}` };
    }
    return true;
  },

  process: async (imageUrl, options = {}) => {
    try {
      const response = await ghibliGenerator.axiosInstance.post(
        `${ghibliGenerator.api.base}${ghibliGenerator.api.endpoints.create}`,
        { "0": { json: { imageUrl, prompt: options.prompt || ghibliGenerator.defaults.prompt, size: options.size || '1:1' } } },
        { headers: ghibliGenerator.headers }
      );
      const taskId = response.data[0]?.result?.data?.json?.data?.taskId;
      return taskId ? { status: true, result: { taskId } } : { status: false, result: { error: 'No taskId' } };
    } catch (err) {
      return { status: false, result: { error: err.message } };
    }
  },

  waitForTask: async (taskId) => {
    let attempts = 0;
    while (attempts < 30) {
      try {
        const resp = await ghibliGenerator.axiosInstance.get(
          `${ghibliGenerator.api.base}${ghibliGenerator.api.endpoints.task}`,
          { params: { input: JSON.stringify({ "0": { json: { taskId } } }) }, headers: ghibliGenerator.headers }
        );
        const data = resp.data[0]?.result?.data?.json?.data;
        if (data.status === 'SUCCESS' && data.successFlag === 1) {
          return { status: true, code: 200, result: { url: data.response.resultUrls[0], taskId } };
        }
        if (['GENERATE_FAILED','FAILED'].includes(data.status)) {
          return { status: false, code: 500, result: { error: 'Generation failed' } };
        }
        await new Promise(r => setTimeout(r, 5000));
        attempts++;
      } catch (err) {
        if (attempts >= 29) return { status: false, code: 408, result: { error: 'Timeout' } };
        await new Promise(r => setTimeout(r, 2000));
        attempts++;
      }
    }
  },

  generate: async (input, options = {}) => {
    const check = ghibliGenerator.isImage(input);
    if (!check.valid) return { status: false, code: 400, result: { error: check.error } };
    if (options.size) {
      const sz = ghibliGenerator.isSize(options.size);
      if (sz !== true) return { status: false, code: 400, result: sz };
    }
    try {
      let buffer;
      let ext;
      let mime;
      if (check.isUrl) {
        const r = await axios.get(input, { responseType: 'arraybuffer' });
        buffer = r.data;
        const ft = await fileTypeFromBuffer(buffer);
        ext = ft?.ext || 'jpg';
        mime = ft?.mime || 'image/jpeg';
      } else {
        buffer = fs.readFileSync(input);
        ext = path.extname(input).substring(1);
        mime = `image/${ext}`;
      }
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const filename = `original/${hash}_${Date.now()}.${ext}`;
      const uploadRes = await ghibliGenerator.axiosInstance.post(
        `${ghibliGenerator.api.base}${ghibliGenerator.api.endpoints.signed}`,
        { "0": { json: { path: filename, bucket: 'ghibli-image-generator' } } },
        { headers: ghibliGenerator.headers }
      );
      const uploadUrl = uploadRes.data[0]?.result?.data?.json;
      if (!uploadUrl) throw new Error('No upload URL');
      await axios.put(uploadUrl, buffer, { headers: { 'Content-Type': mime } });
      const imageUrl = `${ghibliGenerator.api.imageBase}/${filename}`;
      const proc = await ghibliGenerator.process(imageUrl, options);
      return proc.status ? await ghibliGenerator.waitForTask(proc.result.taskId) : { status: false, code: 500, result: { error: 'Process error' } };
    } catch (err) {
      return { status: false, code: err.response?.status || 500, result: { error: err.message } };
    }
  }
};


router.post('/image2image/anime/ghibliGenerator', upload.single('file'), async (req, res) => {
  try {
    let fileBuffer, fileName;

    // استلام الملف من رفع مباشر
    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname || `file-${getFormattedTimestamp()}`;

    } else if (req.body.file && typeof req.body.file === 'string') {
      const input = req.body.file.trim();
      const isValidUrl = /^https?:\/\/.+/i.test(input);

      if (isValidUrl) {
        // استلام الملف من رابط
        const response = await axios.get(input, { responseType: 'arraybuffer' });
        fileBuffer = Buffer.from(response.data);
        const urlParts = input.split('/');
        fileName = req.body.name ? req.body.name : urlParts[urlParts.length - 1];

      } else {
        // استلام الملف بصيغة base64
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

    const fileType = await fileTypeFromBuffer(fileBuffer);
    const fileMime = fileType?.mime || 'application/octet-stream';
    const fileExt = fileType?.ext || 'bin';

    if (!fileName.includes('.')) {
      fileName = fileName + '.' + fileExt;
    }

    // تحقق من الامتداد المدعوم (يمكن تعديلها حسب الحاجة)
    if (!ghibliGenerator.defaults.fmt.includes(fileExt.toLowerCase())) {
      return res.status(400).json({ status: false, error: `Unsupported file format: .${fileExt}` });
    }

    const tempFilePath = `/tmp/${crypto.randomUUID()}.${fileExt}`;
    fs.writeFileSync(tempFilePath, fileBuffer);

    const ghibliResult = await ghibliGenerator.generate(tempFilePath, { size: req.body.size, prompt: req.body.prompt });
    
    fs.unlinkSync(tempFilePath);
    
    res.status(ghibliResult.code || 200).json(ghibliResult);
    
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }

});


function getFormattedTimestamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}${m}${day}${h}${min}${s}`;
}

export default router;
export { usedRouterKeys };

import express from 'express';
import axios from 'axios';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();

router.get('/text2speech', async (req, res) => {
  const { q, gender, name, key, s1, s2, s3 } = req.query;
  const genders = ["female", "male"];

  if (!q) {
    return res.status(400).json({ status: false, message: 'من فضلك أدخل النص (q).' });
  }

  if (!gender || !genders.includes(gender.toLowerCase())) {
    return res.status(400).json({ status: false, message: `من فضلك اختر نوع الصوت (gender) من: ${genders.join(', ')}` });
  }

  try {
    const models = await gatModels();
    const selectedGender = gender.toLowerCase();
    const genderModels = models[selectedGender];

    if (!name) {
      const namesList = Object.keys(genderModels);
      return res.status(400).json({ status: false, message: `الأسماء المتاحة لجنس "${selectedGender}"`, names: namesList });
    }

    if (!key || key !== '2004') {
    return res.status(400).json({ status: false, message: 'من فضلك أدخل المفتاح (key).' });
    }

    const voiceData = genderModels[name];
    if (!voiceData) {
      return res.status(404).json({ status: false, message: `الصوت "${name}" غير موجود في قائمة ${selectedGender}.` });
    }

    const voiceId = voiceData.id;
    
    const data = await textToSpeech(q, voiceId, s1, s2, s3);

    return res.status(200).json({ status: true, author: "sayed-hamdey", data: data });

  } catch (error) {
    return res.status(500).json({ status: false, message: 'حدث خطأ أثناء تحويل النص أو رفع الصوت.', error: error.message });
  }
});


const usedRouterKeys = {
  tag: "ai speech",
  description: "ai convert text to speech ",
  query: { 
    q: "text",
    gender: "Voice gender",
    name: "Speaker's name",
    s1: "Speed of sound",
    s2: "stability of sound",
    s3: "similarity of sound",
    key: "key lock"
  },
  limited: 5,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;



async function textToSpeech(text, voiceid, voicespeed, voicestability, voicesimilarity) {

  try {
  
  const speed = voicespeed || 0.8;
  const stability = voicestability || 0.85;
  const similarity = voicesimilarity || 0.88;

/*  const models = [
  "eleven_v2_flash",
  "eleven_flash_v2",
  "eleven_turbo_v2_5",
  "eleven_multilingual_v1",
  "eleven_multilingual_v2",
  "eleven_v2_5_flash",
  "eleven_flash_v2_5",
  "eleven_turbo_v2"
]; */

    const models = [
  "eleven_multilingual_v1",
  "eleven_multilingual_v2"
];

  const model = models[Math.floor(Math.random() * models.length)];

  const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/${Math.floor(Math.random() * 700) + 500}.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20) + 60}.0.3163.100 Safari/${Math.floor(Math.random() * 20) + 60}.36`;
    
  const response = await axios.post('https://api.elevenlabs.io/v1/text-to-speech/' + voiceid,
  { 
  text: text, 
  model_id: model, 
  voice_settings: { 
    stability: stability,
    similarity_boost: similarity,
    speed: speed 
  } 
  }, 
  { 
  params: { allow_unauthenticated: '1' }, 
  headers: { 'Content-Type': 'application/json', 'Origin': 'https://elevenlabs.io', 'Referer': 'https://elevenlabs.io/', 'User-Agent': userAgent, 'Accept': '*/*' }, 
  responseType: 'arraybuffer' });
  
    const audioBuffer = response.data;
    const { ext } = await fileTypeFromBuffer(audioBuffer);
    const form = new FormData();
    form.append('fileToUpload', audioBuffer, `voice.${ext}`);
    form.append('reqtype', 'fileupload');
    
    const uploadRes = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    const uploadLink = await uploadRes.text();
    if (!uploadLink.startsWith('https://')) throw new Error('فشل رفع الملف');
    return uploadLink;
    
  } catch (error) {
    throw new Error( 'خطا: ' + error.message);
  }

}


async function gatModels() {
try {
let { data } = await axios.get("https://api.elevenlabs.io/v1/voices");

const voices = data.voices;
const allmodel = {
  male: {},
  female: {}
};

for (const voice of voices) {
  const gender = voice.labels?.gender?.toLowerCase();
  const info = {
    id: voice.voice_id,
    language: voice.fine_tuning?.language || 'en',
    preview: voice.preview_url
  };

  if (gender === 'male') {
    allmodel.male[voice.name] = info;
  } else if (gender === 'female') {
    allmodel.female[voice.name] = info;
  }
}

return allmodel; 
  } catch (error) {
    throw new Error( 'خطا: ' + error.message);
}
  
}

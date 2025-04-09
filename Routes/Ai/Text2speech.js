import express from 'express';
import axios from 'axios';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();

router.get('/text2speech', async (req, res) => {
  const { q, gender, name, speed, stability, similarity } = req.query;
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

    const voiceData = genderModels[name];
    if (!voiceData) {
      return res.status(404).json({ status: false, message: `الصوت "${name}" غير موجود في قائمة ${selectedGender}.` });
    }

    const voiceId = voiceData.id;
    const data = await textToSpeech(q, voiceId, speed, stability, similarity);

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
    speed: "speed of sound",
    stability: "stability of sound",
    similarity: "similarity of sound",
    key: "key lock"
  },
  limited: 5,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;



async function textToSpeech(text, id, voicespeed, voicestability, voicesimilarity) {

let userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/${Math.floor(Math.random() * 700) + 500}.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20) + 60}.0.3163.100 Safari/${Math.floor(Math.random() * 20) + 60}.36`;

const speed = voicespeed || 1.8;
const stability = voicestability || 0.85;
const similarity_boost = voicesimilarity || 0.88;

const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${id}`;
const body = { 
    text: text, 
    model_id: 'eleven_multilingual_v2', 
    voice_settings: {
     // stability: stability,
     //  similarity_boost: similarity_boost,
      speed: speed
    }
    };
    
    const headers = { 
    params: { 
    allow_unauthenticated: '1' 
    }, 
    headers: { 
    'Content-Type': 'application/json', 
    'Origin': 'https://elevenlabs.io', 
    'Referer': 'https://elevenlabs.io/', 
    'User-Agent': userAgent, 
    'Accept': '*/*' 
    }, 
    responseType: 'arraybuffer' 
    };

try {
    const response = await axios.post(apiUrl, 
    body, headers);
    const audioBuffer = response.data;
    const audioUrl = await voiceToUrl(audioBuffer);
    
    return audioUrl;
    
  } catch (error) {
    throw new Error(error.message);
  }


}

async function voiceToUrl(media) {
try {
    const { ext } = await fileTypeFromBuffer(media);
    const form = new FormData();
    form.append('fileToUpload', media, `voice.${ext}`);
    form.append('reqtype', 'fileupload');
    const uploadRes = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    const uploadLink = await uploadRes.text();
    if (!uploadLink.startsWith('https://')) throw new Error('فشل رفع الملف');
    return uploadLink;
     } catch (error) {
     throw new Error(error.message);
     }

}

async function gatModels() {

let { data } = await axios.get("https://api.elevenlabs.io/v1/voices");

const voices = data.voices;
const allmodel = {
  male: {},
  fmale: {}
};

for (const voice of voices) {
  const gender = voice.labels?.gender?.toLowerCase();
  const info = {
    id: voice.voice_id,
    language: voice.fine_tuning?.language || 'unknown',
    preview: voice.preview_url
  };

  if (gender === 'male') {
    allmodel.male[voice.name] = info;
  } else if (gender === 'female') {
    allmodel.fmale[voice.name] = info;
  }
}

return allmodel;
}

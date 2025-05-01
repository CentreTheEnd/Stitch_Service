import express from 'express';
import axios from 'axios';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();

router.get('/text2speech/vidnoz', async (req, res) => {
  const { q, language, speed } = req.query;
  
  if (!q) {
    return res.status(400).json({ status: false, message: 'من فضلك أدخل النص (q).' });
  }
  
  const voiceLanguage = language || "en";
  const voiceSpeed = speed || 1;
  
  const textToSpeechData = {
        "character_voice": "21",
        "script_voice": "",
        "duration": 0,
        "lang": voiceLanguage,
        "is_tts": 0,
        "text": q,
        "speed": voiceSpeed,
        "language": "en-US",
        "type": 1
    };

  try {
    
    const taskId = await createTextToSpeechTask(textToSpeechData);
    
    if (taskId) {
        const finalStatus = await pollTaskStatus(taskId);
        
        const data = finalStatus.data.additional_data.merge_url;
        
        return res.status(200).json({ status: true, author: "sayed-hamdey", data: data });

    }

    
  } catch (error) {
    return res.status(500).json({ status: false, message: 'حدث خطأ أثناء تحويل النص أو رفع الصوت.', error: error.message });
  }
});


const usedRouterKeys = {
  tag: "Genreat voice",
  model: "vidnoz",
  description: "ai convert text to speech ",
  query: { 
    q: "text",
    language: "Language of sound",
    speed: "Speed of sound",
  },
  limited: 5,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;


const API_URL = "https://tool-api.vidnoz.com/ai/tool/celebrity-ai-voice";
const GET_TASK_URL = "https://tool-api.vidnoz.com/ai/tool/get-task";

const headers = {
    "accept": " _/_ ",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "authorization": "Bearer null",
    "content-type": "application/json",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "x-task-version": "2.0.0",
    "Referer": "https://www.vidnoz.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};

async function createTextToSpeechTask(reqdata) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(reqdata)
        });

        const responseData = await response.json();
        if (responseData.code === 200) {
            return responseData.data.task_id;
        } else {
            throw new Error("Failed to create task");
        }
    } catch (error) {
        console.error("Error creating task:", error); 
        throw new Error("Failed to create task " + error);
    }
}

async function getTaskStatus(taskId) {
    try {
        const response = await fetch(GET_TASK_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ id: taskId })
        });

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error("Error getting task status:", error);
        throw new Error("Error getting task status:" + error);
    }
}

async function pollTaskStatus(taskId) {
    let status = -1;
    let data = {};
    const interval = 5000;

    while (status !== 0) {
        data = await getTaskStatus(taskId);
        status = data.data.status;

        if (status !== 0) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    return data;
}

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/Bot', async (req, res) => {
    try {
        const { q, pompart } = req.query;

        if (!q) {
            return res.status(400).json({ 
            status: false,
            author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
            message: 'فين سؤالك يا موز',
            example: '?q= add text query questions'
            });
        }

        if (!pompart) {
            return res.status(400).json({ 
            status: false,
            author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
            message: 'فين وصف الشخصية يا موز',
            example: '&pompart= add text query pompart'
            });
        }
        
        const now = new Date();
        const formattedDate = now.toLocaleString('ar-EG', {
        timeZone: 'Africa/Cairo',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
        });
        
    const text = `
    ${pompart}
    خد بالك إن الوقت الحالي هو ${formattedDate} علشان لو حد سألك.`.trim();

  
    const data = await chat(q, text);
    
    res.status(200).json({
            status: true,
            author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
            data: data
        });
        
        
    } catch (error) {
        res.status(500).json({ 
        status: false,
        author: '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'حدث خطأ أثناء جلب الإجابة.',
        error: error.message
        });
    }
});

const usedRouterKeys = {
  tag: "ai chat",
  description: "ai chat language Arabic Egypt",
  query: { 
    q: "Question text",
    pompart: "text pompart"
  },
  limited: 2,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;

async function chat(question, prompt) {
  const response = await axios({
    method: "POST",
    url: "https://chateverywhere.app/api/chat",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "_ga=GA1.1.34196701.1707462626; _ga_ZYMW9SZKVK=GS1.1.1707462625.1.0.1707462625.60.0.0; ph_phc_9n85Ky3ZOEwVZlg68f8bI3jnOJkaV8oVGGJcoKfXyn1_posthog=%7B%22distinct_id%22%3A%225aa4878d-a9b6-40fb-8345-3d686d655483%22%2C%22%24sesid%22%3A%5B1707462733662%2C%22018d8cb4-0217-79f9-99ac-b77f18f82ac8%22%2C1707462623766%5D%7D",
      "Origin": "https://chateverywhere.app",
      "Referer": "https://chateverywhere.app/id",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    },
    data: {
      model: {
        id: "gpt-3.5-turbo-0613",
        name: "GPT-3.5",
        maxLength: 12000,
        tokenLimit: 4000,
      },
      prompt: prompt,
      messages: [
        {
          pluginId: null,
          content: question,
          role: "user"
        }
      ]
    }
  });

  return response.data;
}

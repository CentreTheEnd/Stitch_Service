import fetch from 'node-fetch';
import express from 'express';

const router = express.Router();

// تعريف المسار الرئيسي
router.get('/Youtube/ochinpo', async (req, res) => {
  try {
    const { q } = req.query; // استخراج نص البحث من الاستعلام

    if (!q) {
      return res.status(400).json({ 
        status: false,
        author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'يرجى تقديم نص أو رابط للتحميل.',
      });
    }

    // استدعاء الدالة لتحميل البيانات
    const data = await download(q);

    // إرسال استجابة ناجحة
    res.status(200).json({
      status: true,
      author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
      data: data,
    });

  } catch (error) {
    // إرسال استجابة في حالة وجود خطأ
    res.status(500).json({ 
      status: false,
      author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
      message: 'حدث خطأ أثناء التحميل.',
      error: error.message,
    });
  }
});

export default router;

// دالة لتحميل البيانات من API
async function download(query) {
  const downloadUrl = `https://ochinpo-helper.hf.space/yt?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`فشل الاتصال بالخدمة: ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.success || !json.result) {
      throw new Error('لم يتم العثور على النتائج.');
    }

    // استخراج البيانات المطلوبة من الاستجابة
    const {
      title,
      description,
      thumbnail,
      timestamp,
      ago,
      views,
      url,
      author,
      download,
    } = json.result;

    return {
      title,
      description: description || 'لا يوجد وصف',
      thumbnail,
      time: timestamp || 'غير متوفرة',
      ago: ago || 'غير متوفر',
      views: views || 'غير متوفرة',
      url,
      author: author.name || 'غير معروف',
      channel: author.url || '#',
      video: download.video || null,
      audio: download.audio || null,
    };

  } catch (error) {
    throw new Error(`خطأ أثناء جلب البيانات: ${error.message}`);
  }
}

import express from 'express';
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { saveSession, getSession, deleteSession } from '../../Database/Mongo/Models/whatsClient.js';
import mongoose from 'mongoose';

const router = express.Router();


// مسار POST لإنشاء الجلسة باستخدام رقم الهاتف فقط
router.post('/create-session', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'رقم الهاتف مطلوب لإنشاء الجلسة' });
  }

  try {
    // الاتصال بـ Baileys لبدء الجلسة باستخدام رقم الهاتف
    const { state, saveCreds } = await useMultiFileAuthState('tmp');
    const conn = makeWASocket({
      creds: state.creds,
      keys: state.keys,
    });

    // بدأ الاتصال وطلب الكود المكون من 8 أرقام
    if (phoneNumber) {
      const pairingCode = await conn.requestPairingCode(phoneNumber);
      const formattedCode = pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode;

      console.log(`تم إنشاء الكود: ${formattedCode}`);
      res.status(201).json({ message: 'تم إنشاء الجلسة بنجاح', pairingCode: formattedCode });
      
      // حفظ الجلسة في MongoDB
      await saveSession(phoneNumber, state.creds, state.keys);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الجلسة' });
  }
});

// مسار GET لجلب الجلسة باستخدام رقم الهاتف
router.get('/sessions/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const session = await getSession(phoneNumber);

    if (!session) {
      return res.status(404).json({ error: 'الجلسة غير موجودة' });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الجلسة' });
  }
});

// مسار DELETE لحذف الجلسة باستخدام رقم الهاتف
router.delete('/sessions/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    await deleteSession(phoneNumber);
    res.status(200).json({ message: 'تم حذف الجلسة بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الجلسة' });
  }
});

// مسار POST لإرسال رسالة عبر WhatsApp
router.post('/send-message', async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'مفقود بيانات الرسالة' });
  }

  try {
    const session = await getSession(phoneNumber);

    if (!session) {
      return res.status(404).json({ error: 'الجلسة غير موجودة' });
    }

    const { creds, keys } = session;
    const { state, saveCreds } = await useMultiFileAuthState('tmp');
    const conn = makeWASocket({ creds: state.creds, keys });

    await conn.connect(); // الاتصال بالواتساب
    await conn.sendMessage(phoneNumber, { text: message });

    res.status(200).json({ message: 'تم إرسال الرسالة بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الرسالة' });
  }
});

export default router;

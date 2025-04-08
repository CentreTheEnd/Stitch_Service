import express from 'express';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Pino from 'pino';  

const { 
      DisconnectReason, 
      useMultiFileAuthState, 
      fetchLatestBaileysVersion, 
      makeCacheableSignalKeyStore, 
      jidNormalizedUser, 
      PHONENUMBER_MCC 
    } = await import("@whiskeysockets/baileys");
import { saveSession, getSession, deleteSession } from '../../Database/Mongo/Models/whatsClient.js';


const router = express.Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
global.authFile = '../../tmp';

// مسار POST لإنشاء الجلسة باستخدام رقم الهاتف فقط
router.post('/create-session', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'رقم الهاتف مطلوب لإنشاء الجلسة' });
  }

  try {
    const numeroTelefono = phoneNumber.replace(/[^0-9]/g, '');

    if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
      return res.status(400).json({ error: 'الرجاء إدخال الرقم مع كود الدولة الصحيح' });
    }

    const authPath = join(__dirname, global.authFile); 

 /*   if (!fs.existsSync(authPath)) {
      try {
        fs.mkdirSync(authPath, { recursive: true });
      } catch (error) {
        return res.status(500).json({ error: 'خطأ في إنشاء المجلد', details: error });
      }
    } */

    const credsPath = join(authPath, numeroTelefono + '_creds.json');

    if (!fs.existsSync(credsPath)) {
      const { state, saveCreds } = await useMultiFileAuthState(credsPath);
      const { version } = await fetchLatestBaileysVersion();

      const client = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: Pino({ level: 'silent' }), 
        waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        version,
        browser: ['TheEnd-MD', 'Safari', '2.0.0'],
      });

      client.ev.on('creds.update', saveCreds);

      let codigo = await client.requestPairingCode(numeroTelefono); 
      codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo;

      await client.sendMessage(numeroTelefono + '@s.whatsapp.net', { text: `رمز التحقق الخاص بك هو: ${codigo}` });

      await saveSession(numeroTelefono, state.creds, state.keys);

      return res.status(200).json({ verificationCode: codigo });
    } else {
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      const { version } = await fetchLatestBaileysVersion();

      const client = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        logger: Pino({ level: 'silent' }), 
        waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        version,
        browser: ['TheEnd-MD', 'Safari', '2.0.0'],
      });

      client.ev.on('creds.update', saveCreds);

      return res.status(200).json({ message: 'الجلسة موجودة مسبقًا' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الجلسة', error: error });
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

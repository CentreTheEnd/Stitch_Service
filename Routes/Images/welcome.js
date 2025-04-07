import fs from 'fs';
import axios from 'axios';
import express from 'express';
import { createCanvas, loadImage, registerFont } from 'canvas';

const router = express.Router();

const fontUrl = 'https://files.catbox.moe/2m1c7i.ttf';
const outPathImage = '/tmp/welcome-image.png';
const outPathFont = '/tmp/font.ttf';

router.get('/welcome', async (req, res) => {
  const { background, icon, name, group, creator, members, description, iswelcome, text, theme } = req.query;

  try {
    const { data: fontData } = await axios.get(fontUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(outPathFont, Buffer.from(fontData));
    registerFont(outPathFont, { family: 'CustomFont' });

    const buffer = await createWelcomImage(background, icon, name, group, creator, members, description, iswelcome, text, theme);
    fs.writeFileSync(outPathImage, buffer);

    res.status(200)
      .set('Content-Type', 'image/png')
      .sendFile(outPathImage, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          return res.status(500).json({
            status: false,
            message: 'حدث خطأ أثناء إرسال الملف.',
            error: err.message
          });
        }
        fs.unlinkSync(outPathFont);
        fs.unlinkSync(outPathImage);
      });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      status: false,
      message: 'حدث خطأ أثناء معالجة الطلب.',
      error: error.message
    });
  }
});

const usedRouterKeys = {
  tag: "Bot",
  description: "Create welcome images for users in WhatsApp groups.",
  query: { 
    background: "url image group", 
    icon: "url image user",
    name: "name user", 
    group: "name group", 
    creator: "Group creator name", 
    members: "Number of group members", 
    description: "Group description", 
    iswelcome: "welcome = true", 
    theme: "....",
    text: "additional text under welcome message"
  },
  limited: 2,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;

function getThemeColors(theme) {
  const themes = {
    classic: {
      bg: '#ffffff', // خلفية بيضاء
      accent: '#444', // لون أكسنت داكن
      text: '#1c1c1c', // نص داكن
    },
    dark: {
      bg: '#121212', // خلفية داكنة
      accent: '#bb86fc', // اللون الأرجواني الفاتح
      text: '#e0e0e0', // نص باللون الفاتح
    },
    light: {
      bg: '#ffffff', // خلفية بيضاء
      accent: '#03a9f4', // لون أكسنت أزرق فاقع
      text: '#212121', // نص داكن
    },
    vibrant: {
      bg: '#ffeb3b', // خلفية صفراء زاهية
      accent: '#ff5722', // أكسنت برتقالي قوي
      text: '#00bcd4', // نص أزرق فاقع
    },
    retro: {
      bg: '#d50000', // خلفية حمراء زاهية
      accent: '#ffc107', // أكسنت أصفر داكن
      text: '#ff4081', // نص وردي فاقع
    },
    neon: {
      bg: '#000000', // خلفية سوداء
      accent: '#39ff14', // أكسنت نيون أخضر
      text: '#ff007f', // نص نيون وردي
    },
    pastel: {
      bg: '#fce4ec', // خلفية وردية فاتحة
      accent: '#ffb3c1', // أكسنت وردي هادئ
      text: '#bb2d3b', // نص بلون وردي داكن
    },
    gradient: {
      bg: 'linear-gradient(45deg, #ff6f00, #ff8f00)', // خلفية بتدرج بين البرتقالي والأصفر
      accent: '#ffeb3b', // أكسنت أصفر زاهي
      text: '#ffffff', // نص أبيض
    },
    cyberpunk: {
      bg: '#2c3e50', // خلفية داكنة مع تأثيرات ضوء
      accent: '#e74c3c', // أكسنت أحمر فاتح
      text: '#8e44ad', // نص بنفسجي مائل للرمادي
    },
    nature: {
      bg: '#388e3c', // خلفية خضراء
      accent: '#2e7d32', // أكسنت أخضر داكن
      text: '#1b5e20', // نص أخضر داكن جدًا
    },
    ocean: {
      bg: '#0277bd', // خلفية زرقاء كالمحيط
      accent: '#0288d1', // أكسنت أزرق غامق
      text: '#b3e5fc', // نص أزرق فاتح
    },
    old: {
      bg: '#f4e1d2', // خلفية بيج قديمة
      accent: '#6a4f47', // أكسنت بني داكن
      text: '#3e2a47', // نص بني داكن مائل إلى البنفسجي
    },
    custom: (customColors) => {
      return {
        bg: customColors.bg || '#1c1c1c',
        accent: customColors.accent || '#444',
        text: customColors.text || '#ffffff',
      };
    },
  };

  // إرجاع الثيم المناسب أو الثيم الافتراضي إذا لم يكن موجودًا
  return themes[theme] || themes['classic'];
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
  const words = text.split(' ');
  let line = '';
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
      if (lines.length === maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1];
    const shortened = lastLine.trim().slice(0, -3);
    lines[maxLines - 1] = shortened + '...';
  }

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + (i * lineHeight));
  }
}

async function createWelcomImage(backgroundUrl, avatarUrl, name, groupName, creatorName, members, description, iswelcome, text, theme = 'default') {
  const width = 900;
  const height = 1600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const { bg, accent, text: textColor } = getThemeColors(theme);

  const background = await loadImage(backgroundUrl);
  ctx.drawImage(background, 0, 0, width, 500);

  const gradient = ctx.createLinearGradient(0, 500, 0, 1000);
  gradient.addColorStop(0, bg);
  gradient.addColorStop(1, '#f0f0f0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 500, width, 1100);

  const avatar = await loadImage(avatarUrl);
  const avatarSize = 200;
  const avatarX = width - avatarSize - 80;
  const avatarY = 520;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.font = 'bold 28px CustomFont';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.fillText('User Name:', 80, 560);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  ctx.fillText(name, 80, 595);

  ctx.font = 'bold 28px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Group Name:', 80, 635);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  ctx.fillText(groupName, 80, 670);

  ctx.font = 'bold 26px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Members:', 80, 730);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  ctx.fillText(`${members}`, 200, 730);

  ctx.font = 'bold 26px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Description:', 80, 800);
  ctx.fillStyle = '#222';
  ctx.font = '22px CustomFont';
  wrapText(ctx, description, 80, 835, width - 160, 30);

  const welcomeText = iswelcome === 'true'
    ? `Welcome ${name} to ${groupName}!`
    : `${name} has left ${groupName}.`;

  const welcomeGradient = ctx.createLinearGradient(width / 2 - 150, 0, width / 2 + 150, 0);
  welcomeGradient.addColorStop(0, accent);
  welcomeGradient.addColorStop(1, '#fff');

  ctx.textAlign = 'center';
  ctx.fillStyle = welcomeGradient;
  ctx.font = 'bold 40px CustomFont';
  ctx.fillText(welcomeText, width / 2, 1100);

  if (text) {
    ctx.fillStyle = '#666';
    ctx.font = '24px CustomFont';
    ctx.fillText(text, width / 2, 1140);
  }

  ctx.fillStyle = '#888';
  ctx.font = 'italic 22px CustomFont';
  ctx.fillText(`Group created by ${creatorName}`, width / 2, height - 40);

  return canvas.toBuffer();
}

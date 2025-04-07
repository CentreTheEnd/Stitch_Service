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
      bg: '#ffffff',
      accent: '#444',
      text: '#1c1c1c',
      shadow: 'rgba(0, 0, 0, 0.2)', // الظل الخفيف
      gradient: 'linear-gradient(45deg, #ffffff, #f0f0f0)'
    },
    dark: {
      bg: '#121212',
      accent: '#bb86fc',
      text: '#e0e0e0',
      shadow: 'rgba(0, 0, 0, 0.7)', // ظل داكن
      gradient: 'linear-gradient(45deg, #121212, #333333)'
    },
    light: {
      bg: '#ffffff',
      accent: '#03a9f4',
      text: '#212121',
      shadow: 'rgba(0, 0, 0, 0.1)', // ظل خفيف
      gradient: 'linear-gradient(45deg, #ffffff, #e0e0e0)'
    },
    vibrant: {
      bg: '#ffeb3b',
      accent: '#ff5722',
      text: '#00bcd4',
      shadow: 'rgba(0, 0, 0, 0.4)', // ظل معتدل
      gradient: 'linear-gradient(45deg, #ffeb3b, #ff5722)'
    },
    retro: {
      bg: '#d50000',
      accent: '#ffc107',
      text: '#ff4081',
      shadow: 'rgba(0, 0, 0, 0.5)', // ظل داكن مع تأثيرات
      gradient: 'linear-gradient(45deg, #d50000, #ffc107)'
    },
    neon: {
      bg: '#000000',
      accent: '#39ff14',
      text: '#ff007f',
      shadow: 'rgba(0, 0, 0, 0.3)', // ظل نيون
      gradient: 'linear-gradient(45deg, #000000, #39ff14)'
    },
    pastel: {
      bg: '#fce4ec',
      accent: '#ffb3c1',
      text: '#bb2d3b',
      shadow: 'rgba(0, 0, 0, 0.1)', // ظل ناعم
      gradient: 'linear-gradient(45deg, #fce4ec, #ffb3c1)'
    },
    gradient: {
      bg: 'linear-gradient(45deg, #ff6f00, #ff8f00)',
      accent: '#ffeb3b',
      text: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.2)', // ظل خفيف
      gradient: 'linear-gradient(45deg, #ff6f00, #ff8f00)'
    },
    cyberpunk: {
      bg: '#2c3e50',
      accent: '#e74c3c',
      text: '#8e44ad',
      shadow: 'rgba(0, 0, 0, 0.6)', // ظل قوي
      gradient: 'linear-gradient(45deg, #2c3e50, #34495e)'
    },
    nature: {
      bg: '#388e3c',
      accent: '#2e7d32',
      text: '#1b5e20',
      shadow: 'rgba(0, 0, 0, 0.2)', // ظل خفيف مع تأثير طبيعي
      gradient: 'linear-gradient(45deg, #388e3c, #2e7d32)'
    },
    ocean: {
      bg: '#0277bd',
      accent: '#0288d1',
      text: '#b3e5fc',
      shadow: 'rgba(0, 0, 0, 0.3)', // ظل ناعم
      gradient: 'linear-gradient(45deg, #0277bd, #0288d1)'
    },
    old: {
      bg: '#f4e1d2',
      accent: '#6a4f47',
      text: '#3e2a47',
      shadow: 'rgba(0, 0, 0, 0.4)', // ظل خفيف
      gradient: 'linear-gradient(45deg, #f4e1d2, #6a4f47)'
    },
    custom: (customColors) => {
      return {
        bg: customColors.bg || '#1c1c1c',
        accent: customColors.accent || '#444',
        text: customColors.text || '#ffffff',
        shadow: customColors.shadow || 'rgba(0, 0, 0, 0.3)',
        gradient: customColors.gradient || 'linear-gradient(45deg, #ffffff, #f0f0f0)'
      };
    },
  };

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
  const { bg, accent, text: textColor, shadow, gradient } = getThemeColors(theme);

  const background = await loadImage(backgroundUrl);
  ctx.drawImage(background, 0, 0, width, 500);

  const gradientFill = ctx.createLinearGradient(0, 500, 0, 1000);
  gradientFill.addColorStop(0, bg);
  gradientFill.addColorStop(1, '#f0f0f0');
  ctx.fillStyle = gradientFill;
  ctx.fillRect(0, 500, width, 1100);

  const avatar = await loadImage(avatarUrl);
  const avatarSize = 200;
  const avatarX = width - avatarSize - 80;
  const avatarY = 520;

  ctx.save();
  ctx.shadowColor = shadow;
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

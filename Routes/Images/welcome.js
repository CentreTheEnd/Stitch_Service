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
  switch (theme) {
    case 'fun':
      return { bg: '#fff0f5', accent: '#ff69b4', text: '#c2185b' };
    case 'education':
      return { bg: '#e3f2fd', accent: '#42a5f5', text: '#0d47a1' };
    case 'work':
      return { bg: '#f3e5f5', accent: '#7e57c2', text: '#311b92' };
    case 'classic':
      return { bg: '#ffffff', accent: '#444', text: '#1c1c1c' };
    default: 
      return { bg: '#1c1c1c', accent: '#444', text: '#ffffff' };
  }
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
  const avatarSize = 220;  // Increased avatar size for HD effect
  const avatarX = width - avatarSize - 100;  // Adjusted position for HD look
  const avatarY = 520;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';  // Stronger shadow for better contrast
  ctx.shadowBlur = 20;  // Increased blur for sharper shadows
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;  // Slightly offset for a better shadow effect
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.font = 'bold 32px CustomFont';  // Larger font size for HD readability
  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.fillText('User Name:', 80, 560);
  ctx.fillStyle = '#222';
  ctx.font = '28px CustomFont';
  ctx.fillText(name, 80, 595);

  ctx.font = 'bold 32px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Group Name:', 80, 635);
  ctx.fillStyle = '#222';
  ctx.font = '28px CustomFont';
  ctx.fillText(groupName, 80, 670);

  ctx.font = 'bold 30px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Members:', 80, 730);
  ctx.fillStyle = '#222';
  ctx.font = '28px CustomFont';
  ctx.fillText(`${members}`, 200, 730);

  ctx.font = 'bold 30px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Description:', 80, 800);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  wrapText(ctx, description, 80, 835, width - 160, 30);

  const welcomeText = iswelcome === 'true'
    ? `Welcome ${name} to ${groupName}!`
    : `${name} has left ${groupName}.`;

  const welcomeGradient = ctx.createLinearGradient(width / 2 - 150, 0, width / 2 + 150, 0);
  welcomeGradient.addColorStop(0, accent);
  welcomeGradient.addColorStop(1, '#fff');

  ctx.textAlign = 'center';
  ctx.fillStyle = welcomeGradient;
  ctx.font = 'bold 48px CustomFont';  // Larger text for better visibility
  ctx.fillText(welcomeText, width / 2, 1100);

  if (text) {
    ctx.fillStyle = '#666';
    ctx.font = '28px CustomFont';
    ctx.fillText(text, width / 2, 1140);
  }

  ctx.fillStyle = '#888';
  ctx.font = 'italic 26px CustomFont';
  ctx.fillText(`Group created by ${creatorName}`, width / 2, height - 40);

  return canvas.toBuffer();
}

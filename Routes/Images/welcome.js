import fs from 'fs';
import axios from 'axios';
import express from 'express';
import { createCanvas, loadImage, registerFont } from 'canvas';

const router = express.Router();

const fontUrl = 'https://files.catbox.moe/2m1c7i.ttf';
const outPathImage = '/tmp/welcome-image.png';
const outPathFont = '/tmp/font.ttf';

router.get('/welcome', async (req, res) => {
  const { background, icon, name, group, creator, members, description, iswelcome, theme } = req.query;

  try {
    const { data: fontData } = await axios.get(fontUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(outPathFont, Buffer.from(fontData));
    registerFont(outPathFont, { family: 'CustomFont' });

    const buffer = await createWelcomImage(background, icon, name, group, creator, members, description, iswelcome, theme);
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
    theme: "...."
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


function drawLine(ctx, y, color = '#ccc') {
  ctx.beginPath();
  ctx.moveTo(80, y);
  ctx.lineTo(820, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
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

async function createWelcomImage(backgroundUrl, avatarUrl, name, groupName, creatorName, members, description, iswelcome, theme = 'default') {
  const width = 900;
  const height = 1600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const { bg, accent, text } = getThemeColors(theme);

  const background = await loadImage(backgroundUrl);
  ctx.drawImage(background, 0, 0, width, 500);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 500, width, 250);

  const avatar = await loadImage(avatarUrl);
  const avatarSize = 220;
  const avatarX = width / 2 - avatarSize / 2;
  const avatarY = 380;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';

  ctx.font = 'bold 50px CustomFont';
  ctx.fillStyle = text;
  ctx.fillText(name, width / 2, 650);
  drawLine(ctx, 670, accent);

  ctx.font = '36px CustomFont';
  ctx.fillStyle = text;
  ctx.fillText(groupName, width / 2, 700);

  ctx.font = '28px CustomFont';
  ctx.fillStyle = '#666';
  ctx.fillText(`${members} members`, width / 2, 740);
  drawLine(ctx, 760, accent);

  ctx.font = '38px CustomFont';
  ctx.fillStyle = iswelcome === 'true' ? '#2e7d32' : '#c62828';
  ctx.fillText(
    iswelcome === 'true' ? `Welcome ${name} to ${groupName}!` : `${name} has left ${groupName}.`,
    width / 2, 860
  );
  drawLine(ctx, 880, accent);

  ctx.font = '28px CustomFont';
  ctx.fillStyle = '#444';
  wrapText(ctx, description, 80, 940, width - 160, 38, 5);

  drawLine(ctx, height - 80, accent);

  ctx.font = 'italic 26px CustomFont';
  ctx.fillStyle = '#888';
  ctx.fillText(`Group created by ${creatorName}`, width / 2, height - 40);

  return canvas.toBuffer();
}


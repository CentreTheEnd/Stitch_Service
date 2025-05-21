import crypto from 'crypto';
import path from "path";
import axios from 'axios';
import { fileURLToPath } from 'url';
import fs from "fs/promises";
import syntaxError from 'syntax-error';
import { format } from 'util';
import { createRequire } from 'module';
import os from 'os';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });


global.createdKeys = {
  firstKey: "stitch",
  endKey: "stitch_no_hacking_here"
};

global.generateToken = () => {
  return crypto.randomBytes(32).toString('hex'); 
};

global.generateCookies = () => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  return `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/`;
};

global.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

global.md5Reverse = (inputString) => {
  let md5Hash = crypto.createHash("md5").update(inputString, "utf-8").digest("hex");
  return md5Hash.split("").reverse().join("");
};

global.generateAPIKey = (ipOrString = "default") => {
  const randomNumbers = crypto.randomInt(10000, 99999);
  const randomHex = crypto.randomBytes(6).toString("hex");
  const encryptedKey = global.md5Reverse(ipOrString + randomHex + global.createdKeys.endKey);
  return `${global.createdKeys.firstKey}-${randomNumbers}-${encryptedKey}`;
};



/*  */



global.shortLinks = {
token: global.github.token,
owner: 'CentreTheEnd',
repo: 'Database-Service',
path: 'Tools/shortlinks.json',
storage: 'Storage',
branch: 'main',

upload: async function (buffer, name) {
  try {
  
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };
  
  const type = mime.split('/')[0];
  
  const fileName = name ? name : type + Math.random().toString(36).substring(8, 35) + '.' + ext;

  const filePath = `${this.storage}/${type}/${fileName}`;
  
  const content = buffer.toString('base64');
  
  const response = await axios.put(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}`,
      {
        message: `Upload file: ${fileName}`,
        content: content,
        branch: this.branch
      },
      {
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
  );
  
  const fileUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${filePath}`;
  const fileSize = buffer.length;
  
  return { name: fileName, url: fileUrl, size: fileSize, path: filePath };
  
  } catch (error) {
    console.error('Error uploading to GitHub:', error.message);
    throw new Error(error.message);
  }

},

save: async function (json) {
    const sha = await this.sha();
    const content = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');
    
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}`;

    await axios.put(
      url,
      {
        message: 'Update shortlinks',
        content,
        branch: this.branch,
        sha
      },
      {
        headers: {
          Authorization: `token ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

},

get: async function () {
  const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}?ref=${this.branch}`;
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    const content = Buffer.from(res.data.content, 'base64').toString();
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to fetch shortlinks:', err.message);
    return {};
  }
},


sha: async function () {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}?ref=${this.branch}`;
    const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
        });
    return res.data.sha;
}

}

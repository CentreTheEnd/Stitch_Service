import axios from 'axios';
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';


import {watchFile, unwatchFile} from 'fs';
import {fileURLToPath} from 'url';
import fs from 'fs'; 
import path from 'path';

import FormData from 'form-data';
import {fileTypeFromBuffer} from 'file-type';

import moment from 'moment-timezone';

import dotenv from "dotenv";
import './futchions.js';
dotenv.config();

//______________________________________________

global.isBot = function isBotAdvanced(req) {
    const userAgent = req.headers['user-agent'] || '';
    const accept = req.headers['accept'] || '';
    const acceptLanguage = req.headers['accept-language'];
    const secFetchSite = req.headers['sec-fetch-site'];
    const secFetchMode = req.headers['sec-fetch-mode'];
    const secFetchDest = req.headers['sec-fetch-dest'];
    const upgradeInsecureRequests = req.headers['upgrade-insecure-requests'];
    const secChUaPlatform = req.headers['sec-ch-ua-platform'];
    const origin = req.headers['origin'];
    const xRequestedWith = req.headers['x-requested-with'];
    const referer = req.headers['referer'];
    const te = req.headers['te'];
    const cacheControl = req.headers['cache-control'];
    const connection = req.headers['connection'];
    const acceptEncoding = req.headers['accept-encoding'];
    const dnt = req.headers['dnt'];
    const secFetchUser = req.headers['sec-fetch-user'];
    const xForwardedFor = req.headers['x-forwarded-for'];

    // كلمات مفتاحية مشهورة للبوتات
    const botPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /crawling/i,
        /fetch/i,
        /scraper/i,
        /python/i,
        /curl/i,
        /wget/i,
        /node\.js/i,
        /go-http-client/i,
        /libwww-perl/i,
        /java/i
    ];

    // تحديد النقاط
    let botScore = 0;

    // فحص بناءً على User-Agent
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        botScore += 3; // نقوم بزيادة النقاط في حال كان هناك تطابق
    }

    // فحص إضافي بناءً على accept
    if (!accept.includes('text/html')) {
        botScore += 2;
    }

    // فحص accept-language
    if (!acceptLanguage) {
        botScore += 1;
    }

    // فحص وجود "upgrade-insecure-requests"
    if (!upgradeInsecureRequests) {
        botScore += 1;
    }

    // فحص sec-fetch-site, sec-fetch-mode, sec-fetch-dest
    if (!secFetchSite || !secFetchMode || !secFetchDest) {
        botScore += 2;
    }

    // فحص sec-ch-ua-platform
    if (!secChUaPlatform || secChUaPlatform === '"Unknown"' || secChUaPlatform === 'Unknown') {
        botScore += 2;
    }

    // فحص origin
    if (!origin) {
        botScore += 1;
    }

    // فحص xRequestedWith
    if (!xRequestedWith || xRequestedWith !== 'XMLHttpRequest') {
        botScore += 1;
    }

    // فحص referer
    if (!referer) {
        botScore += 1;
    }

    // فحص cache-control
    if (!cacheControl) {
        botScore += 1;
    }

    // فحص connection
    if (!connection || connection !== 'keep-alive') {
        botScore += 1;
    }

    // فحص accept-encoding
    if (!acceptEncoding) {
        botScore += 2;
    }

    // فحص dnt
    if (dnt === '1') {
        botScore += 1;
    }

    // فحص sec-fetch-user
    if (!secFetchUser || secFetchUser !== '?1') {
        botScore += 2;
    }

    // فحص x-forwarded-for
    if (!xForwardedFor || !/^\d+\.\d+\.\d+\.\d+$/.test(xForwardedFor)) {
        botScore += 2;
    }

    // إذا كانت النقاط تتجاوز عتبة معينة، يعتبر بوت
    if (botScore >= 10) {
        return true; // يُعتبر بوتًا
    }

    // إذا كانت النقاط أقل من العتبة، يعتبر متصفحًا حقيقيًا
    return false;
};


//______________________________________________

//______________________________________________

const config = {
  owner: {
    name: process.env.OWNER_NAME,
    email: process.env.OWNER_EMAIL,
  },
  github: {
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    database: process.env.GITHUB_REPO_FILE_PATH,
    branch: process.env.GITHUB_REPO_BRANCH,
    token: process.env.GITHUB_TOKEN,
  },
  setting: {
    githubToken: process.env.GITHUB_TOKEN,
    driveKey: process.env.DRIVE_KEY,
    mongoUrl: process.env.MONGO_URL,
    mailKey: process.env.MAIL_KEY,
    tokenKey: process.env.JWT_SECRET_KEY,
    apiKey: {
        first: process.env.API_KEY_FIRST,
        medium: process.env.API_KEY_MEDIUM,
        end: process.env.API_KEY_END,
    },
  },
  auth: {
    google: {
      id: process.env.GOOGLE_ID,
      secret: process.env.GOOGLE_SECRET,
    },
    github: {
      id: process.env.GITHUB_ID,
      secret: process.env.GITHUB_SECRET,
    },
    discord: {
      id: process.env.DISCORD_ID,
      secret: process.env.DISCORD_SECRET,
      oauth2: process.env.DISCORD_OAUTH2,
    },
  },
};

//______________________________________________

global.author = '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰';

global.authFile = 'Database/Session';
global.sessionFile = 'tmp/session.json';
global.tmpFile = 'tmp';

global.owner = config.owner;
global.github = config.github;
global.setting = config.setting;
global.auth = config.auth;

global.githubToken = config.setting.githubToken;
global.driveKey = config.setting.driveKey;
global.mongoUrl = config.setting.mongoUrl;
global.mailKey = config.setting.mailKey;

global.googleID = config.auth.google.id;
global.googleSecret = config.auth.google.secret;

global.githubID = config.auth.github.id;
global.githubSecret = config.auth.github.secret;

global.discordID = config.auth.discord.id;
global.discordSecret = config.auth.discord.secret;
global.discordUrl = config.auth.discord.oauth2;

//______________________________________________

global.db = {

  data: {

    repoOwner: global.github.owner,
    repoName: global.github.repo,
    repoPath: global.github.database,
    repoToken: global.github.token,
    repoBranch: global.github.branch || 'main',

    apikey: {
      first: global.setting.apiKey.first,
      medium: global.setting.apiKey.medium,
      end: global.setting.apiKey.end,
    },

    tokenKey: global.setting.tokenKey,
    emailKey: global.setting.mailKey,

    github: {

      sha: async function () {
        const data = global.db.data;
        const url = `https://api.github.com/repos/${data.repoOwner}/${data.repoName}/contents/${data.repoPath}?ref=${data.repoBranch}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${data.repoToken}`,
            Accept: 'application/vnd.github+json',
          },
        });
        return res.data.sha;
      },

      getData: async function () {
        const data = global.db.data;
        const url = `https://api.github.com/repos/${data.repoOwner}/${data.repoName}/contents/${data.repoPath}?ref=${data.repoBranch}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${data.repoToken}`,
            Accept: 'application/vnd.github+json',
          },
        });
        const content = Buffer.from(res.data.content, 'base64').toString();
        return JSON.parse(content);
      },

      updateData: async function (users, commitMessage = 'update') {
        const data = global.db.data;
        const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
        const sha = await global.db.data.github.sha();

        const res = await axios.put(
          `https://api.github.com/repos/${data.repoOwner}/${data.repoName}/contents/${data.repoPath}`,
          {
            message: commitMessage,
            content,
            sha,
            branch: data.repoBranch,
          },
          {
            headers: {
              Authorization: `Bearer ${data.repoToken}`,
              Accept: 'application/vnd.github+json',
            },
          }
        );

        return res.data;
      },
    },
  },

  users: {

    getUsers: async function () {
      const users = await global.db.data.github.getData();
      return users;
    },

    verifyToken: function (token) {
      const secret = global.db.data.tokenKey || 'default_secret';
      try {
        return jwt.verify(token, secret);
      } catch (err) {
        return null;
      }
    },

    decodeToken: function (token) {
      return jwt.decode(token);
    },
  },
  
  genrate: {
  
  APIKey: function (email, id) {
      const { first, medium, end } = global.db.data.apikey;
      let apiKey;
      let isUnique = false;

      while (!isUnique) {
        const randomNumbers = crypto.randomInt(10000, 99999);
        const randomHex = crypto.randomBytes(6).toString("hex");
        const combined = email + medium + randomHex + id + end;
        const md5Hash = crypto.createHash("md5").update(combined, "utf-8").digest("hex");
        const reversedHash = md5Hash.split("").reverse().join("");
        apiKey = `${first}-${randomNumbers}-${reversedHash}`;
        if (!global.db.checkExistingAPIKey(apiKey)) {
          isUnique = true;
        }
      }

      global.db.generatedAPIKeys.add(apiKey);
      return apiKey;
  },

  Token: function (payload) {
      const secret = global.db.data.tokenKey || 'default_secret';
      let token;
      let isUnique = false;

      while (!isUnique) {
        token = jwt.sign(payload, secret);
        if (!global.db.checkExistingToken(token)) {
          isUnique = true;
        }
      }

      global.db.generatedTokens.add(token);
      return token;
  },
  
  Cookies: function (sessionId) {
    return {
      'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Strict`,
    };
  },
  
  Session: function (number = 16) {
    const sessionId = crypto.randomBytes(number).toString('hex');
    return sessionId;
  },
  
  UUID: function () {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
    );
  }
  
  },

  checkExistingAPIKey: function (apiKey) {
      return global.db.generatedAPIKeys.has(apiKey);
    },

  checkExistingToken: function (token) {
      return global.db.generatedTokens.has(token);
    },

  generatedAPIKeys: new Set(),
  generatedTokens: new Set()
  
};



//______________________________________________

global.fs = fs;
global.cheerio = cheerio;
global.axios = axios;
global.fetch = fetch;
global.moment = moment;

//______________________________________________



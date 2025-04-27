import axios from 'axios';
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import crypto from 'crypto';

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

    // فحص بناءً على User-Agent
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        return true;
    }

    // فحص إضافي بناءً على headers
    if (!accept.includes('text/html')) {
        return true;
    }

    if (!acceptLanguage) {
        return true;
    }

    if (!upgradeInsecureRequests) {
        return true;
    }

    if (!secFetchSite || !secFetchMode || !secFetchDest) {
        return true;
    }

    // لو كل الفحوصات الطبيعية موجودة => غالبًا متصفح
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
    repoOwner: process.env.GITHUB_REPO_OWNER,
  },
  setting: {
    githubToken: process.env.GITHUB_TOKEN,
    driveKey: process.env.DRIVE_KEY,
    mongoUrl: process.env.MONGO_URL,
    mailKey: process.env.MAIL_KEY,
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



//______________________________________________

global.fs = fs;
global.cheerio = cheerio;
global.axios = axios;
global.fetch = fetch;
global.moment = moment;

//______________________________________________



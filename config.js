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

//______________________________________________

global.author = '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰';

global.createdKeys = {
firstKey: "stitch",
endKey: "stitch_no_hacking_here"
}

//______________________________________________


global.loadKayes = async function loadData() {
  const fileId = '1Dfq_8uK7W8EH_YKQmwG9brNwIZu_NRZr';
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const res = await axios.get(url);
    const jsonData = res.data;

    // تحقق من وجود الأقسام المطلوبة في JSON
    if (!jsonData.setting || !jsonData.auth) {
      throw new Error('Missing one or more required sections (setting/auth/google/...)');
    }

    const google = jsonData.auth.google;
    const github = jsonData.auth.github;
    const discord = jsonData.auth.discord;

    // تعيين المتغيرات العامة
    global.githubToken = jsonData.setting?.githubToken;
    global.driveKey = jsonData.setting?.driveKey;
    global.mongoUrl = jsonData.setting?.mongoUrl || 'mongodb://localhost:27017/'; // قيمة افتراضية في حالة عدم وجود قيمة للمونغو

    global.googleID = google.id;
    global.googleSecret = google.secret;

    global.githubID = github.id;
    global.githubSecret = github.secret;

    global.discordID = discord.id;
    global.discordSecret = discord.secret;
    global.discordUrl = discord.oauth2;

    console.log("Keys loaded successfully");
  } catch (err) {
    console.error("Error loading keys:", err.message);
  }
};



//______________________________________________



//______________________________________________
/*
global.fs = fs;
global.cheerio = cheerio;
global.axios = axios;
global.fetch = fetch;
global.moment = moment;
*/
//______________________________________________

await global.loadKayes();

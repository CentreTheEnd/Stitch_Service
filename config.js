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
  
  const mongodbUrl = 'mongodb+srv://shawaza:Ss24-4-2004@cluster0.kz7o9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

  const res = await axios.get(url);
  const jsonData = res.data;

  const google = jsonData?.auth?.google;
  const github = jsonData?.auth?.github;
  const discord = jsonData?.auth?.discord;

  global.githubToken = jsonData.setting?.githubToken;
  global.driveKey = jsonData.setting?.driveKey;
  global.mongoUrl = jsonData.setting?.mongoUrl || mongodbUrl;
  
  global.googleID = google.id;
  global.googleSecret = google.secret;

  global.githubID = github.id;
  global.githubSecret = github.secret;

  global.discordID = discord.id;
  global.discordSecret = discord.secret;
  global.discordUrl = discord.oauth2;
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

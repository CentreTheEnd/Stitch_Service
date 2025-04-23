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

global.author = '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰';



//______________________________________________


/*
const config = {
  owner: {
    name: "Sayed Hamdey",
    email: "sayeddaana221166@gmail.com"
  },
  github: {
    repoOwner: "sayed-hamdey-2000"
  },
  setting: {
    githubToken: "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",
    driveKey: "AIzaSyC9AL_PCz0Zq6jEtv9iVJg9-fIUymgn9wg",
    mongoUrl: "mongodb+srv://shawaza:Ss24-4-2004@cluster0.kz7o9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  },
  auth: {
    google: {
      id: "687788561377-1emm0v529c1kfn8p7d1tsvt5eku4ks2e.apps.googleusercontent.com",
      secret: "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"
    },
    github: {
      id: "Ov23life6Ac2whmERyvW",
      secret: "780bee44b86bdafbf7f319396a83487e0aac5568"
    },
    discord: {
      id: "1355288606268199013",
      secret: "48da5dd2ac07c189be1d98c48f255e66e160067ed345e9558fb3ed456babc736",
      oauth2: "https://discord.com/oauth2/authorize?client_id=1355288606268199013"
    }
  }
};

*/

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



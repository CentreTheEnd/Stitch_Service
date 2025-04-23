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



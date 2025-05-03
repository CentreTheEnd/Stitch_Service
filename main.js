import os from 'os';
import cors from "cors";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import syntaxError from 'syntax-error';
import { format } from 'util';
import { createRequire } from 'module';

//______________________________________________

import './config.js';
//import './futchions.js';

import { connectDB } from './Database/Mongo/connect.js';

import { setupRoutes } from './Switch/index.js';

//______________________________________________

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFilePath = path.join(__dirname, 'Database', 'Storage', 'database.json');

//______________________________________________


//______________________________________________

export async function setupBot() {
  

}
//______________________________________________

export async function setupApp() {

    console.log(`Connecting to MongoDB...`);
    
    await connectDB()
    .then(() => {
    console.log("MongoDB Connected Successfully!");
    })
    .catch(error => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
    });

    console.log(`oInitializing Express App...`);

    const app = express();
  
    let html;
    let modifiedHtml;
    let token;
    let apiKey;
    let ip;

    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));

    console.log(`Setting up Routes...`);
    await setupRoutes(app);

    console.log(`Server Setup Complete!`);


app.get('/', (req, res) => {
         token = req.headers['authorization'];
         
         if (token) {
           
         } else {
            res.sendFile(path.join(__dirname,`/public/html/started.html`));
         }
    });

  app.get('/auth', (req, res) => {
 // const page = req.query.page || 'register';
    const { page = 'register', inviteCode = '' } = req.query;

    html = fs.readFileSync(path.join(__dirname, '/public/html/auth.html'), 'utf8');
  
    modifiedHtml = html.replace('{{AUTH_KEY}}', page);
    modifiedHtml = modifiedHtml.replace('{{INVITE_CODE}}', inviteCode);

    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedHtml);
    
  });

  app.get('/about', (req, res) => {

  });
  
  app.get('/downloader/video', (req, res) => {
  
         ip = req.ip;
         apiKey = global.generateAPIKey(ip);
         global.isApiKey = apiKey;
        // res.setHeader('api-key', apiKey);
    
   html = fs.readFileSync(path.join(__dirname, '/public/html/downloader_video.html'), 'utf8');
   modifiedHtml = html.replace('{{API_KEY}}', apiKey);

  res.setHeader('Content-Type', 'text/html');
  res.send(modifiedHtml);
});


  app.get('/test', (req, res) => {
         
   res.sendFile(path.join(__dirname,`/public/html/Test.html`));
  });

  app.get('/eval', (req, res) => {
         
  res.sendFile(path.join(__dirname,`/public/html/eval.html`));
  });
  
  const redirectToError = (res, errorCode) => {
  if (!res.headersSent) {
   html = fs.readFileSync(path.join(__dirname, '/public/html/error.html'), 'utf8');
   modifiedHtml = html.replace('{{ERROR_CODE}}', errorCode);

  res.setHeader('Content-Type', 'text/html');
  res.send(modifiedHtml);
  }
};

  app.use((req, res, next) => {
  const timeoutMs = 9000;
  const timer = setTimeout(() => {
    redirectToError(res, 504); 
  }, timeoutMs);

  res.on('finish', () => clearTimeout(timer));
  next();
});

  app.use((req, res) => {
  redirectToError(res, 404); 
});

  
 /*
  app.use((err, req, res) => {
  console.error('خطأ في الخادم:', err.stack);

  let errorCode = 500;

  
  if (err) {
    
  if (err.status === 404) {
    errorCode = 404; 
  } else if (err.status === 401) {
    errorCode = 401; 
  } else if (err.status === 403) {
    errorCode = 403; 
  } else if (err.status === 500) {
    errorCode = 500; 
  } else if (err.status === 400) {
    errorCode = 400; 
  }

  } else {
    errorCode = 404;
  }

 
  redirectToError(res, errorCode);
});

*/

    return app;
} 

//______________________________________________
   
//______________________________________________

//______________________________________________

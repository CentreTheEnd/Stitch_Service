import os from 'os';
import cors from "cors";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
//import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
//import fs from "fs/promises";
import fs from 'fs';



//______________________________________________

import './config.js';
//import { setupRoutes } from './Switch/Api/index.js';
//import { setupDatabase } from './Switch/Accounts/index.js';
import { connectDB } from './Database/Mongo/connect.js';

import { setupRoutes } from './Switch/index.js';

//______________________________________________

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFilePath = path.join(__dirname, 'Database', 'Storage', 'database.json');

//______________________________________________

// global.db = new Low(new JSONFile(dbFilePath));

//______________________________________________

/* 
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }

  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;

  
  global.db.data = {
    users: {},
    posties: {},
    ...(global.db.data || {}),
  };

  
  global.db.data = new Proxy(global.db.data, {
    set: async function (target, prop, value) {
      target[prop] = value;
   
      await global.db.write();
      console.log(`Data saved after change to property: ${prop}`);
      return true;
    }
  });
    
  await global.db.write();
};
*/


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

  //  console.log(`Setting up Database...`);
  //  await loadDatabase();

    const app = express();
  
    let html;
    let modifiedHtml;
    let token;
    let apiKey;

    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.json());
   // app.use(express.static("public"));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));

    console.log(`Setting up Routes...`);
    await setupRoutes(app);

    //console.log(`Setting up API Accounts...`);
    //await setupDatabase(app);
    
/*
    app.use(async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        
        if (authHeader) {
            const apiKey = authHeader.split(' ')[1];
            next();
        } else {
             return res.status(401).json({
             success: false,
             message: 'API key missing or malformed',
             });
        }
    });

*/
    
    //console.log(`Setting up API Routes...`);
    //await setupRoutes(app);

    console.log(`Server Setup Complete!`);

app.get('/', (req, res) => {
         token = req.headers['authorization'];
         apiKey = req.headers['api-key'];
  
         if (token) {
           
         } else {
            res.sendFile(path.join(__dirname,`/public/html/started.html`));
         }
    });
  
  /*
    app.get('/downloader/video', (req, res) => {
        const ip = req.ip;
        const apiKey = global.generateAPIKey(ip);
      
         res.setHeader('api-key', apiKey);
         res.sendFile(path.join(__dirname,`/public/html/downloader_video.html`));
    });
    */
  app.get('/downloader/video', (req, res) => {
  const ip = req.ip;
  apiKey = global.generateAPIKey(ip);
  global.isApiKey = apiKey;

   html = fs.readFileSync(path.join(__dirname, '/public/html/downloader_video.html'), 'utf8');
   modifiedHtml = html.replace('{{API_KEY}}', apiKey);

  res.setHeader('Content-Type', 'text/html');
  res.send(modifiedHtml);
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

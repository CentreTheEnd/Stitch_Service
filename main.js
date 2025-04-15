import os from 'os';
import cors from "cors";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
//import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import fs from "fs/promises";



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
  
    const redirectToError = (res, code) => {
  if (!res.headersSent) {
    res.status(code).redirect(`/html/error.html?code=${code}`);
  }
};

  app.use((err, req, res) => {
  console.error('خطأ في الخادم:', err.stack);

  let errorCode = 500;

  

  else if (err.status === 404) {
    errorCode = 404; // Not Found
  }

  else if (err.status === 401) {
    errorCode = 401; // Unauthorized
  }

  else if (err.status === 403) {
    errorCode = 403; 
  }


  

  else if (err.status === 400) {
    errorCode = 400; 
  }

 
  redirectToError(res, errorCode);
});
    

    return app;
} 
//______________________________________________
   
//______________________________________________

//______________________________________________

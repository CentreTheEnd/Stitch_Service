import os from 'os';
import cors from "cors";
import express from 'express';
import bodyParser from 'body-parser';

//______________________________________________

import './config.js';
import { setupRoutes } from './Switch/Api/index.js';
import { setupDatabase } from './Switch/Data/index.js';
import { connectDB } from './Database/Mongo/connect.js';

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

    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(express.static("public"));
    app.use(express.urlencoded({ extended: true }));

    console.log(`Setting up API Routes...`);
    await setupRoutes(app);

    console.log(`Setting up Database Switch...`);
    await setupDatabase(app);

    console.log(`Server Setup Complete!`);

    return app;
} 


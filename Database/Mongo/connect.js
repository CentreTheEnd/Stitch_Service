import mongoose from 'mongoose';

export async function connectDB() {
    
    if (!global.mongoUrl) {
        console.error("MongoDB URI is not defined in global.mongoUrl");
        process.exit(1);
    }
    
    try {
        await mongoose.connect(global.mongoUrl);
        console.log("Successfully connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
};

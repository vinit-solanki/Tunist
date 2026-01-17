import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes.js';
import cors from 'cors';
dotenv.config();
const app = express();
// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'https://tunist-user-service.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Spotify"
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (e) {
        console.log(e);
    }
};
app.use("/api/v1", userRoutes);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    connectDB();
});

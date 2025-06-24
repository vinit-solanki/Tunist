import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes.js';
import cors from 'cors';
dotenv.config();
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
const app = express();
app.use(cors());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
app.use("/api/v1", userRoutes);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    connectDB();
});

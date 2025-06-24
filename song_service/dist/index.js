import express from 'express';
import dotenv from 'dotenv';
import songRoute from './routes.js';
import redis from 'redis';
import cors from 'cors';
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cors({ origin: '*' }));
export const redisClient = redis.createClient({
    password: `${process.env.REDIS_PASSWORD}`,
    socket: {
        host: `${process.env.REDIS_HOST}`,
        port: 11403,
    }
});
redisClient.connect()
    .then(() => console.log("Connect to Redis Client"))
    .catch((err) => console.log("Error connecting to Redis Client", err));
app.use('/api/v1', songRoute);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

import express from 'express';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import adminRoutes from './routes.js';
import cloudinary from 'cloudinary';
import redis from 'redis';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(cors({ origin: '*' }));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
})
if (!process.env.DB_URL) {
  throw new Error("Missing DB_URL in environment variables");
}

const sql = neon(process.env.DB_URL as string);


const port = process.env.PORT || 4000;
async function initDB(){
    try{
        await sql`
        CREATE TABLE IF NOT EXISTS albums(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `;
        await sql`
        CREATE TABLE IF NOT EXISTS songs(
         id SERIAL PRIMARY KEY, 
         title VARCHAR(255) NOT NULL,
         description VARCHAR(255) NOT NULL,
         thumbnail VARCHAR(255),
         audio VARCHAR(255) NOT NULL,
         album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )
        `;
        console.log('Database initialized');
    } catch (e){
        console.log(e);    
    }
}
export const redisClient = redis.createClient({
    password: `${process.env.REDIS_PASSWORD}`,
    socket: {
        host: `${process.env.REDIS_HOST}`,
        port: 11403, 
    }
});

redisClient.connect()
.then(()=>console.log("Connect to Redis Client"))
.catch((err)=>console.log("Error connecting to Redis Client", err))

app.use("/api/v1",adminRoutes);
app.get("/", (req,res)=>{
    res.send("Hello World!");
})
initDB().then(()=>{
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    })
}).catch((e)=>{
    console.log(e)
}) 
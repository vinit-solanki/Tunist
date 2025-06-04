import {neon} from '@neondatabase/serverless';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
const app = express();

const port = process.env.PORT

export const sql=neon(process.env.DB_URL as string);

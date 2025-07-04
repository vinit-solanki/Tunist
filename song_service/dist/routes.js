import express from 'express';
import dotenv from 'dotenv';
import { getAllAlbums, getAllSongOfAlbum, getAllSongs, getSingleSong } from './controller.js';
const router = express.Router();
dotenv.config();
router.get('/album/all', getAllAlbums);
router.get('/song/all', getAllSongs);
router.get('/album/:id', getAllSongOfAlbum);
router.get('/song/:id', getSingleSong);
export default router;

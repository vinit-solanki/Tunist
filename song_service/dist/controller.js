import { sql } from "./config/db.js";
import tryCatch from "./tryCatch.js";
import { redisClient } from "./index.js";
export const getAllAlbums = tryCatch(async (req, res, next) => {
    try {
        const CACHE_EXPIRY = 1800;
        let albums;
        if (redisClient.isReady) {
            albums = await redisClient.get("albums");
        }
        if (albums) {
            console.log("Cache hit");
            res.json(JSON.parse(albums));
            return;
        }
        else {
            console.log("Cache miss");
            albums = await sql `SELECT * FROM albums`;
            if (redisClient.isReady) {
                await redisClient.set("albums", JSON.stringify(albums), { EX: CACHE_EXPIRY });
            }
            res.json(albums);
        }
    }
    catch (error) {
        next(error);
    }
});
export const getAllSongs = tryCatch(async (req, res, next) => {
    try {
        let songs;
        const CACHE_EXPIRY = 1800;
        if (redisClient.isReady) {
            songs = await redisClient.get("songs");
        }
        if (songs) {
            console.log("Cache hit");
            res.json(JSON.parse(songs));
            return;
        }
        else {
            console.log("Cache miss");
            songs = await sql `SELECT * FROM songs`;
            if (redisClient.isReady) {
                await redisClient.set("songs", JSON.stringify(songs), { EX: CACHE_EXPIRY });
            }
            res.json(songs);
        }
    }
    catch (error) {
        next(error);
    }
});
export const getAllSongOfAlbum = tryCatch(async (req, res, next) => {
    try {
        const { id } = req.params;
        const CACHE_EXPIRY = 1800;
        let album, songs;
        if (redisClient.isReady) {
            const cacheData = await redisClient.get(`album_songs_${id}`);
            if (cacheData) {
                console.log("Cache hit");
                res.json(JSON.parse(cacheData));
                return;
            }
        }
        album = await sql `SELECT * FROM albums WHERE id = ${id}`;
        if (album.length === 0) {
            return res.status(404).json({ message: "Album not found" });
        }
        songs = await sql `SELECT * FROM songs WHERE album_id = ${id}`;
        const response = { songs, album: album[0] };
        if (redisClient.isReady) {
            await redisClient.set(`album_songs_${id}`, JSON.stringify(response), { EX: CACHE_EXPIRY });
        }
        console.log("Cache miss");
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
export const getSingleSong = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const song = await sql `SELECT * FROM songs WHERE id = ${id}`;
    if (song.length === 0) {
        return res.status(404).json({ message: "Song not found" });
    }
    res.json(song[0]);
});

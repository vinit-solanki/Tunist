import { Request, Response } from "express";
import tryCatch from "./tryCatch.js";
import getBuffer from "./config/dataUri.js";
import cloudinary from 'cloudinary';
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
    };
}

export const addAlbum = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const {title,description} = req.body;
    const file = req.file;
    if(!file){
        return res.status(400).json({
            message:"No file uploaded",
        });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Error uploading file",
        });
    }
    
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content as string, {
        folder: "albums",
    });
    
    const result = await sql`
    INSERT INTO albums (title,description,thumbnail) VALUES (${title},${description},${cloud.secure_url})
    RETURNING *
    `;
    if(redisClient.isReady){
        await redisClient.del("album")
        console.log("Cache invalidated for album")
    }
    res.json({
        message: "Album Created",
        album: result[0],
    })
})

export const addSong = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role!== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const {title, description, album} = req.body;
    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album}`;

    if(isAlbum.length === 0){
        res.status(404).json({
            message: "Album not found",
        });
        return;
    }
    const file = req.file;
    if(!file){
        return res.status(400).json({
            message:"No file uploaded",
        });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Error uploading file",
        });
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content as string, {
        folder: "songs",
        resource_type: "video",
    })
    const result = await sql`
    INSERT INTO songs (title, description, audio, album_id) VALUES (${title}, ${description}, ${cloud.secure_url}, ${album})
    `;
    if(redisClient.isReady){
        await redisClient.del("songs")
        console.log("Cache invalidated for album")
    }
    res.json({
        message: "Song added",
    })
})

export const addThumbnail = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role!== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const song = await sql`SELECT * FROM songs WHERE id=${req.params.id}`;
    if(song.length === 0){
        res.status(404).json({
            message: "Song not found",
        });
        return;
    }
    const file = req.file;
    if(!file){
        return res.status(400).json({
            message:"No file uploaded",
        });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Error uploading file",
        });
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content)
    const result = await sql`
    UPDATE songs SET thumbnail = ${cloud.secure_url} WHERE id = ${req.params.id} RETURNING * 
    `;
    if(redisClient.isReady){
        await redisClient.del("songs")
        console.log("Cache invalidated for songs")
    }
    res.json({
        message: "Thumbnail added",
        song: result[0],
    })
})

export const deleteAlbum = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role!== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const {id} = req.params;
    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;
    if(isAlbum.length === 0){
        res.status(404).json({
            message: "Album not found",
        });
        return;
    }
    await sql`DELETE FROM songs WHERE album_id = ${id}`;
    await sql`DELETE FROM albums WHERE id = ${id}`;

    if(redisClient.isReady){
        await redisClient.del("songs")
        console.log("Cache invalidated for songs")
    }
    if(redisClient.isReady){
        await redisClient.del("albums")
        console.log("Cache invalidated for album")
    }
    res.json({
        message: "Album deleted",
    })
})

export const deleteSong = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role!== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const {id} = req.params;
    const isSong = await sql`SELECT * FROM songs WHERE id = ${id}`;
    if(isSong.length === 0){
        res.status(404).json({
            message: "Song not found",
        });
        return;
    }
    await sql`DELETE FROM songs WHERE id=${id}`;

    if(redisClient.isReady){
        await redisClient.del("songs")
        console.log("Cache invalidated for songs")
    }

    res.json({
        message: "Song deleted",
    })
})
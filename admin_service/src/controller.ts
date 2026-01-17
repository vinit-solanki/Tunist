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
    const {title, description} = req.body;
    const file = req.file;
    
    if (!file) {
        res.status(400).json({
            message: "No file uploaded",
        });
        return;
    }
    
    try {
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            res.status(500).json({
                message: "Error processing file",
            });
            return;
        }
        
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: "albums",
        });
        
        const result = await sql`
            INSERT INTO albums (title, description, thumbnail) 
            VALUES (${title}, ${description || ''}, ${cloud.secure_url})
            RETURNING *
        `;
        
        if (redisClient.isReady) {
            await redisClient.del("albums");
            console.log("Cache invalidated for albums");
        }
        
        res.status(201).json({
            message: "Album Created",
            album: result[0],
        });
    } catch (error) {
        console.error("Album creation error:", error);
        res.status(500).json({
            message: "Failed to create album",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const addSong = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    const {title, description, album} = req.body;
    
    if (!album) {
        res.status(400).json({
            message: "Album ID is required",
        });
        return;
    }
    
    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album}`;
    if (isAlbum.length === 0) {
        res.status(404).json({
            message: "Album not found",
        });
        return;
    }
    
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No audio file uploaded",
        });
        return;
    }
    
    try {
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            res.status(500).json({
                message: "Error processing file",
            });
            return;
        }
        
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: "songs",
            resource_type: "video",
        });
        
        const result = await sql`
            INSERT INTO songs (title, description, audio, album_id) 
            VALUES (${title}, ${description || ''}, ${cloud.secure_url}, ${album})
            RETURNING *
        `;
        
        if (redisClient.isReady) {
            await redisClient.del("songs");
            console.log("Cache invalidated for songs");
        }
        
        res.status(201).json({
            message: "Song added",
            song: result[0],
        });
    } catch (error) {
        console.error("Song creation error:", error);
        res.status(500).json({
            message: "Failed to add song",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const addThumbnail = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
    if (song.length === 0) {
        res.status(404).json({
            message: "Song not found",
        });
        return;
    }
    
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file uploaded",
        });
        return;
    }
    
    try {
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            res.status(500).json({
                message: "Error processing file",
            });
            return;
        }
        
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: "thumbnails",
        });
        
        const result = await sql`
            UPDATE songs SET thumbnail = ${cloud.secure_url} 
            WHERE id = ${req.params.id} 
            RETURNING *
        `;
        
        if (redisClient.isReady) {
            await redisClient.del("songs");
            console.log("Cache invalidated for songs");
        }
        
        res.json({
            message: "Thumbnail added",
            song: result[0],
        });
    } catch (error) {
        console.error("Thumbnail upload error:", error);
        res.status(500).json({
            message: "Failed to add thumbnail",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const deleteAlbum = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    const {id} = req.params;
    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;
    
    if (isAlbum.length === 0) {
        res.status(404).json({
            message: "Album not found",
        });
        return;
    }
    
    try {
        // Delete associated songs first
        await sql`DELETE FROM songs WHERE album_id = ${id}`;
        // Then delete the album
        await sql`DELETE FROM albums WHERE id = ${id}`;

        if (redisClient.isReady) {
            await redisClient.del("songs");
            await redisClient.del("albums");
            console.log("Cache invalidated for albums and songs");
        }
        
        res.json({
            message: "Album deleted successfully",
        });
    } catch (error) {
        console.error("Album deletion error:", error);
        res.status(500).json({
            message: "Failed to delete album",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const deleteSong = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    const {id} = req.params;
    const isSong = await sql`SELECT * FROM songs WHERE id = ${id}`;
    
    if (isSong.length === 0) {
        res.status(404).json({
            message: "Song not found",
        });
        return;
    }
    
    try {
        await sql`DELETE FROM songs WHERE id = ${id}`;

        if (redisClient.isReady) {
            await redisClient.del("songs");
            console.log("Cache invalidated for songs");
        }

        res.json({
            message: "Song deleted successfully",
        });
    } catch (error) {
        console.error("Song deletion error:", error);
        res.status(500).json({
            message: "Failed to delete song",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const getAlbums = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role!== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    try {
        const albums = await sql`SELECT * FROM albums ORDER BY created_at DESC`;
        res.json({
            message: "Albums retrieved",
            albums: albums,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching albums",
            error: error,
        });
    }
})

export const getSongs = tryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role!== "admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    try {
        const songs = await sql`SELECT * FROM songs ORDER BY created_at DESC`;
        res.json({
            message: "Songs retrieved",
            songs: songs,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching songs",
            error: error,
        });
    }
})
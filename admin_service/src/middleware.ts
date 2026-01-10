import { NextFunction, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  playlist: string[];
}

interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

// Resolve user-service URL; fall back to the deployed user service if env is missing or mis-set.
const USER_SERVICE_URL = process.env.USER_URL || "https://tunist-user-service.onrender.com";

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Accept both `token` and `Authorization: Bearer <token>`
    let token = req.headers.token as string;

    if (!token && typeof req.headers.authorization === "string") {
      const [scheme, value] = req.headers.authorization.split(" ");
      if (scheme?.toLowerCase() === "bearer" && value) {
        token = value;
      }
    }

    if (!token) {
      res.status(403).json({ message: "Please Login" });
      return;
    }

    const { data } = await axios.get(`${USER_SERVICE_URL}/api/v1/user/me`, {
      headers: { token },
    });

    req.user = data;

    next();
  } catch (error) {
    res.status(403).json({ message: "Please Login" });
  }
};

// Multer setup
import multer from "multer";

const storage = multer.memoryStorage();
const uploadFile = multer({ storage }).single("file");

export default uploadFile;
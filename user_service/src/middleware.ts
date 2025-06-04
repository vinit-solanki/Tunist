import { NextFunction, Request, Response } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { IUser, User } from './model.js';
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.token as string;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
        if (!decoded || !decoded._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        (req as AuthenticatedRequest).user = user; // ✅ attach user to custom interface
        next();
    } catch (e) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

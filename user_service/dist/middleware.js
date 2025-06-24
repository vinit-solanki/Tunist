import jwt from 'jsonwebtoken';
import { User } from './model.js';
export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SEC);
        if (!decoded || !decoded._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.user = user; // ✅ attach user to custom interface
        next();
    }
    catch (e) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

import tryCatch from './tryCatch.js';
import { User } from './model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export const registerUser = tryCatch(async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({
            message: "User already exists",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
        playlist: [],
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, { expiresIn: "3d" });
    res.status(201).json({
        message: "User created successfully",
        user,
        token,
    });
});
export const loginUser = tryCatch(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User does not exist",
        });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid credentials",
        });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, { expiresIn: "3d" });
    res.status(200).json({
        message: "User logged in successfully",
        user,
        token,
    });
});
export const getUser = tryCatch(async (req, res) => {
    const user = await User.findById(req.body._id);
    if (!user) {
        return res.status(400).json({
            message: "User does not exist",
        });
    }
    res.status(200).json({
        message: "User fetched successfully",
        user,
    });
});
export const myProfile = tryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});

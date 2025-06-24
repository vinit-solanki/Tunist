import express from 'express'
import { loginUser, myProfile, registerUser, getUser } from './controller.js'
import {isAuth} from './middleware.js'
import { Router } from 'express'
const router = express.Router();
router.post("/user/register",registerUser)
router.post("/user/login",loginUser)
router.get("/user/me", isAuth, myProfile)
router.get("/user", isAuth, getUser)
export default router
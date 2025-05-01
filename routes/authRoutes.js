import express from "express";
import { authenticateToken} from "../middlewares/authMiddleware.js";

import {  login,resetPassword,forgotPassword ,getMyProfile,updateMyProfile,verifyOTP,resendOTP} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post('/resend-otp', resendOTP);
router.post("/reset-password/:token", resetPassword);
router.get("/getMyProfile", authenticateToken, getMyProfile); 
router.put("/updateMyProfile", authenticateToken, updateMyProfile); 
export default router;
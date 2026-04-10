import express from 'express';
import { registerUser, authUser, forgotPassword, verifyOtp, resetPassword, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);

router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;

import express from 'express';
import { registerUser, authUser, forgotPassword, verifyOtp, resetPassword, googleAuth, resendOtp } from './auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);

router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);

export default router;

import express from 'express';
import { createRazorpayOrder, verifyPayment } from './payment.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export default router;

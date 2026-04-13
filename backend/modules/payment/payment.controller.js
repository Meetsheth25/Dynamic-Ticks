import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from './payment.model.js';

// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  console.log('--- DEBUG: Create Razorpay Order ---');
  console.log('Amount received:', amount);
  console.log('User:', req.user ? req.user.id : 'No User');

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await instance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500);
    throw new Error('Razorpay Order Creation Failed');
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    amount,
    orderId // MongoDB Order ID (optional)
  } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    // Save payment details in DB
    const payment = await Payment.create({
      user: req.user._id,
      orderId: orderId || null,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amount / 100, // store in rupees
      status: 'captured'
    });

    res.status(200).json({ 
      success: true, 
      message: "Payment verified successfully",
      payment 
    });
  } else {
    res.status(400);
    throw new Error('Invalid Signature, payment verification failed');
  }
});

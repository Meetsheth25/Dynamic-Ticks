import sendEmail from '../utils/sendEmail.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email: rawEmail, password } = req.body;
  const email = rawEmail.toLowerCase();

  let user = await User.findOne({ email });

  if (user && user.isVerified) {
    res.status(400);
    throw new Error('User already exists and is verified. Please login.');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (user && !user.isVerified) {
    // If user exists but not verified, update details and resend OTP
    user.name = name;
    user.password = password;
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
  } else {
    // Create new unverified user
    user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });
  }

  // Send Email
  const message = `Your account verification OTP is ${otp}. It is valid for 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #333;">Account Verification</h2>
      <p>Thank you for registering. Please use the following code to verify your email address:</p>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 12px;">This code will expire in 10 minutes.</p>
    </div>
  `;

  console.log('--- REGISTRATION OTP (USER) ---');
  console.log(`Email: ${user.email}`);
  console.log(`OTP: ${otp}`);
  console.log('------------------------------');

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Dynamic Ticks',
      message,
      html
    });

    res.status(200).json({ message: 'Verification OTP sent to your email.' });
  } catch (err) {
    // If email fails, we still return 200 so the user can test with the console OTP
    res.status(200).json({
      message: 'OTP generated. (Email delivery failed - check server console for code)',
      emailError: err.message
    });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = req.body;
  const email = rawEmail.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: email }, { name: email }],
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found. Please register first.');
  }

  if (!user.isVerified && !user.isAdmin) {
    res.status(403);
    throw new Error('Account not verified. Please verify your email first.');
  }

  const isMatch = await user.matchPassword(password);

  // Explicitly allow plain text match for the default seeded admin
  const isAdminHardcoded = (email === 'admin' || email === 'admin@dynamic.com') && password === 'admin@123' && user.isAdmin;

  if (isMatch || isAdminHardcoded) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'client',
      token: generateToken(user._id, user.isAdmin),
    });
  } else {
    res.status(401);
    throw new Error("Incorrect password. Click 'Forgot Password' to reset.");
  }
});

// Helper to find account in either User or Employee collection
const findAccount = async (email) => {
  let account = await User.findOne({ email });
  if (!account) {
    account = await Employee.findOne({ email });
  }
  return account;
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email: rawEmail } = req.body;
  const email = rawEmail.toLowerCase();
  const account = await findAccount(email);

  if (!account) {
    res.status(404);
    throw new Error('Email not registered. Please register first.');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to DB
  account.otp = otp;
  account.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await account.save();

  // Send Email
  const message = `Your password reset OTP is ${otp}. It is valid for 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #333;">Password Reset Protocol</h2>
      <p>A recovery request has been initiated for your account. Please use the following One-Time Password (OTP) to proceed:</p>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  console.log('--- FORGOT PASSWORD OTP (USER/EMPLOYEE) ---');
  console.log(`Email: ${account.email}`);
  console.log(`OTP: ${otp}`);
  console.log('---------------------------');

  try {
    await sendEmail({
      email: account.email,
      subject: 'Password Reset OTP - Dynamic Ticks',
      message,
      html
    });

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    // If email fails, we still return 200 so the user can test with the console OTP
    res.status(200).json({
      message: 'OTP generated. (Email delivery failed - check server console for code)',
      emailError: err.message
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email: rawEmail, otp } = req.body;
  const email = rawEmail.toLowerCase();
  const account = await findAccount(email);

  console.log(`--- DEBUG: Verify OTP ---`);
  console.log(`Email: ${email}, OTP provided: ${otp}`);
  if (!account) {
    console.log('Account not found in DB');
  } else {
    console.log(`Stored OTP: ${account.otp} (type: ${typeof account.otp})`);
    console.log(`Provided OTP: ${otp} (type: ${typeof otp})`);
    console.log(`OTP Expire: ${account.otpExpire}, Current Time: ${new Date()}`);
    console.log(`Mismatch OTP: ${String(account.otp) !== String(otp)}`);
    console.log(`Is Expired: ${account.otpExpire < Date.now()}`);
  }

  if (!account || String(account.otp) !== String(otp) || account.otpExpire < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // If this is a user who is not yet verified, verify them now
  if (account.constructor.modelName === 'User' && !account.isVerified) {
    account.isVerified = true;
    account.otp = undefined;
    account.otpExpire = undefined;
    await account.save();
    return res.status(200).json({
      message: 'Account verified successfully! You can now login.',
      verified: true
    });
  }

  res.status(200).json({ message: 'OTP verified successfully.', verified: false });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email: rawEmail, otp, password } = req.body;
  const email = rawEmail.toLowerCase();
  const account = await findAccount(email);

  if (!account || String(account.otp) !== String(otp) || account.otpExpire < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP. Please start the process again.');
  }

  // Update password
  account.password = password;
  account.otp = undefined;
  account.otpExpire = undefined;
  // Ensure account is verified if it was a User resetting pass
  if (account.constructor.modelName === 'User') {
    account.isVerified = true;
  }
  await account.save();

  res.status(200).json({ message: 'Password updated successfully. You can now login.' });
});

// @desc    Google auth
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('Google ID token is required.');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { name, email, sub: googleId } = ticket.getPayload();

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    // If user exists, link googleId if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true; // Auto verify if they login with Google
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      name,
      email: email.toLowerCase(),
      googleId,
      isVerified: true,
      // No password needed for Google users
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    role: user.isAdmin ? 'admin' : 'client',
    token: generateToken(user._id, user.isAdmin),
  });
});


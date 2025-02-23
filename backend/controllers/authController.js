import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// **Login User**
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });  // 401 = Unauthorized
    }

    if (!user.emailVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in' }); // 403 = Forbidden
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });  // 401 = Unauthorized
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ 
      msg: 'Login successful', 
      token, 
      role: user.role // ✅ FIXED: Sends role for frontend redirection 
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// **Register User**
export const registerUser = async (req, res) => {
  console.log('Register request received:', req.body); // Log incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Log validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role, contactNumber } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    let user = await User.findOne({ email: lowerEmail });

    // If user exists but email is not verified, delete the old record
    if (user && !user.emailVerified) {
      console.log('Deleting unverified user:', user.email); // Log deletion
      await User.deleteOne({ email: lowerEmail });
      user = null; // Reset user to allow registration
    }

    if (user) {
      console.log('User already exists:', user.email); // Log existing user
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Rest of the registration logic...
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpiration = Date.now() + 10 * 60 * 1000;

    const mailOptions = {
      from: `"Apt Hub" <${process.env.EMAIL_USER}>`,
      to: lowerEmail,
      subject: 'Email Verification - Apt Hub',
      html: `
        <div style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Hello, ${username}!</h2>
          <p style="font-size: 16px; color: #555;">Your OTP for email verification is:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background: #007bff; color: white; border-radius: 5px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">This OTP will expire in <strong>2 minutes</strong>.</p>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ msg: 'Error sending OTP email' });
      }

      user = new User({
        username,
        email: lowerEmail,
        password: hashedPassword,
        role: role.toLowerCase(),
        contactNumber,
        otp,
        otpExpiration,
        emailVerified: false,
      });

      await user.save();
      console.log('Email sent:', info.response);
      res.status(201).json({ msg: 'OTP sent to email, please verify your email.' });
    });

  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// **Verify OTP**
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.otpExpiration < Date.now()) {
      return res.status(400).json({ msg: 'OTP expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    res.status(200).json({ msg: 'Email successfully verified!' });

  } catch (err) {
    console.error('Error during OTP verification:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// **Resend OTP**
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ msg: 'User already verified' });
    }

    const newOtp = generateOTP();
    user.otp = newOtp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000;
    await user.save();

    transporter.sendMail({
      from: `"Apt Hub" <${process.env.EMAIL_USER}>`,
      to: lowerEmail,
      subject: 'Resend OTP - Apt Hub',
      text: `Your new OTP is: ${newOtp}. It will expire in 2 minutes.`,
    });

    res.status(200).json({ msg: 'New OTP sent successfully.' });

  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// **Send OTP for Reset**
export const sendOtpForReset = async (req, res) => {
  const { email } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // Send email with OTP
    const mailOptions = {
      from: `"Apt Hub" <${process.env.EMAIL_USER}>`,
      to: lowerEmail,
      subject: 'Password Reset OTP - Apt Hub',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>Your OTP for resetting your password is:</p>
          <h3 style="background: #007bff; color: white; padding: 10px; border-radius: 5px; text-align: center;">${otp}</h3>
          <p>This OTP will expire in 2 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'OTP sent to email' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// **Verify OTP and Reset Password**
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const lowerEmail = email.toLowerCase();

  // Validate password strength before proceeding
  if (newPassword.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.otp || user.otpExpiration < Date.now()) {
      return res.status(400).json({ msg: 'OTP expired or invalid' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Incorrect OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpiration = undefined;

    await user.save();
    res.status(200).json({ msg: 'Password reset successful' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

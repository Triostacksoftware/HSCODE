import express from 'express';
import { adminLogin, adminVerification, emailVerification, forgotPassword, login, otpVerification, resetPassword, signup, userVerification } from '../controllers/auth.ctrls.js';

const router = express.Router();


// user auth
router.post('/signup', signup);
router.post('/email-verification', emailVerification);;
router.post('/login', login);
router.post('/user-verification', userVerification);
router.post('/forgot-password', forgotPassword);
router.post('/otp-verification', otpVerification);
router.post('/reset-password', resetPassword);

// admin auth
router.post('/admin-login', adminLogin);
router.post('admin-verification', adminVerification);

export default router;
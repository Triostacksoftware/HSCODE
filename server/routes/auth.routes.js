import express from 'express';
import { emailVerification, forgotPassword, login, otpVerification, resetPassword, signup, userVerification } from '../controllers/auth.ctrls.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/email-verification', emailVerification);;
router.post('/login', login);
router.post('/user-verification', userVerification);
router.post('/forgot-password', forgotPassword);
router.post('/otp-verification', otpVerification);
router.post('/reset-password', resetPassword);

export default router;
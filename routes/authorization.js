
import express from 'express';
import authenticationMiddleware from '../middlewares/authentication.js';

/*Validation Schema */
import registerSchema from '../utils/validationSchema/Signup.js'
import loginSchema from '../utils/validationSchema/Login.js';
import otpSchema from '../utils/validationSchema/Otp.js'

// Middleware to validate request body using Joi
import validation from '../utils/validator.js';
import { register, login, resendVerificationOtp, activateAccount, forgotPassword, reset, resetPassword, resendResetPasswordOtp, refreshUser } from '../controllers/auth.js';


const router = express.Router();


// @route POST /api/v1/auth/register
router.post(
    '/register',
    validation(registerSchema),
    register
);

// @route GET /api/v1/auth/resend-verification-otp
router.get(
    '/resend/otp',
    authenticationMiddleware,
    resendVerificationOtp
);

// @route POST /api/v1/auth/login
router.post(
    '/login',
    validation(loginSchema),
    login
);

// @route POST /api/v1/auth/activate/email
router.post(
    '/activate/email',
    authenticationMiddleware,
    validation(otpSchema),
    activateAccount
);


// @route POST /api/v1/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route POST /api/v1/auth/reset
router.post('/reset', authenticationMiddleware, reset);

// @route POST /api/v1/auth/reset-password
router.post('/reset-password', authenticationMiddleware, resetPassword);

// @route GET /api/v1/auth/resend-reset-otp
router.post(
    '/resend/reset/otp',
    resendResetPasswordOtp
);

// @route GET /api/v1/auth/user
router.get(
    '/user',
    authenticationMiddleware,
    refreshUser
);




export default router;

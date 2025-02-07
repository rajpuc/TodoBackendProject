import express from 'express';
const router = express.Router();
import * as authController from '../app/controllers/authController.js';
import checkVerified from '../app/middlewares/checkVerified.js';

//development
router.get('/drop-db',authController.dropDatabase);

//USers
router.post('/registration',authController.validateRegistration,authController.registration);
router.post('/login',checkVerified, authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.patch("/resend-verification-email", authController.resendVerificationEmail);


router.patch("/request-reset", authController.requestPasswordReset); // Request reset link
router.patch("/reset-password",authController.validateResetPassword, authController.resetPassword); // Reset password using token
router.patch("/resend-reset-link", authController.resendResetLink); // Resend reset link if expired


//Tasks

export default router;
import UserModel from "../models/userModel.js";
import { body, validationResult } from "express-validator";
import { hashPassword, passComparison } from "../utility/passUtility.js";
import { generateToken } from "../utility/tokenUtility.js";
import crypto from "crypto";
import { sendVerificationEmail, sendResetEmail } from "../utility/emailUtility.js";

//For development only Dropdatabase
import mongoose from "mongoose";
/**
 * @desc Drop the entire MongoDB database
 * @route DELETE /api/database/drop
 * @access Private (You should protect this route)
 */
export const dropDatabase = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ message: "Database not connected" });
        }

        await mongoose.connection.db.dropDatabase();
        console.log("Database dropped successfully");

        res.status(200).json({ message: "Database dropped successfully" });
    } catch (error) {
        console.error("Error dropping database:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//validation rules for registration
export const validateRegistration = [
    body("email")
        .isEmail().withMessage("Invalid email format")
        .custom(async (value) => {
            const user = await UserModel.findOne({ email: value });
            if (user) throw new Error("Email already exists");
            return true;
        }),

    body("firstname").trim().escape().notEmpty().withMessage("First name is required"),
    body("lastname").trim().escape().notEmpty().withMessage("Last name is required"),
    body("mobile").isMobilePhone().withMessage("Invalid mobile number"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[0-9]/).withMessage("Must contain at least one number")
        .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter"),
];

// reset password validation
export const validateResetPassword = [
    body("newPassword")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[0-9]/).withMessage("Must contain at least one number")
        .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter"),
];

//user registration controller
export const registration = async function (req, res) {
    try {
        //validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'failed',
                errors: errors.array()
            })
        }

        const { email, firstname, lastname, mobile, password } = req.body;

        // Hash password before saving
        const hashedPassword = await hashPassword(password);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Set expiry time (15 minutes from now)
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setMinutes(verificationTokenExpires.getMinutes() + 2);

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Create new user    
        let createdUser = await UserModel.create({
            email,
            firstname,
            lastname,
            mobile,
            password: hashedPassword,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: verificationTokenExpires,
        });


        res.status(201).json({
            status: 'success',
            message: "Registration successful. Please verify your email within 15 minutes.",
            data: {
                id: createdUser._id,
                email: createdUser.email,
                firstname: createdUser.firstname,
                lastname: createdUser.lastname,
                mobile: createdUser.mobile,
            }, // Excluding password in response for security
        })
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }
}

//user login controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: "failed", message: "Invalid email or password" });
        }

        // Compare passwords
        const isPasswordValid = await passComparison(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "failed", message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateToken(user.email, user._id);

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token: token
        });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

//verify email controller
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await UserModel.findOne({ emailVerificationToken: token });
      
        // Check if the token is valid
        if (!user) {
            return res.status(400).json({ status: "failed", message: "Invalid or expired token" });
        }


        // Check if the token has expired
        if (user.emailVerificationTokenExpires < new Date()) {
            return res.status(400).json({ status: "failed", message: "Verification link expired. Please register again." });
        }

        // Mark user as verified and clear the token
        user.verified = true;
        user.emailVerificationToken = null;
        user.emailVerificationTokenExpires = null;
        await user.save();

        res.status(200).json({ status: "success", message: "Email successfully verified" });
    } catch (error) {
        res.status(500).json({ status: "failed", message: error.message });
    }
};

//resend email verification
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ status: "failed", message: "User not found" });
        }

        if (user.verified) {
            return res.status(400).json({ status: "failed", message: "Email is already verified" });
        }

        // Generate a new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Send new verification email
        await sendVerificationEmail(user.email, verificationToken);

        // Update emailVerificationToken and emailVerificationTokenExpires
        user.emailVerificationToken = verificationToken;
        user.emailVerificationTokenExpires = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes expiry
        await user.save();

        res.status(200).json({ status: "success", message: "Verification email resent successfully." });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};


// Request Password Reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }
        
        // Generate reset token 
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");

        // Send reset email
        await sendResetEmail(user.email, resetPasswordToken);

        // update resetPasswordToken & resetPasswordTokenExpires
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpires = Date.now() + 2 * 60 * 1000; // 15 minutes expiry
        await user.save();

        res.status(200).json({ status: "success", message: "Password reset email sent" });

    } catch (error) {
        console.error("Error in requestPasswordReset:", error.message);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

// Verify Reset Token & Reset Password
export const resetPassword = async (req, res) => {
    try {
        //validate new requested password
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'failed',
                errors: errors.array()
            })
        }

        const { token, newPassword } = req.body;

        // Check if token is valid and not expired
        const user = await UserModel.findOne({ resetPasswordToken: token, resetPasswordTokenExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ status: "failed", message: "Invalid or expired token" });
        }

        // Hash new password and save
        user.password = await hashPassword(newPassword);
        user.resetPasswordToken = null; // Remove token after reset
        user.resetPasswordTokenExpires = null;
        await user.save();

        res.status(200).json({ status: "success", message: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword:", error.message);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

// Resend Reset Link
export const resendResetLink = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Ensure previous token is expired before resending
        if (user.resetPasswordToken && user.resetPasswordTokenExpires > Date.now()) {
            return res.status(400).json({ status: "failed", message: "Please wait before requesting a new reset link" });
        }

        // Generate new reset token
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpires = Date.now() + 2 * 60 * 1000; // 15 minutes expiry
        await user.save();

        // Send reset email
        await sendResetEmail(user.email, resetPasswordToken);

        res.status(200).json({ status: "success", message: "New password reset email sent" });
    } catch (error) {
        console.error("Error in resendResetLink:", error.message);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

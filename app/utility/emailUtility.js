import nodemailer from "nodemailer";
import { MY_EMAil, MY_EMAil_PASS } from "../config/config.js";

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MY_EMAil,
                pass: MY_EMAil_PASS,
            },
        });

        const mailOptions = {
            from: `"Rajesh Pal" <basiceconomics.be@gmail.com>`,
            to: email,
            subject: "Email Verification",
            html: `<p>Click <a href="http://localhost:5050/api/v1/verify-email/${verificationToken}">here</a> to verify your email.</p>`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Error sending verification email.");
    }
};

// Send Reset Password Email
export const sendResetEmail = async (email, resetToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MY_EMAil,
                pass: MY_EMAil_PASS,
            },
        });

        const resetLink = `http://localhost:5050/api/v1/reset-password/${resetToken}`;

        const mailOptions = {
            from: `"Support Team" <${MY_EMAil}>`,
            to: email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>This link is valid for only 15 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending reset email:", error.message);
        throw new Error("Error sending password reset email.");
    }
};


import jwt from "jsonwebtoken";
import { JWT_EXPIRE_TIME,JWT_KEY} from "../config/config.js";

/**
 * Generates a JWT token for authentication.
 * @param {string} email - User's email.
 * @param {string} userId - User's unique ID.
 * @returns {string} - Signed JWT token.
 */
export const generateToken = (email, userId) => {
    try {
        const payload = { email, userId };
        const options = { expiresIn: JWT_EXPIRE_TIME };

        return jwt.sign(payload, JWT_KEY, options);
    } catch (error) {
        console.error("Token generation error:", error.message);
        throw new Error("Failed to generate authentication token.");
    }
};

/**
 * Verifies and decodes a JWT token.
 * @param {string} token - JWT token to verify.
 * @returns {object|null} - Decoded payload if valid, or `null` if invalid.
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_KEY);
    } catch (error) {
        console.error("Token verification error:", error.message);
        return null; // Returns null for invalid tokens
    }
};

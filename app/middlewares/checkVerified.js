import UserModel from "../models/userModel.js";

const checkVerified = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Ensure email is provided
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Find user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if user is verified
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: "Your account is not verified. Please verify your email before logging in.",
            });
        }

        // User is verified, proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error("Error in checkVerified middleware:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export default checkVerified;
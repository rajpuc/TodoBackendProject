# TodoBackendProject

### 🚀 **Introduction to `express-validator`**
`express-validator` is a middleware for **Express.js** that helps you validate and sanitize user input before processing it in your routes.

---

## 📌 **1. Installing `express-validator`**
First, install the package using npm or yarn:
```sh
npm install express-validator
# OR
yarn add express-validator
```

---

## 📌 **2. Basic Usage in an Express Route**
`express-validator` works by using **middleware functions** that validate request data before reaching the route handler.

### ✅ **Example: Validate User Registration Data**
```js
import express from "express";
import { body, validationResult } from "express-validator";

const app = express();
app.use(express.json()); // Middleware to parse JSON request body

// Validation rules
const validateRegistration = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("firstname").notEmpty().withMessage("First name is required"),
    body("lastname").notEmpty().withMessage("Last name is required"),
    body("mobile").isMobilePhone().withMessage("Invalid mobile number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

// Route with validation
app.post("/register", validateRegistration, (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() });
    }

    // If no validation errors, proceed with registration logic
    res.status(201).json({ status: "success", message: "User registered successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## 📌 **3. How Validation Works**
1. **Validation Middleware (`validateRegistration`)**
   - Uses `body()` to check and validate request fields.
   - If validation fails, `withMessage()` provides a custom error message.

2. **Handling Validation Errors**
   - `validationResult(req)` collects all validation errors.
   - If errors exist, `errors.array()` returns an array of error messages.

---

## 📌 **4. Advanced Validation Techniques**

### 🔹 **A. Custom Validation (e.g., Checking Strong Passwords)**
```js
body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
```

---

### 🔹 **B. Checking if Email Already Exists (Async Validation)**
```js
import UserModel from "../models/userModel.js";

body("email").custom(async (value) => {
    const user = await UserModel.findOne({ email: value });
    if (user) {
        throw new Error("Email already registered");
    }
    return true;
});
```

---

### 🔹 **C. Sanitizing Input (Prevent XSS & Injection)**
```js
body("firstname").trim().escape(),  // Removes extra spaces and escapes harmful characters
body("email").normalizeEmail()      // Converts email to lowercase & removes dots (for Gmail)
```

---

## 📌 **5. Example: Combining All Features**
```js
const validateUser = [
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
```
💡 **Now use `validateUser` as middleware in your route.**  

---

## 📌 **6. Common Validation Methods in `express-validator`**
| Method | Description |
|--------|-------------|
| `isEmail()` | Checks if the input is a valid email |
| `isLength({ min, max })` | Validates string length |
| `isMobilePhone()` | Ensures the input is a valid phone number |
| `matches(regex)` | Validates input against a regex pattern |
| `trim()` | Removes leading and trailing spaces |
| `escape()` | Escapes HTML characters to prevent XSS |
| `normalizeEmail()` | Normalizes email format |
| `custom(fn)` | Defines a custom validation function |

---

## 🎯 **Final Thoughts**
✅ `express-validator` helps prevent invalid data from reaching your database.  
✅ Always **validate & sanitize** user input to improve security.  
✅ Use **custom validation** for complex rules like checking for duplicate emails.  

## **Another Method for using verification email:**
```javascript

import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURITY, EMAIL_USER, EMAIL_PASS, EMAIL_UN_AUTH } from "../config/config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        // Configure transporter
        let transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: EMAIL_SECURITY, // false for port 25 (No SSL/TLS)
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: EMAIL_UN_AUTH, // Ignore self-signed certificates if false
            }
        });

        // Email options
        const mailOptions = {
            from: `"Team Rabbil" <${EMAIL_USER}>`,
            to: email,
            subject: "Email Verification",
            html: `<p>Click <a href="http://localhost:5050/api/v1/user/verify-email/${verificationToken}">here</a> to verify your email.</p>`,
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        console.log(info);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Email sending failed: " + error.message);
    }
};

import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURITY, EMAIL_USER, EMAIL_PASS, EMAIL_UN_AUTH } from "../config/config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        // Configure transporter
        let transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: EMAIL_SECURITY, // false for port 25 (No SSL/TLS)
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: EMAIL_UN_AUTH, // Ignore self-signed certificates if false
            }
        });

        // Email options
        const mailOptions = {
            from: `"Team Rabbil" <${EMAIL_USER}>`,
            to: email,
            subject: "Email Verification",
            html: `<p>Click <a href="http://localhost:5050/api/v1/user/verify-email/${verificationToken}">here</a> to verify your email.</p>`,
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        console.log(info);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Email sending failed: " + error.message);
    }
};

```

## **Drop DataBase Controller**
```javascript
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
```
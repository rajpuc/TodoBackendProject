import bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - The hashed password.
 */

export const hashPassword = async (password) => {
    try {
        const saltRounds = 10; 
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Error hashing password: " + error.message);
    }
};




/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password entered by the user.
 * @param {string} hashedPassword - The stored hashed password from the database.
 * @returns {Promise<boolean>} - Returns `true` if passwords match, otherwise `false`.
 */
export const passComparison = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error("Error comparing passwords: "+ error.message);
    }
};

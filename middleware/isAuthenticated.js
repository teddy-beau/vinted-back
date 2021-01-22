// PACKAGES & MODELS IMPORT
const mongoose = require("mongoose");
const User = require("../models/User");

// MIDDLEWARE FUNCTION
const isAuthenticated = async (req, res, next) => {
    try {
        // Making sure there is a token
        if (req.headers.authorization) {
            // Get user token from HTTP headers
            const token = req.headers.authorization.replace("Bearer ", "");

            // Find user with the token in DB and selecting only the User keys we need (and excluding sensitive data)
            const user = await User.findOne({ token: token }).select(
                "account email token"
            );

            // If user with the token exists, next
            if (user) {
                req.user = user; // Add user key to req
                return next(); // Exit middleware and continue code execution
            } else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// MIDDLEWARE EXPORT
module.exports = isAuthenticated;

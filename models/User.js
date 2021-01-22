// PACKAGE IMPORT
const mongoose = require("mongoose");

// DB MODEL
const User = mongoose.model("User", {
    email: {
        unique: true,
        required: true,
        type: String,
    },
    account: {
        username: {
            required: true,
            type: String,
        },
        phone: String,
        avatar: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    token: String,
    hash: String,
    salt: String,
});

// Export model
module.exports = User;

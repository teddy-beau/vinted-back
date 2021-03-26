// PACKAGES IMPORT & INIT.

const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const cloudinary = require("cloudinary").v2;

// MODELS IMPORT
const User = require("../models/User");
const Offer = require("../models/Offer");

// ROUTE POST: SIGN UP
router.post("/user/signup", async (req, res) => {
   try {
      // Checking user existence
      const user = await User.findOne({ email: req.fields.email });

      if (!user) {
         // Checking all fields are provided
         if (req.fields.username && req.fields.email && req.fields.password) {
            // Password encryption
            const salt = uid2(64);
            const hash = SHA256(req.fields.password + salt).toString(encBase64);
            const token = uid2(64);

            // User creation
            const newUser = new User({
               email: req.fields.email,
               account: {
                  username: req.fields.username,
                  phone: req.fields.phone,
               },
               salt: salt,
               hash: hash,
               token: token,
            });

            // Upload profile picture
            if (req.fields.avatar) {
               let pictureToUpload = req.files.avatar.path; // Local link to picture
               const result = await cloudinary.uploader.upload(
                  pictureToUpload,
                  {
                     folder: `/vinted/users/${newUser._id}`,
                  }
               ); // Cloudinary upload result

               // Adding the picture's details to the newUser (better to save the whole result in case we need other picture data)
               newUser.account.avatar = result;
            }

            await newUser.save();
            console.log("New user created", newUser);

            res.status(201).json({
               _id: newUser._id,
               token: newUser.token,
               account: newUser.account,
            });
         } else {
            res.status(400).json({
               message: "Email, username and password are mandatory.",
            });
         }
      } else {
         res.status(400).json({
            message: "An account already exists for this email.",
         });
      }
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Route POST : LOG IN
router.post("/user/login", async (req, res) => {
   try {
      // Find the user with email
      const user = await User.findOne({ email: req.fields.email });
      if (user) {
         // If user exists, create a new hash
         const newHash = SHA256(req.fields.password + user.salt).toString(
            encBase64
         );
         // Compare new hash with the one in the DB
         if (newHash === user.hash) {
            res.status(200).json({
               // message:
               //    "Login successful, you'll be redirected to your account shortly.",
               _id: user._id,
               token: user.token,
               account: user.account,
            });
         } else {
            res.status(400).json({
               message: "Incorrect email or password.",
            });
         }
      } else {
         res.status(400).json({
            message: "Incorrect email or password.",
         });
      }
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});
// Export routes
module.exports = router;

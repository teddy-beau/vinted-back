// PACKAGES IMPORT
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
// Cloudinary config moved to index.js to be used globally

// MIDDLEWARE IMPORT
const isAuthenticated = require("../middleware/isAuthenticated");

// MODELS IMPORT
const Offer = require("../models/Offer");

router.post("/test", isAuthenticated, async (req, res) => {
   try {
      // Creating the new offer (and its ID)
      const newOffer = new Offer({
         product_name: req.fields.title,
         product_description: req.fields.description,
         product_price: req.fields.price,
         product_details: [
            { MARQUE: req.fields.brand },
            { TAILLE: req.fields.size },
            { ÉTAT: req.fields.condition },
            { COULEUR: req.fields.color },
            { EMPLACEMENT: req.fields.city },
         ],
         owner: req.user, // Get all user info to avoid populate issues
      });

      // Upload of multiple pictures
      console.log("req.files", req.files);
      const fileKeys = Object.keys(req.files); // [ 'picture 1', 'picture 2', ... ]

      console.log("fileKeys", fileKeys);

      let results = [];

      // Making sure a file is associated with the files keys
      fileKeys.forEach(async (fileKey) => {
         if (req.files[fileKey].size === 0) {
            console.log("File key exist but no file uploaded");
            res.status(400).json({
               message: "The file is missing",
            });
         } else {
            const filePath = req.files[fileKey].path; // Local path to the picture(s)
            const result = await cloudinary.uploader.upload(filePath, {
               folder: `/vinted/offers/${newOffer._id}`,
               public_id: `${fileKey}`,
            });
            console.log(`${fileKey} uploaded`);
            result.public_name = fileKey;
            results.push(result);

            // If there are no more pictures to upload, next!
            if (Object.keys(results).length === fileKeys.length) {
               newOffer.product_pictures = results;
               // Save the newOffer with files details in the DB
               await newOffer.save();
               console.log("Pictures details saved in DB");
               res.status(201).json(newOffer);
            }
         }
      });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE EXPORT
module.exports = router;

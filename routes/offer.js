// PACKAGES IMPORT
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
// Cloudinary config moved to index.js to be used globally

// MIDDLEWARE IMPORT
const isAuthenticated = require("../middleware/isAuthenticated");

// MODELS IMPORT
const User = require("../models/User");
const Offer = require("../models/Offer");

// ROUTE POST: PUBLISHING AN OFFER
router.post("/offer/publish", isAuthenticated, async (req, res) => {
   try {
      // console.log(req.user); // From isAuthenticated middleware

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

      // // Upload single picture
      // let pictureToUpload = req.files.picture.path; // Local link to picture
      // const result = await cloudinary.uploader.upload(pictureToUpload, {
      //     folder: `/vinted/offers/${newOffer._id}`,
      // }); // Cloudinary upload result
      // // Adding the picture's details to the newOffer (better to save the whole result in case we need other picture data)
      // newOffer.product_pictures = result;

      // Upload of multiple pictures
      console.log(req.files);
      const fileKeys = Object.keys(req.files); // [ 'picture 1', 'picture 2', ... ]
      let results = [];

      // If there are no keys for req.files
      if (fileKeys.length === 0) {
         await newOffer.save();
         res.status(201).json(newOffer);
         console.log("Saved without pictures");
      } else {
         fileKeys.forEach(async (fileKey) => {
            // Making sure a file is associated with the files keys
            if (req.files[fileKey].size === 0) {
               console.log("File key exist but no file uploaded");
               res.status(400).json({
                  message: "The file is missing",
               });
            } else {
               const filePath = req.files[fileKey].path; // Local path to the picture(s)
               const result = await cloudinary.uploader.upload(filePath, {
                  folder: `/vinted/offers/${newOffer._id}`,
                  // public_id: `${fileKey}`,
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
      }
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE DELETE
router.delete("/offer/delete/:_id", isAuthenticated, async (req, res) => {
   try {
      let offerToDelete = await Offer.findById(req.params._id);
      console.log(offerToDelete);
      if (offerToDelete) {
         // Delete assets with a public ID that starts with the given prefix
         await cloudinary.api.delete_resources_by_prefix(
            `vinted/offers/${req.params._id}`
         );
         // Delete the empty folder
         await cloudinary.api.delete_folder(`vinted/offers/${req.params._id}`);

         // Delete the offer from the DB
         offerToDelete = await Offer.findByIdAndDelete(req.params._id);

         res.status(200).json({
            message: "Your offer has been successfully deleted.",
         });
      } else {
         res.status(400).json({
            message: "Bad request",
         });
      }
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE PUT: UPDATE OFFER
router.put("/offer/update/:id", isAuthenticated, async (req, res) => {
   try {
      const offerToUpdate = await Offer.findById(req.params.id);

      // Updating values when provided
      if (req.fields.title) {
         offerToUpdate.product_name = req.fields.title;
      }
      if (req.fields.description) {
         offerToUpdate.product_description = req.fields.description;
      }
      if (req.fields.price) {
         offerToUpdate.product_price = req.fields.price;
      }

      // For loop for the product details comparing the existing (or not) one with the req.fields
      const details = offerToUpdate.product_details;
      for (i = 0; i < details.length; i++) {
         if (details[i].MARQUE) {
            if (req.fields.brand) {
               details[i].MARQUE = req.fields.brand;
            }
         }
         if (details[i].TAILLE) {
            if (req.fields.size) {
               details[i].TAILLE = req.fields.size;
            }
         }
         if (details[i].ÉTAT) {
            if (req.fields.condition) {
               details[i].ÉTAT = req.fields.condition;
            }
         }
         if (details[i].COULEUR) {
            if (req.fields.color) {
               details[i].COULEUR = req.fields.color;
            }
         }
         if (details[i].EMPLACEMENT) {
            if (req.fields.location) {
               details[i].EMPLACEMENT = req.fields.location;
            }
         }
      }

      // Mark the array as having pending changes to write to the DB.
      offerToUpdate.markModified("product_details");

      // Updating images
      const fileKeys = Object.keys(req.files); // [ 'picture 1', 'picture 2', ... ]
      let results = offerToUpdate.product_pictures;
      // console.log(results);

      // If there are no keys for req.files
      if (fileKeys.length === 0) {
         await offerToUpdate.save();
         res.status(201).json(offerToUpdate);
         // console.log("Saved without pictures");
      } else {
         fileKeys.forEach(async (fileKey) => {
            // Making sure a file is associated with the files keys
            if (req.files[fileKey].size === 0) {
               // console.log("File key exist but no file uploaded");
               res.status(400).json({
                  message: "The file is missing",
               });
            } else {
               // console.log(offerToUpdate.product_pictures[fileKey].public_id);
               if (
                  offerToUpdate.product_pictures[fileKey].public_id !==
                  undefined
               ) {
                  console.log("Entered: if public_id isn't undefined");
                  // The public_id exists
                  const filePath = req.files[fileKey].path; // Local path to the picture(s)
                  const result = await cloudinary.uploader.upload(filePath, {
                     folder: `/vinted/offers/${offerToUpdate._id}/`,
                     public_id: `${fileKey}`,
                  });
                  console.log("Pictures uploaded");
                  results[fileKey] = result;
                  // The public_id doesn't exist
               } else {
                  console.log("Entered: else");
                  const filePath = req.files[fileKey].path; // Local path to the picture(s)
                  const result = await cloudinary.uploader.upload(filePath, {
                     folder: `/vinted/offers/${offerToUpdate._id}`,
                     public_id: `${fileKey}`,
                  });
               }

               // If there are no more pictures to upload, next!
               if (Object.keys(results).length === fileKeys.length) {
                  offerToUpdate.product_pictures = results;
                  // Save the offerToUpdate with files details in the DB
                  await offerToUpdate.save();
                  console.log(
                     "Picture details saved in DB",
                     offerToUpdate.product_pictures
                  );
                  res.status(201).json({
                     message: "Offer updated successfully.",
                  });
               }
            }
         });
      }
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE GET OFFER BY ID
router.get("/offer/:_id", async (req, res) => {
   try {
      // Get the offer from DB by ID
      const offerToFind = await Offer.findById(req.params._id).populate({
         path: "owner",
         select: "account",
      });
      console.log(offerToFind);
      // console.log(req.params);

      res.status(200).json(offerToFind);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE EXPORT
module.exports = router;

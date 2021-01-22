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
router.post("/vinted/offer/publish", isAuthenticated, async (req, res) => {
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

        // Upload single picture
        let pictureToUpload = req.files.picture.path; // Local link to picture
        const result = await cloudinary.uploader.upload(pictureToUpload, {
            folder: `/vinted/offers/${newOffer._id}`,
        }); // Cloudinary upload result

        // Adding the picture's details to the newOffer (better to save the whole result in case we need other picture data)
        newOffer.product_image = result;

        /*        
        // Upload multiple pictures
        const fileKeys = Object.keys(req.files); // [ 'picture 1', 'picture 2', ... ]
        let results = {};

        if (fileKeys.length === 0) {
            res.status(400).json({ message: "No picture(s) uploaded!" });
        }

        fileKeys.forEach(async (fileKey) => {
            const filePath = req.files[fileKey].path; // Local path to the picture(s)
            const result = await cloudinary.uploader.upload(filePath, {
                folder: `/vinted/offers/${newOffer._id}`,
            }); // Picture(s) upload into dedicated folder

            console.log("result: ", result); // object with picture info

            results[fileKey] = {
                result: result,
            };

            // If there are no more pictures to upload, next!
            if (Object.keys(results).length === fileKeys.length) {
                newOffer.product_image = results;
            }
        });

        console.log("newOffer: ", newOffer.product_image); // Empty object
        */

        // Save the newOffer in the DB
        await newOffer.save();

        res.status(201).json(newOffer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ROUTE DELETE
router.delete(
    "/vinted/offer/delete/:_id",
    isAuthenticated,
    async (req, res) => {
        try {
            let offerToDelete = await Offer.findById(req.params._id);
            console.log(offerToDelete);
            if (offerToDelete) {
                // Delete assets with a public ID that starts with the given prefix
                await cloudinary.api.delete_resources_by_prefix(
                    `vinted/offers/${req.params._id}`
                );
                // Delete the empty folder
                await cloudinary.api.delete_folder(
                    `vinted/offers/${req.params._id}`
                );

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
    }
);

// ROUTE PUT: UPDATE OFFER
router.put("/vinted/offer/update/:id", isAuthenticated, async (req, res) => {
    try {
        const offerToUpdate = await Offer.findById(req.params);

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
        if (req.fields.brand) {
            offerToUpdate.product_details[0].MARQUE = req.fields.brand;
        }
        if (req.fields.size) {
            offerToUpdate.product_details[1].TAILLE = req.fields.size;
        }
        if (req.fields.condition) {
            offerToUpdate.product_details[2]["ÉTAT"] = req.fields.condition;
        }
        if (req.fields.color) {
            offerToUpdate.product_details[3].COULEUR = req.fields.color;
        }
        if (req.fields.city) {
            offerToUpdate.product_details[4].EMPLACEMENT = req.fields.city;
        }

        // Saving the changes
        await offerToUpdate.save();
        // console.log(offerToUpdate);

        res.status(200).json({ message: "Offer updated." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ROUTE GET OFFER BY ID
router.get("/vinted/offer/:_id", async (req, res) => {
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

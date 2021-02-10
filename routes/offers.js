// PACKAGES IMPORT & INIT.
const express = require("express");
const router = express.Router();

// MODELS IMPORT
const User = require("../models/User");
const Offer = require("../models/Offer");

// ROUTE GET: ALL OFFERS (SORTING OPTIONS)
router.get("/offers", async (req, res) => {
   try {
      // Object where all filters to be used will be stored
      let filters = {};
      // Sort by product name (title)
      if (req.query.title) {
         filters.product_name = new RegExp(req.query.title, "i");
      }
      // Price range set up (query priceMin=/priceMax=)
      if (req.query.priceMin) {
         filters.product_price = {
            $gte: req.query.priceMin,
         };
      }
      if (req.query.priceMax) {
         if (filters.product_price) {
            filters.product_price.$lte = req.query.priceMax;
         } else {
            filters.product_price = {
               $lte: req.query.priceMax,
            };
         }
      }
      // Sorting set up (query: sort=price-asc/price-desc)
      let sortingOption = {};
      if (req.query.sort === "price-asc") {
         sortingOption = { product_price: 1 };
      }
      if (req.query.sort === "price-desc") {
         sortingOption = { product_price: -1 };
      }
      // Results to display on each page
      let resultLimit = 0;
      if (req.query.display) {
         resultLimit = Number(req.query.display);
      }
      // Calculating skip value
      let resultSkip = 0;
      if (req.query.page > 1) {
         resultSkip = resultLimit * (Number(req.query.page) - 1);
      }

      // Pulling the offers from the DB
      const resultCount = await Offer.countDocuments(filters);
      if (resultCount === 0) {
         res.status(204).json({ message: "No content" });
      }

      const allOffers = await Offer.find(filters)
         .populate({ path: "owner", select: "account" })
         .sort(sortingOption)
         // .select("product_name product_price")
         .skip(resultSkip)
         .limit(resultLimit);

      res.status(200).json({ count: resultCount, offers: allOffers });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE DELETE ALL
router.delete("/offer/delete-all", async (req, res) => {
   try {
      let offerToDelete = await Offer.deleteMany();
      res.status(200).json({
         message: "All offers have been successfully.",
      });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// ROUTE EXPORT
module.exports = router;

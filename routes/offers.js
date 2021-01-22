// PACKAGES IMPORT & INIT.
const express = require("express");
const router = express.Router();

// MODELS IMPORT
const User = require("../models/User");
const Offer = require("../models/Offer");

// ROUTE GET: ALL OFFERS (SORTING OPTIONS)
router.get("/vinted/offers", async (req, res) => {
    try {
        // Results to display on each page
        let resultLimit = 4;
        if (req.query.display) {
            resultLimit = req.query.display;
        }
        // Calculating skip value
        let resultSkip = 0;
        if (req.query.page) {
            resultSkip = resultLimit * (req.query.page - 1);
        }

        // Price range set up (query priceMin=/priceMax=)
        let priceMin = 0;
        if (req.query.priceMin) {
            priceMin = req.query.priceMin;
        }
        let priceMax = 100000;
        if (req.query.priceMax) {
            priceMax = req.query.priceMax;
        }

        // Sorting set up (query: sort=price-asc/price-desc)
        let sortingOption;
        if (req.query.sort === "price-asc") {
            sortingOption = 1;
        }
        if (req.query.sort === "price-desc") {
            sortingOption = -1;
        }

        // Filters to be used
        const filters = {
            product_name: RegExp(req.query.title, "i"),
            product_price: {
                $gte: priceMin,
                $lte: priceMax,
            },
        };

        // Pulling the offers from the DB
        const resultCount = await Offer.countDocuments(filters);
        if (resultCount === 0) {
            res.status(204).json({ message: "No content" });
        }

        const allOffers = await Offer.find(filters)
            .sort({ product_price: sortingOption })
            .select("product_name product_price")
            .skip(resultSkip)
            .limit(resultLimit);

        res.status(200).json({ count: resultCount, offers: allOffers });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ROUTE EXPORT
module.exports = router;

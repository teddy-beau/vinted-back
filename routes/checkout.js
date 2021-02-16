// PACKAGES IMPORT
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// MIDDLEWARE IMPORT
const isAuthenticated = require("../middleware/isAuthenticated");

// MODELS IMPORT
const User = require("../models/User");
const Offer = require("../models/Offer");

// CHECKOUT ROUTE (USING STRIPE)
router.post("/checkout", async (req, res) => {
   const stripeToken = req.fields.stripeToken;
   const response = await stripe.charges.create({
      amount: Number(req.fields.productPrice) * 100,
      currency: "eur",
      description: req.fields.productTitle,
      source: stripeToken,
   });
   console.log(response.status);

   // IMPLEMENT ORDER CREATION IN DB

   res.json(response);
});

// ROUTE EXPORT
module.exports = router;

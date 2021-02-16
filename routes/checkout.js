// PACKAGES IMPORT
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// MIDDLEWARE IMPORT
const isAuthenticated = require("../middleware/isAuthenticated");

// CHECKOUT ROUTE (USING STRIPE)
router.post("/checkout", isAuthenticated, async (req, res) => {
   const stripeToken = req.fields.stripeToken;
   const response = await stripe.charges.create({
      amount: Number(req.fields.total) * 100,
      currency: "eur",
      description: `VINTED | ${req.fields.productTitle}`,
      source: stripeToken,
   });
   console.log(response.status);

   // TODO : IMPLEMENT ORDER CREATION IN DB

   res.json(response);
});

// ROUTE EXPORT
module.exports = router;

// PACKAGES IMPORT & INIT.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(formidable({ multiples: true }));

// CONNECTION TO MONGODB & CLOUDINARY
mongoose.connect(process.env.MONGODB_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
});

//// Imported here so can be used in several routes
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ROUTES IMPORT
const userRoute = require("./routes/user");
app.use(userRoute);

const offerRoute = require("./routes/offer");
app.use(offerRoute);

const testRoute = require("./routes/test");
app.use(testRoute);

const offersRoute = require("./routes/offers");
app.use(offersRoute);

const checkoutRoute = require("./routes/checkout");
app.use(checkoutRoute);

// WRONG ROUTES
app.all("*", (req, res) => {
   res.status(404).json({ error: "Error, page not found!" });
});

// SERVER
app.listen(process.env.PORT || 3100, () => {
   console.log(`Server started on port ${process.env.PORT}`);
});

# Vinted Clone - Backend

<div align="center">

Project is based on Vinted, an online marketplace for secondhand clothing.

This repository is for the backend API of the project only. For more information about this projects, its features, some screenshot, and a link to the live version, please visit the 👉 [frontend repository](https://github.com/teddy-beau/vinted-front) 👈

<img src="https://github.com/teddy-beau/vinted-front/blob/main/_preview/vinted-login-buy.gif" alt="Vinted GIF" width="500" /></div>

## Stack & Dependencies

This API was built with Node JS and uses the following packages:

-  Express
-  Express Formidable
-  Mongoose
-  Stripe
-  Cloudinary
-  dotenv
-  cors
-  UID2

## Available Routes

**Offer**

-  Publishing an offer: /offer/publish
-  Delete an offer based on its id: /offer/delete/:\_id
-  Update an offer based on its id: /offer/update/:id
-  Get an offer's details: /offer/:\_id

**Offers**

-  Get details of all offers with sorting options: /offers
-  Delete all offers: /offers/delete-all _WARNING: use with caution! This will delete all offers from the database!_

**Users**

-  Sign up: /user/signup
-  Login: /user/login

**Checkout**

-  Payment with Stripe: /checkout

## Setup Instructions

Clone this repository :

```
git clone https://github.com/teddy-beau/vinted-back.git
```

Install dependencies:

```
npm install
```

Once the installation is complete, run it:

```
npx nodemon index.js
```

# Backend for a Vinted clone

Express, Express Formidable, MongoDB, Cloudinary

## OFFER ROUTES

### POST: PUBLISHING AN OFFER

/offer/publish

### DELETE ONE

/offer/delete/:\_id

### PUT: UPDATE OFFER

/offer/update/:id

### GET: OFFER BY ID

/offer/:\_id

## OFFERS ROUTES

### GET: ALL OFFERS (SORTING OPTIONS)

/offers

### DELETE ALL

/offer/delete-all
WARNING: use with caution! This will delete all offers from the database!

## USER ROUTES

### POST: SIGN UP

/user/sign-up

### POST : SIGN IN

/user/sign-in

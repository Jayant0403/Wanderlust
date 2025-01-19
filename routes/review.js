const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const {isLoggedIn,isOwner,validateReview,isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controllers/review.js")



//Reviews 
// POST Review Routes
router.post("/",isLoggedIn, validateReview,wrapAsync(reviewController.createReview));
  
 //DELETE Review Route
 router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

 module.exports = router;

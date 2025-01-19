const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js")
const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
// Index Route
.get(wrapAsync(listingController.index))
//Create Route
 .post(
    isLoggedIn,
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing));

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
//Update route
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
//Show Route
.get(wrapAsync(listingController.showListing))
//Delete Route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

// Index Route
// app.get("/listings",wrapAsync( async (req,res)=>{
//    const allListings = await Listing.find({});
//    res.render("listings/index.ejs",{allListings});

// })
// );







//Show Route
// app.get("/listings/:id", async (req, res) => {
//     try {
//         let { id } = req.params;

//         // Trim and validate the ID
//         id = id.trim(); // Remove any leading/trailing spaces
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).send("Invalid listing ID.");
//         }

//         // Find the listing by ID
//         const listing = await Listing.findById(id);
//         if (!listing) {
//             return res.status(404).send("Listing not found.");
//         }

//         // Render the listing page
//         res.render("listings/show.ejs", { listing });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("An error occurred while retrieving the listing.");
//     }
// });




 
 // Edit Route
 router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
 
 
 
 

 module.exports = router;
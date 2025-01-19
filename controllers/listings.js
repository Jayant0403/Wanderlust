const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const { listingSchema,reviewSchema } = require("../schema.js");
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});

    // Sanitize data to ensure price is valid
    allListings.forEach(listing => {
        if (listing.price == null || isNaN(listing.price)) {
            listing.price = 0; // or any default value you prefer
        }
    });

    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id.trim()).populate({path:"reviews",populate: {
        path: "author",
    },
}).populate("owner");
    if(!listing) {
    req.flash("error","Listing you requested for does not exist");
    res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req,res)=>{
    // let {title,description,price,image,country} = req.body;
   let url =  req.file.path;
   let filename = req.file.filename;
   console.log(url,"..",filename)
  
 //    if(!req.body.listing){
 //     throw new ExpressError(400,"Send valid data for listing");
 //    }
     const newListing = new Listing(req.body.listing);
     newListing.owner = req.user._id;
     newListing.image = {url,filename};
     await newListing.save();
     req.flash("success","New Listing Created!");
     res.redirect("/listings");
 
 }

 module.exports.renderEditForm=async (req,res)=>{
      let {id} = req.params;
      const listing = await Listing.findById(id.trim())
      let originalImageUrl = listing.image.url;
      originalImageUrl.replace("/upload","/upload/w_250");
      console.log(originalImageUrl);
      res.render("listings/edit.ejs",{listing,originalImageUrl});
      req.flash("success","Listing edited successfully");

  }

module.exports.updateListing = async(req,res)=>{
          let { id } = req.params;
          let listing = await Listing.findByIdAndUpdate(id.trim(), { ...req.body.listing })
          if(typeof req.file){
            let url =  req.file.path;
            let filename = req.file.filename;
            listing.image ={url,filename};
             await listing.save();
          }
          

           req.flash("success","Listing updated successfully");
           res.redirect(`/listings/${id}`);
    }
    module.exports.destroyListing =    async (req,res)=>{
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id.trim());
        console.log(deletedListing);
        req.flash("success","Listing deleted");
        res.redirect("/listings");
     }
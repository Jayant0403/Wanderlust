if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");


const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
const session = require("express-session");
const MongoStore =  require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

// const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL
const { listingSchema,reviewSchema } = require("./schema.js");
 main().then(()=>{
    console.log("Connected to DB");
 }).catch((err)=>{
    console.log(err);
 })

async function main(){
    await mongoose.connect(dbUrl)
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

app.get("/",(req,res)=>{
    res.redirect('/listings');
})

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret: process.env.SECRET,
      },
    touchAfter: 24 * 3600,
    
})

    store.on("error",()=>{
        console.log("ERROR in MONGO SESSION STORE",err)
    })

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async(req,res,next)=>{
    res.locals.currentUser = req.user; // Make `req.user` available as `currentUser`
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//   let registeredUser =  await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India"
//     });
//    await sampleListing.save();
//    console.log("Sample was saved");
//    res.send("Successful Test")
// })

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

// app.use((err,req,res,next)=>{
//     let {statusCode = 500,message = "Something went wrong!"} = err;
//     res.render("error.ejs",{message});
//     // res.status(statusCode).send(message);
    
// })
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!", stack } = err;
    res.status(statusCode).render("error.ejs", { err: { message, trace: stack } });
});
// app.use((err, req, res, next) => {
//     const { statusCode = 500, message = "Internal Server Error" } = err;

//     // Log the error
//     console.error(err.stack || err);

//     // Send the error response
//     res.status(statusCode).json({
//         success: false,
//         error: {
//             message,
//         },
//     });
// });

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080")
});

const express = require("express");
require("dotenv").config();
const Place = require("../models/places");
const reviews = require("../models/review");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const isLoggedIn = require("../middlewares.js");
const saveRedirectUrl = require("../middlewares.js");
const placeController = require("../controllers/places.js");
const multer = require("multer");
const {storage}= require("../cloudConfig.js")
const upload = multer({storage})

const router = express.Router({ mergeParams: true });

// Middleware setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride("_method"));

// Basic route to verify server is running
router.get("/", placeController.index);

router
  .route("/new")
  .get(isLoggedIn, placeController.NewForm)
  .post(upload.single('image'),placeController.newPlace);
  
// Route to render form for adding a new place
router
  .route("/:id")
  .get(placeController.showPlace)
  .put(upload.single('image'),placeController.editPlace)
  .delete(isLoggedIn, placeController.deletePlace);

// Route to render form for updating a specific place
router.get("/:id/edit", isLoggedIn, placeController.editForm);

router.post("/:id/reviews", isLoggedIn, placeController.review);


module.exports = router;

const Place = require("../models/places");
const reviews = require("../models/review");
const { cloudinary } = require("../cloudConfig");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  try {
    const allPlaces = await Place.find({});
    res.render("places/home", { allPlaces });
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
};

module.exports.NewForm = (req, res) => {
  res.render("places/newPlace");
};

module.exports.newPlace = async (req, res) => {
  try {
    const { title, description, price, location, country } = req.body;
    const { path, filename } = req.file; // Assuming you're using multer for file upload

    const response = await geocodingClient.forwardGeocode({
      query: location,
      limit: 1,
    }).send();

    if (!response.body.features || response.body.features.length === 0) {
      throw new Error('No coordinates found for location');
    }

    const coordinates = response.body.features[0].geometry.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error('Invalid coordinates format');
    }

    const newPlace = new Place({
      title,
      description,
      image: { url: path, filename },
      price,
      location,
      country,
      owner: req.user._id,
      geometry: {
        type: 'Point',
        coordinates: [coordinates[0], coordinates[1]], // Ensure correct order
      },
    });

    const savedPlace = await newPlace.save();

    req.flash('success', 'New Place Inserted!!');
    res.redirect(`/`);
  } catch (err) {
    console.error('Error saving place:', err);
    req.flash('error', 'Failed to save place');
    res.status(500).redirect('/');
  }
};


module.exports.showPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate("reviews")
      .populate("owner");
    // console.log(place.owner)
    if (!place) {
      return res.status(404).send("Place not found");
    }

    // Assuming you are using a templating engine like EJS or Pug
    res.render("places/detail", { place });
  } catch (err) {
    console.error(`Error fetching place: ${err.message}`);
    res.status(500).send(`Error: ${err.message}`); // Send an error response on error
  }
};

module.exports.editForm = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).send("Place not found");
    }
    res.render("places/update", { place });
  } catch (err) {
    console.error("Error fetching place:", err);
    res.status(500).send(`Error fetching place: ${err}`);
  }
};


module.exports.editPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body.Place;

    // Check if updatedFields is empty or undefined
    if (!updatedFields || Object.keys(updatedFields).length === 0) {
      throw new Error('No update fields provided.');
    }

    // Find the place by id and update it
    const place = await Place.findByIdAndUpdate(id, updatedFields, { new: true });

    // Handle file upload if there is a new file
    if (req.file) {
      const { path, filename } = req.file;
      place.image = { url: path, filename };
      await place.save();
    }

    // Check if place is null (no document found)
    if (!place) {
      throw new Error('Place not found.');
    }

    // Redirect to the updated place's details page
    res.redirect(`/${place._id}`);
  } catch (err) {
    console.error(`Error updating place: ${err}`);
    res.status(500).send(`Error updating place: ${err.message}`);
  }
};

module.exports.review = async (req, res) => {
  const { rating, comment } = req.body.review;
  const placeId = req.params.id;

  try {
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).send("Place not found");
    }

    const review = new reviews({ rating, comment });
    await review.save();

    place.reviews.push(review);
    await place.save();

    res.redirect(`/${placeId}`);
  } catch (err) {
    res.status(500).send(`Error adding review: ${err}`);
  }
};

module.exports.deletePlace = async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndDelete(req.params.id);

    if (!deletedPlace) {
      return res.status(404).send("Place not found");
    }
    res.redirect("/");
  } catch (err) {
    res.status(500).redirect("/places");
  }
};

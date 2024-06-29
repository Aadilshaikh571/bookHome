const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const placeRoutes = require("./routes/places");
const userRoute = require("./routes/user");
const EventEmitter = require("events");
const Place = require("./models/places");
const dotenv = require("dotenv");
dotenv.config();

// Increase Max Listeners
EventEmitter.defaultMaxListeners = 20;

const app = express();
const dburl = process.env.ATLUSDB_URL;
// Connect to MongoDB
main()
  .then(() => {
    console.log("connection success with the db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

// Setup EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err); // Log the error details

  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err); // Pass the error to the next middleware
  }

  // Set status and send error response
  res.status(500).send("Something went wrong!");
});

// Session middleware
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("error in mongo store", err);
});
app.use(
  session({
    store: store,
    name: "sessionId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Change to true in production if using HTTPS
      httpOnly: true,
      maxAge: 60000, // 1 minute
      sameSite: "strict",
    },
  })
);

// Flash messages middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up flash messages and user globally
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Ignore favicon requests
app.get("/favicon.ico", (req, res) => res.status(204));

// Routes
app.use("/", userRoute);
app.use("/", placeRoutes);

// Error handling middleware for duplicate headers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err); // Log the error details
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

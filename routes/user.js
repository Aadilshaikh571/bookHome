const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const userController = require("../controllers/user")


router.route("/signup").get(userController.signupPage).post(userController.signup);


// GET route for rendering login form
router.get('/login', userController.loginPage);

// POST route for user login
router.post('/login',passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true // Enable flash messages for failures
}), userController.login);

// POST route for user logout
router.get("/logout",userController.logout);

module.exports = router;

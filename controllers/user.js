    const User = require("../models/user");
    const passport = require("passport");


    module.exports.signupPage = (req, res) => {
        // Retrieve flash messages from session
        const messages = {
          success: req.flash("success"),
          error: req.flash("error")
        };
      
        // Render signup form with flash messages passed to the view
        res.render('user/signup', { messages });
      } 
      module.exports.signup =  async (req, res, next) => {
        try {
          let { username, email, password } = req.body;
      
          // Check if a user with the same username already exists
          const existingUser = await User.findOne({ username });
          if (existingUser) {
            req.flash("error", "Username already exists. Please choose another.");
            return res.redirect("/signup");
          }
      
          // Check if a user with the same email already exists
          const existingEmail = await User.findOne({ email });
          if (existingEmail) {
            req.flash("error", "Email already exists. Please use a different email.");
            return res.redirect("/signup");
          }
      
          // Create a new user instance
          const newUser = new User({ username, email });
      
          // Register the new user with the provided password
          const registeredUser = await User.register(newUser, password);
      
          req.logIn(registeredUser, (err) => {
            if (err) {
              return next(err);
            }
            req.flash("success", "User successfully registered!");
            res.redirect("/");
          });
      
        } catch (err) {
          // Handle other errors that occur during registration
          console.error("Error registering user:", err.message);
          req.flash("error", "Error registering user. Please try again later.");
          res.redirect("/signup");
        }
      }  
    module.exports.loginPage = (req, res) => {
        res.render('user/login', { successMessage: req.flash('success'), errorMessage: req.flash('error') });
      }
    module.exports.login =  (req, res) => {
        res.redirect("/");
      }  
    

    module.exports.logout =  (req, res, next) => {
        req.logOut((err) => {
          if (err) {
            return next(err);
          }
          req.flash("success", "You are logged out");
          res.redirect("/");
        });
      }    
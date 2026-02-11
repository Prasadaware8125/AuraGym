// Public routes for signup, login, and logout
const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/users");

// ================== SIGNUP ==================
// Show signup page
router.get("/signup", userController.renderSignupForm);
// Handle signup form submit
router.post("/signup", userController.signup);

// ================== LOGIN ==================
// Show login page
router.get("/login", userController.renderLoginForm);

// Login handler for both member and admin based on selected role (role comes from hidden input)
router.post("/login", (req, res, next) => {
  const { role } = req.body;

  // Decide which strategy to use
  const strategy =
    role === "admin"
      ? "admin-local"
      : "member-local";

  // Let Passport perform authentication with the chosen strategy
  passport.authenticate(strategy, (err, user, info) => {
    if (err) return next(err);
    // If authentication fails, redirect back to login with error flash
    if (!user) {
      req.flash("error", info && info.message ? info.message : "Invalid credentials");
      return res.redirect("/login");
    }

    // Manually establish a login session
    req.logIn(user, (err) => {
      if (err) return next(err);

      // Success flash for login
      req.flash("success", `Welcome back, ${user.username}!`);

      // Redirect based on role / strategy
      if (strategy === "admin-local") {
        return res.redirect("/admin");
      }
      return res.redirect("/member");
    });
  })(req, res, next);
});

// ================== LOGOUT ==================
// Logout current user
router.get("/logout", userController.logout);

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/users");

router.get("/signup", userController.renderSignupForm);
router.post("/signup", userController.signup);

router.get("/login", userController.renderLoginForm);
router.post("/login",
    passport.authenticate("local",
        {failureRedirect: "/login", failureFlash: true}
    ),
    userController.login);

module.exports = router;
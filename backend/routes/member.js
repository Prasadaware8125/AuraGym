const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");

router.get("/signup", memberController.renderSignupForm);
router.post("/login", memberController.signup);

router.get("/login", memberController.renderLoginForm);
router.post("/login", memberController.login);

module.exports = router;
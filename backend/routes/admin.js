const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/login", adminController.renderLoginForm);
router.post("/login", adminController.login);

module.exports = router;
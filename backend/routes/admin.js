// Admin routes: trainer dashboard listing all members
const express = require("express");
const router = express.Router();
const Member = require("../models/member.js");

// Admin dashboard - trainer view with all members
router.get("/", async (req, res) => {
    const members = await Member.find({});
    res.render("admin.ejs", { members });
});

module.exports = router;
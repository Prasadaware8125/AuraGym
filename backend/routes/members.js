// Member routes: dashboard + APIs for workouts and meals
const express = require("express");
const router = express.Router();
const Member = require("../models/member.js");

// Member dashboard (EJS pulls data from res.locals.currentUser)
router.get("/", (req, res) => {
    res.render("member.ejs");
});

// Add workout for logged-in member
router.post("/workouts", async (req, res) => {
    try {
        const { title, type, duration, calories } = req.body;
        const member = await Member.findById(req.user._id);
        member.workouts.unshift({
            title,
            type,
            duration: Number(duration),
            calories: Number(calories),
            date: new Date(),
        });
        await member.save();
        res.json({ workouts: member.workouts });
    } catch (err) {
        res.status(500).json({ error: "Failed to save workout" });
    }
});

// Delete workout by subdocument id
router.delete("/workouts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Member.findById(req.user._id);
        member.workouts.id(id)?.remove();
        await member.save();
        res.json({ workouts: member.workouts });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete workout" });
    }
});

// Add meal (nutrition log) for logged-in member
router.post("/meals", async (req, res) => {
    try {
        const { name, calories } = req.body;
        const member = await Member.findById(req.user._id);
        member.meals.unshift({
            name,
            calories: Number(calories),
            date: new Date(),
        });
        await member.save();
        res.json({ meals: member.meals });
    } catch (err) {
        res.status(500).json({ error: "Failed to save meal" });
    }
});

// Delete meal by subdocument id
router.delete("/meals/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Member.findById(req.user._id);
        member.meals.id(id)?.remove();
        await member.save();
        res.json({ meals: member.meals });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete meal" });
    }
});

module.exports = router;
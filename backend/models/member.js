// Member model: base user plus embedded workouts & meals
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

// Single workout session embedded under a Member
const workoutSchema = new Schema({
    title: String,
    type: String,
    duration: Number, // minutes
    calories: Number,
    date: {
        type: Date,
        default: Date.now,
    },
});

// Single meal (nutrition log) embedded under a Member
const mealSchema = new Schema({
    name: String,
    calories: Number,
    date: {
        type: Date,
        default: Date.now,
    },
});

// Main Member document
const memberSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
        },
        gender: {
            type: String,
        },
        goal: {
            type: String,
        },
        workouts: [workoutSchema],
        meals: [mealSchema],
    },
    { timestamps: true }
);

memberSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
});

module.exports = mongoose.model("Member", memberSchema);
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const app = express();

const memberRouter = require("./routes/member.js");


// ================== DATABASE ==================
mongoose
.connect("mongodb://127.0.0.1:27017/aura-gym")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// ================== VIEW ENGINE ==================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));

// ================== MIDDLEWARE ==================
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

app.get("/", (req, res) => {
    res.render("landing");
});

app.use("/", memberRouter);


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listning to port ${port}`);
});
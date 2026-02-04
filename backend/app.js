
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/aura-gym")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");

const authRoutes = require("./routes/auth.routes");

const app = express();

// view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

// routes
app.use("/", authRoutes);

app.get("/", (req, res) => res.render("landing"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});

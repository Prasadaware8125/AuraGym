// ================== IMPORTS ==================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const { verifyToken } = require("./middleware/auth");

// ================== APP INIT ==================
const app = express();

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

// ================== AUTH ROUTES ==================
app.use("/", authRoutes);

// ================== PUBLIC ROUTES ==================
app.get("/", (req, res) => res.render("landing"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

// ================== PROTECTED ROUTES ==================
app.get("/admin/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Admins only");
  }
  res.render("admin");
});

app.get("/member/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "member") {
    return res.status(403).send("Members only");
  }
  res.render("member");
});

// ================== LOGOUT ==================
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// ================== SERVER ==================
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

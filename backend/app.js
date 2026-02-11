// Load environment variables from .env (DB_URL, SECRET, PORT, etc.)
require("dotenv").config();

// Core Express / Node dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const app = express();

// Routers for public auth, member, and admin areas
const userRouter = require("./routes/users.js");
const memberRouter = require("./routes/members.js");
const adminRouter = require("./routes/admin.js");

// Session & authentication helpers
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Mongoose models and role-based middlewares
const Member = require("./models/member.js");
const Admin = require("./models/admin.js");
const { isMember, isAdmin } = require("./middleware.js");

// ================== DATABASE ==================
let MONGO_URL = process.env.DB_URL;
mongoose
.connect(MONGO_URL)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// ================== VIEW ENGINE ==================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));

// ================== MIDDLEWARE ==================
// Parse HTML form data
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (for fetch / AJAX)
app.use(express.json());
// Parse cookies (required for sessions)
app.use(cookieParser());
// Serve static frontend assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Error",err);
});

// Session configuration (stored in MongoDB)
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, // ✅ correct spelling
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


// Public landing page (no authentication required)
app.get("/", (req, res) => {
    res.render("landing");
});

// Register session + flash middleware
app.use(session(sessionOptions));
app.use(flash());

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Strategy for Member logins (email as username)
passport.use(
  "member-local",
  new LocalStrategy({ usernameField: "email" }, Member.authenticate())
);

// Strategy for Admin logins (email as username)
passport.use(
  "admin-local",
  new LocalStrategy({ usernameField: "email" }, Admin.authenticate())
);

// Store only minimal user info in the session
passport.serializeUser((user, done) => {
  done(null, {
    id: user._id,
    role: user instanceof Admin ? "admin" : "member",
  });
});

// Turn session data back into a full Mongoose user document
passport.deserializeUser(async (data, done) => {
  try {
    if (data.role === "member") {
      const user = await Member.findById(data.id);
      return done(null, user);
    }
    if (data.role === "admin") {
      const user = await Admin.findById(data.id);
      return done(null, user);
    }
  } catch (err) {
    done(err);
  }
});

// Make currentUser + flash messages available in every EJS template
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Mount routers:
// - public auth routes (signup/login/logout)
app.use("/", userRouter);
// - member dashboard + APIs (protected by isMember)
app.use("/member", isMember, memberRouter);
// - admin dashboard (protected by isAdmin)
app.use("/admin", isAdmin, adminRouter);

// Start the HTTP server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listning to port ${port}`);
});
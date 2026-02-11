// Reusable authentication / authorization middlewares
const Member = require("./models/member.js");
const Admin = require("./models/admin.js");

// Generic "any logged in user" check
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.flash("error", "You must be logged in to access that page.");
    return res.redirect("/login");
  }
  next();
};

// Member-only routes (must be logged in AND instance of Member)
module.exports.isMember = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !(req.user instanceof Member)) {
    req.flash("error", "You must be logged in as a member to access that page.");
    return res.redirect("/login");
  }
  next();
};

// Admin-only routes (must be logged in AND instance of Admin)
module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !(req.user instanceof Admin)) {
    req.flash("error", "You must be logged in as an admin to access that page.");
    return res.redirect("/login");
  }
  next();
};



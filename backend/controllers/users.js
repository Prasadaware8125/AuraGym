// User-related controller actions: signup, login form, logout
const Member = require("../models/member.js");
const Admin = require("../models/admin.js");

// Render the signup page
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

// Handle signup for both members and admins based on selected role
module.exports.signup = async (req, res, next) => {
    if (req.body.role === "member") {
        try {
            const { username, email, password, age, gender, goal } = req.body;

            // Create a new Member document from form data
            const newUser = new Member({
                username,
                email,
                age,
                gender,
                goal,
            });

            // Register member using passport-local-mongoose (hash + save password)
            const registeredUser = await Member.register(newUser, password);

            // Auto-login after signup and redirect to member dashboard
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome to AURA GYM!");
                return res.redirect("/member");
            });

        } catch (e) {
            // If something goes wrong (e.g. duplicate email), show error and stay on signup
            req.flash("error", e.message);
            return res.redirect("/signup");
        }

    } else if (req.body.role === "admin") {
        try {
            const { username, email, password, accesscode } = req.body;

            // Create a new Admin document from form data
            const newAdmin = new Admin({
                username,
                email,
                accesscode,
            });

            // Register admin using passport-local-mongoose
            const registeredAdmin = await Admin.register(newAdmin, password);

            // Auto-login after signup and redirect to admin dashboard
            req.login(registeredAdmin, (err) => {
                if (err) return next(err);
                req.flash("success", "Admin account created successfully.");
                return res.redirect("/admin");
            });

        } catch (e) {
            // If something goes wrong (e.g. duplicate email), show error and stay on signup
            req.flash("error", e.message);
            return res.redirect("/signup");
        }
    }
};

// Show the login page
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

// Logout current user and destroy session
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have been logged out successfully.");
        res.redirect("/login");
    });
};

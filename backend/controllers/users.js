const Member = require("../models/member.js");
const Admin = require("../models/admin.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res) => {
    if( req.body.role === "member" ) {
        try {
            let { username, email, password, age, gender, goal } = req.body;
            const newUser = new Member({email, username, age, gender, goal});
            const registerUser = await Member.register(newUser, password);
            res.redirect("/member");
        } catch(e) {
            res.redirect("/signup");
        }
        res.send(req.body);
    } else if( req.body.role === "admin" ) {
        try {
            let { username, email, password, accesscode} = req.body;
            const newUser = new Admin({email, username, accesscode});
            const registerUser = await Admin.register(newUser, password);
            res.render("admin.ejs", {registerUser});
        } catch(e) {
            res.redirect("/signup");
        }
        // res.send(req.body);
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = async (req, res) => {
    if(req.body.role == "member") {
        res.redirect("/member");
    } else if ( req.body.role == "admin") {
        res.redirect("/admin");
    }
};
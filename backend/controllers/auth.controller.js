const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================
// SIGNUP CONTROLLER
// ============================
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password, role, adminCode } = req.body;

    if (role === "admin" && adminCode !== "AURA2024") {
      return res.send("Invalid Admin Code");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      password: hashedPassword,
      role
    });

    if (role === "admin") return res.render("admin");
    return res.render("member");

  } catch (err) {
    console.error(err);
    res.status(500).send("Signup failed");
  }
};

// ============================
// LOGIN CONTROLLER
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Invalid password");

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000
    });

    if (user.role === "admin") return res.render("admin");
    return res.render("member");

  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
};

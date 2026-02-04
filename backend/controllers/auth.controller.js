const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ================= SIGNUP ================= */
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password, role, adminCode } = req.body;

    // if (role === "admin" ) {   // && adminCode !== "AURA2024"
    //   return res.send("Invalid Admin Code");
    // }

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

    // ✅ AFTER SIGNUP → LOGIN PAGE
    res.redirect("/login");

  } catch (err) {
    console.error(err);
    res.status(500).send("Signup failed");
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("LOGIN EMAIL:", email);

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Invalid password");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
res.cookie("token", token, {
  httpOnly: true,
  secure: false,        // keep false for localhost
  sameSite: "lax",      // 🔥 REQUIRED
  maxAge: 60 * 60 * 1000
});


    // ✅ REDIRECT BASED ON ROLE
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    res.redirect("/member/dashboard");

  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
};

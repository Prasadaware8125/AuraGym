const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ============================
// SIGNUP CONTROLLER
// ============================
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password, role, adminCode } = req.body;

    // 1️⃣ Admin code validation
    if (role === "admin" && adminCode !== "AURA2024") {
      return res.send("Invalid Admin Code");
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists");
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Save user to MongoDB
    await User.create({
      fullname,
      email,
      password: hashedPassword,
      role
    });

    // 5️⃣ Redirect based on role
    if (role === "admin") {
      return res.render("admin");
    }

    return res.render("member");

  } catch (error) {
    console.error(error);
    res.status(500).send("Signup failed");
  }
};

// ============================
// LOGIN CONTROLLER
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.send("User not found");
    }

    // 2️⃣ Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.send("Invalid password");
    }

    // 3️⃣ Redirect based on role stored in DB
    if (user.role === "admin") {
      return res.render("admin");
    }

    return res.render("member");

  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
};

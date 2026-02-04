const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Attach user data to request
    req.user = decoded;

    next(); // continue to protected route

  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};

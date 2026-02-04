const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  }
});

module.exports = mongoose.model("User", userSchema);

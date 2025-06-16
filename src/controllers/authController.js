const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { generateToken } = require("../utils/jwt");
const { User } = require("../models");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { Op } = require("sequelize");

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "parent",
      phone,
    });

    const token = generateToken(newUser.id, newUser.role);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        userId: newUser.id,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { email, username, password, role } = req.body;

  try {
    let user;

    if (role === "child") {
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username is required for child login",
        });
      }

      user = await User.findOne({ where: { username, role: "child" } });
    } else if (role === "parent" || role == "admin") {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required for parent login",
        });
      }

      user = await User.findOne({ where: { email, role: role } });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: child, parent",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        userId: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await User.update(
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
      { where: { id: user.id } }
    );

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    const message = `
      You requested a password reset. Please click on the following link to reset your password:
      ${resetUrl}
      
      If you didn't request this, please ignore this email.
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.update(
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { where: { id: user.id } }
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

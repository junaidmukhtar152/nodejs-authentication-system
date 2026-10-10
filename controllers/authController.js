const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const generateToken = require("../utils/generateToken");
const generateRefreshToken = require("../utils/generateRefreshToken");
const generateVerificationToken = require("../utils/generateVerificationToken");
const generateResetToken = require("../utils/generateResetToken");

// 1. REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { verificationToken, hashedVerificationToken } =
      generateVerificationToken();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      // Development only; remove before production.
      developmentVerificationToken: verificationToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 2. VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.body;

    if (!verificationToken) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 3. RESEND VERIFICATION TOKEN
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        message: "If verification is needed, a new token has been generated.",
      });
    }

    const { verificationToken, hashedVerificationToken } =
      generateVerificationToken();

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    return res.status(200).json({
      message: "If verification is needed, a new token has been generated.",
      // Development only; remove before production.
      developmentVerificationToken: verificationToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 4. LOGIN USER WITH ACCESS AND REFRESH TOKENS
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    // Generate the short-lived access token.
    const accessToken = generateToken(user._id, user.role);

    // Generate the refresh token and its hash.
    const { refreshToken, hashedRefreshToken } = generateRefreshToken();

    // Store only the hashed refresh token.
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 5. GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    // protect middleware already loads the current user.
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 6. GET ALL USERS (ADMIN)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 7. CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Revoke existing refresh tokens after a password change.
    await RefreshToken.updateMany(
      { user: user._id, revoked: false },
      { $set: { revoked: true } },
    );

    return res.status(200).json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 8. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Do not reveal whether an account exists.
    if (!user) {
      return res.status(200).json({
        message: "If the account exists, reset instructions will be provided.",
      });
    }

    const { resetToken, hashedResetToken } = generateResetToken();

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    return res.status(200).json({
      message: "If the account exists, reset instructions will be provided.",
      // Development only; remove before production.
      developmentResetToken: resetToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 9. RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Revoke existing refresh tokens after a password reset.
    await RefreshToken.updateMany(
      { user: user._id, revoked: false },
      { $set: { revoked: true } },
    );

    return res.status(200).json({
      message: "Password reset successfully. Please log in.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    // Hash the token received from the client.
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Find an active, unexpired token.
    const storedToken = await RefreshToken.findOne({
      tokenHash: hashedToken,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid, expired, or revoked refresh token",
      });
    }

    // Load the current user and role.
    const user = await User.findById(storedToken.user);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email",
      });
    }

    // Rotate the refresh token: invalidate the old one.
    storedToken.revoked = true;
    await storedToken.save();

    // Issue a new access token.
    const accessToken = generateToken(user._id, user.role);

    // Issue and store a new refresh token.
    const { refreshToken: newRefreshToken, hashedRefreshToken } =
      generateRefreshToken();

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};


const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const token = await RefreshToken.findOneAndUpdate(
      { tokenHash: hashedToken, revoked: false },
      { $set: { revoked: true } }
    );

    if (!token) {
      return res.status(400).json({
        message: "Invalid or already revoked refresh token",
      });
    }

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// EXPORT ALL CONTROLLERS
module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  getProfile,
  getAllUsers,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser
};

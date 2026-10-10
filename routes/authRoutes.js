const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshAccessToken,
  resendVerificationEmail,
  logoutUser
} = require("../controllers/authController");

const {
  validateRegister,
  validateLogin,
} = require("../middleware/authValidation");

const router = express.Router();

router.post("/register", validateRegister, registerUser);

router.post("/login", validateLogin, loginUser);

router.get("/profile", protect, getProfile);

router.get("/users", protect, adminOnly, getAllUsers);

router.patch("/change-password", protect, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logoutUser);

module.exports = router;

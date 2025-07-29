import express from "express"
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  logout,
  refreshToken,
} from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService")
const passport = require("passport")
require("../config/passport-setup") // Ensure passport strategies are loaded

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", register)

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email
// @access  Public
router.get("/verify-email/:verificationToken", verifyEmail)

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", login)

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post("/refresh-token", refreshToken)

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, getMe)

// @route   POST /api/auth/forgot-password
// @desc    Request password reset link
// @access  Public
router.post("/forgot-password", forgotPassword)

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post("/reset-password/:resetToken", resetPassword)

// @route   POST /api/auth/change-password
// @desc    Change password for logged-in user
// @access  Private
router.post("/change-password", protect, updatePassword)

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private (but handles client-side action)
router.post("/logout", logout)

// OAuth Routes
// Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CORS_ORIGIN}/login` }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or send tokens
    const token = req.user.getSignedJwtToken()
    const refreshToken = req.user.getSignedJwtRefreshToken()
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard?token=${token}&refreshToken=${refreshToken}`)
  },
)

// GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }))

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: `${process.env.CORS_ORIGIN}/login` }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or send tokens
    const token = req.user.getSignedJwtToken()
    const refreshToken = req.user.getSignedJwtRefreshToken()
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard?token=${token}&refreshToken=${refreshToken}`)
  },
)

export default router

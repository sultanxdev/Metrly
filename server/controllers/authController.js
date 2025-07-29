import User from "../models/User.js"
import sendEmail from "../services/emailService.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"

// Helper function to generate tokens
const generateTokens = (user) => {
  const token = user.getSignedJwtToken()
  const refreshToken = user.getSignedRefreshToken()
  return { token, refreshToken }
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body

  try {
    const user = await User.create({
      name,
      email,
      password,
    })

    const verificationToken = user.getVerificationToken()
    await user.save({ validateBeforeSave: false })

    const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email/${verificationToken}`

    const message = `You are receiving this email because you (or someone else) have registered an account with InterviewMate. Please make a GET request to: \n\n ${verificationUrl}`

    try {
      await sendEmail({
        email: user.email,
        subject: "InterviewMate Email Verification",
        message,
      })

      res.status(200).json({
        success: true,
        message: `User registered. An email has been sent to ${user.email} for verification.`,
      })
    } catch (err) {
      console.error(err)
      user.verificationToken = undefined
      user.verificationTokenExpire = undefined
      await user.save({ validateBeforeSave: false })
      return next(new Error("Email could not be sent", 500))
    }
  } catch (err) {
    if (err.code === 11000) {
      return next(new Error("Email already registered", 400))
    }
    next(err)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new Error("Please provide an email and password", 400))
  }

  try {
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return next(new Error("Invalid credentials", 401))
    }

    if (!user.isEmailVerified) {
      return next(new Error("Please verify your email address to log in", 401))
    }

    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return next(new Error("Invalid credentials", 401))
    }

    const { token, refreshToken } = generateTokens(user)

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        remainingMinutes: user.remainingMinutes,
        avatar: user.avatar,
      },
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        remainingMinutes: user.remainingMinutes,
        avatar: user.avatar,
      },
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return next(new Error("There is no user with that email", 404))
    }

    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      })

      res.status(200).json({ success: true, message: "Email sent" })
    } catch (err) {
      console.error(err)
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      return next(new Error("Email could not be sent", 500))
    }
  } catch (err) {
    next(err)
  }
}

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex")

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return next(new Error("Invalid token or token has expired", 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    const { token, refreshToken } = generateTokens(user)

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Update user password (when logged in)
// @route   POST /api/auth/change-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password")

    if (!user) {
      return next(new Error("User not found", 404))
    }

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword)
    if (!isMatch) {
      return next(new Error("Current password is incorrect", 401))
    }

    // Update password
    user.password = req.body.newPassword
    await user.save()

    res.status(200).json({ success: true, message: "Password updated successfully" })
  } catch (err) {
    next(err)
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify-email/:verificationToken
// @access  Public
export const verifyEmail = async (req, res, next) => {
  const verificationToken = crypto.createHash("sha256").update(req.params.verificationToken).digest("hex")

  try {
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    })

    if (!user) {
      return next(new Error("Invalid token or token has expired", 400))
    }

    user.isEmailVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpire = undefined
    await user.save({ validateBeforeSave: false })

    res.status(200).json({ success: true, message: "Email verified successfully" })
  } catch (err) {
    next(err)
  }
}

// @desc    Log user out / clear cookies
// @route   POST /api/auth/logout
// @access  Private (or Public if just clearing client-side tokens)
export const logout = async (req, res, next) => {
  // In a stateless JWT setup, logout primarily involves the client
  // deleting their tokens. If using refresh tokens stored in DB,
  // you might invalidate them here.
  try {
    // If you store refresh tokens in DB, find and delete it
    // const user = await User.findById(req.user.id);
    // if (user) {
    //   user.refreshToken = undefined; // Or remove from an array of refresh tokens
    //   await user.save({ validateBeforeSave: false });
    // }

    res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (err) {
    next(err)
  }
}

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public (requires refresh token)
export const refreshToken = async (req, res, next) => {
  const { token: refreshToken } = req.body

  if (!refreshToken) {
    return next(new Error("No refresh token provided", 401))
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    const user = await User.findById(decoded.id)

    if (!user) {
      return next(new Error("No user found with this refresh token", 401))
    }

    // Optionally, check if the refresh token matches one stored in DB if you manage multiple
    // if (user.refreshToken !== refreshToken) {
    //   return next(new Error('Invalid refresh token', 401));
    // }

    const newAccessToken = user.getSignedJwtToken()

    res.status(200).json({ success: true, token: newAccessToken })
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Refresh token expired, please log in again", 401))
    }
    return next(new Error("Not authorized to access this route", 401))
  }
}

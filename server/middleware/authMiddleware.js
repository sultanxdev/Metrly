import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Protect routes
export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1]
  }
  // else if (req.cookies.token) {
  //   // Set token from cookie (if using httpOnly cookies)
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new Error("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return next(new Error("No user found with this ID", 404))
    }

    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Token expired, please log in again", 401))
    }
    return next(new Error("Not authorized to access this route", 401))
  }
}

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error(`User role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}

import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import "./config/passport-setup.js" // Import passport setup

// Load env vars
dotenv.config({ path: "./.env" })

// Connect to database
connectDB()

const app = express()

// CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Allow your frontend origin
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}
app.use(cors(corsOptions))

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Passport middleware
app.use(passport.initialize())

// Route files
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import interviewRoutes from "./routes/interviews.js"
import reportRoutes from "./routes/reports.js"
import paymentRoutes from "./routes/payments.js"
import vapiRoutes from "./routes/vapi.js"
import adminRoutes from "./routes/admin.js"

// Mount routers
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/interviews", interviewRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/vapi", vapiRoutes)
app.use("/api/admin", adminRoutes)

// OAuth Callbacks
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CORS_ORIGIN}/login` }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard?token=${req.user.token}&refreshToken=${req.user.refreshToken}`)
  },
)

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }))
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: `${process.env.CORS_ORIGIN}/login` }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard?token=${req.user.token}&refreshToken=${req.user.refreshToken}`)
  },
)

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})

import express from "express"
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getDashboardStats,
  getUserAnalytics,
} from "../controllers/userController.js"
import { protect } from "../middleware/authMiddleware.js"
import { upload } from "../config/multerConfig.js"

const router = express.Router()

router.use(protect) // All routes below this will be protected

router.get("/profile", getUserProfile)
router.put("/profile", upload.single("avatar"), updateUserProfile)
router.delete("/profile", deleteUserProfile)
router.get("/dashboard-stats", getDashboardStats)
router.get("/analytics", getUserAnalytics)

const User = require("../models/User")
const Interview = require("../models/Interview")
const Report = require("../models/Report")
const Payment = require("../models/Payment") // Declaring the Payment variable

// @route   GET /api/users/dashboard-summary
// @desc    Get summary data for user dashboard
// @access  Private
router.get("/dashboard-summary", async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch user details (already available from authMiddleware, but good for refresh)
    const user = await User.findById(userId).select("name email remainingMinutes isPro avatar")
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    // Fetch recent interviews
    const recentInterviews = await Interview.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .select("role interviewType date score reportId") // Assuming score and reportId are stored on Interview model

    // Fetch overall performance summary from reports
    const overallReports = await Report.find({ user: userId })
    const totalInterviews = overallReports.length
    let totalScore = 0
    let highestScore = 0

    overallReports.forEach((report) => {
      if (report.overallScore) {
        totalScore += report.overallScore
        if (report.overallScore > highestScore) {
          highestScore = report.overallScore
        }
      }
    })

    const averageScore = totalInterviews > 0 ? totalScore / totalInterviews : null

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        remainingMinutes: user.remainingMinutes,
        isPro: user.isPro,
        avatar: user.avatar,
      },
      recentInterviews,
      overallPerformance: {
        totalInterviews,
        averageScore,
        highestScore,
      },
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error fetching dashboard summary." })
  }
})

// @route   DELETE /api/users/delete-account
// @desc    Delete user account
// @access  Private
router.delete("/delete-account", async (req, res) => {
  try {
    const userId = req.user.id

    // Optionally, delete associated data like interviews and reports
    await Interview.deleteMany({ user: userId })
    await Report.deleteMany({ user: userId })
    await Payment.deleteMany({ user: userId }) // Assuming Payment model exists

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    res.status(200).json({ message: "Account deleted successfully." })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error deleting account." })
  }
})

export default router

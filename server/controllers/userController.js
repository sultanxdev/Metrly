import User from "../models/User.js"
import Interview from "../models/Interview.js"
import Report from "../models/Report.js"
import Payment from "../models/Payment.js"
import { cloudinary } from "../config/cloudinaryConfig.js"

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password") // Exclude password
    if (!user) {
      return next(new Error("User not found", 404))
    }
    res.status(200).json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return next(new Error("User not found", 404))
    }

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists on Cloudinary
      if (user.avatar && user.avatar.includes("cloudinary")) {
        const publicId = user.avatar.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(publicId)
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
        width: 150,
        height: 150,
        crop: "fill",
      })
      user.avatar = result.secure_url
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return next(new Error("User not found", 404))
    }

    // Delete user's avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.includes("cloudinary")) {
      const publicId = user.avatar.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(publicId)
    }

    // Optionally delete all associated interviews, reports, payments etc.
    await Interview.deleteMany({ user: req.user.id })
    await Report.deleteMany({ user: req.user.id })
    await Payment.deleteMany({ user: req.user.id })

    await user.deleteOne()

    res.status(200).json({ success: true, message: "Account deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// @desc    Get dashboard statistics for a user
// @route   GET /api/users/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id

    const totalInterviews = await Interview.countDocuments({ user: userId, status: "completed" })
    const reports = await Report.find({ user: userId })

    let totalScore = 0
    reports.forEach((report) => {
      totalScore += report.overallScore
    })
    const averageScore = reports.length > 0 ? totalScore / reports.length : 0

    const totalMinutesUsed = await Interview.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ])
    const minutesUsed = totalMinutesUsed.length > 0 ? totalMinutesUsed[0].total : 0

    const user = await User.findById(userId)
    const remainingMinutes = user ? user.remainingMinutes : 0

    res.status(200).json({
      success: true,
      totalInterviews,
      averageScore,
      minutesUsed,
      remainingMinutes,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get user analytics data
// @route   GET /api/users/analytics
// @access  Private
export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { timeframe } = req.query // e.g., '7days', '30days', 'alltime'

    let startDate = new Date()
    if (timeframe === "7days") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeframe === "30days") {
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate = new Date(0) // All time
    }

    const matchQuery = {
      user: userId,
      createdAt: { $gte: startDate },
      status: "completed",
    }

    const interviews = await Interview.find(matchQuery)
    const reports = await Report.find(matchQuery)

    // Total Interviews
    const totalInterviews = interviews.length

    // Average Score
    let totalScore = 0
    reports.forEach((report) => {
      totalScore += report.overallScore
    })
    const averageScore = reports.length > 0 ? totalScore / reports.length : 0

    // Total Minutes Used
    const totalMinutesUsedResult = await Interview.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ])
    const totalMinutesUsed = totalMinutesUsedResult.length > 0 ? totalMinutesUsedResult[0].total : 0

    // Remaining Minutes (from user model, not time-filtered)
    const user = await User.findById(userId)
    const remainingMinutes = user ? user.remainingMinutes : 0

    // Score Trend (daily average score)
    const scoreTrend = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          averageScore: { $avg: "$overallScore" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", averageScore: { $round: ["$averageScore", 1] }, _id: 0 } },
    ])

    // Minutes Used Trend (daily total minutes)
    const minutesUsedTrend = await Interview.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          minutes: { $sum: "$duration" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", minutes: 1, _id: 0 } },
    ])

    // Interview Type Distribution
    const interviewTypeDistribution = await Interview.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$interviewType", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ])
    const interviewTypeDist = interviewTypeDistribution.reduce((acc, item) => {
      acc[item.type] = item.count
      return acc
    }, {})

    // Difficulty Distribution
    const difficultyDistribution = await Interview.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $project: { difficulty: "$_id", count: 1, _id: 0 } },
    ])
    const difficultyDist = difficultyDistribution.reduce((acc, item) => {
      acc[item.difficulty] = item.count
      return acc
    }, {})

    res.status(200).json({
      success: true,
      totalInterviews,
      averageScore,
      totalMinutesUsed,
      remainingMinutes,
      scoreTrend,
      minutesUsedTrend,
      interviewTypeDistribution: interviewTypeDist,
      difficultyDistribution: difficultyDist,
    })
  } catch (err) {
    next(err)
  }
}

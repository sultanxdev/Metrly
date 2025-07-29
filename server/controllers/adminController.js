import User from "../models/User.js"
import Interview from "../models/Interview.js"
import Report from "../models/Report.js"
import Payment from "../models/Payment.js"
import InterviewTemplate from "../models/InterviewTemplate.js"
import cloudinary from "cloudinary"

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalInterviews = await Interview.countDocuments({ status: "completed" })
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0

    const averageInterviewDurationResult = await Interview.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
    ])
    const averageInterviewDuration =
      averageInterviewDurationResult.length > 0 ? averageInterviewDurationResult[0].avgDuration : 0

    // User Growth (e.g., last 30 days)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ])

    // Interview Type Distribution
    const interviewTypeDistribution = await Interview.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$interviewType", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ])
    const interviewTypeDist = interviewTypeDistribution.reduce((acc, item) => {
      acc[item.type] = item.count
      return acc
    }, {})

    // Payment Status Distribution
    const paymentStatusDistribution = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ])
    const paymentStatusDist = paymentStatusDistribution.reduce((acc, item) => {
      acc[item.status] = item.count
      return acc
    }, {})

    res.status(200).json({
      success: true,
      totalUsers,
      totalInterviews,
      totalRevenue,
      averageInterviewDuration,
      userGrowth,
      interviewTypeDistribution: interviewTypeDist,
      paymentStatusDistribution: paymentStatusDist,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password") // Exclude passwords
    res.status(200).json({ success: true, count: users.length, users })
  } catch (err) {
    next(err)
  }
}

// @desc    Update user by admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, role, minutes } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return next(new Error("User not found", 404))
    }

    user.name = name || user.name
    user.email = email || user.email
    user.role = role || user.role
    user.remainingMinutes = minutes !== undefined ? minutes : user.remainingMinutes

    await user.save()

    res.status(200).json({
      success: true,
      message: "User updated successfully",
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

// @desc    Delete user by admin
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return next(new Error("User not found", 404))
    }

    // Delete user's avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.includes("cloudinary")) {
      const publicId = user.avatar.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(publicId)
    }

    // Delete all associated interviews, reports, payments etc.
    await Interview.deleteMany({ user: req.params.id })
    await Report.deleteMany({ user: req.params.id })
    await Payment.deleteMany({ user: req.params.id })

    await user.deleteOne()

    res.status(200).json({ success: true, message: "User deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// @desc    Get all interview templates
// @route   GET /api/admin/templates
// @access  Private/Admin
export const getAllInterviewTemplates = async (req, res, next) => {
  try {
    const templates = await InterviewTemplate.find().sort({ name: 1 })
    res.status(200).json({ success: true, count: templates.length, templates })
  } catch (err) {
    next(err)
  }
}

// @desc    Create new interview template
// @route   POST /api/admin/templates
// @access  Private/Admin
export const createInterviewTemplate = async (req, res, next) => {
  const { name, type, jobRole, difficulty, topics, instructions } = req.body
  try {
    const template = await InterviewTemplate.create({
      name,
      type,
      jobRole,
      difficulty,
      topics,
      instructions,
    })
    res.status(201).json({ success: true, message: "Template created successfully", template })
  } catch (err) {
    next(err)
  }
}

// @desc    Update interview template
// @route   PUT /api/admin/templates/:id
// @access  Private/Admin
export const updateInterviewTemplate = async (req, res, next) => {
  const { name, type, jobRole, difficulty, topics, instructions } = req.body
  try {
    const template = await InterviewTemplate.findById(req.params.id)

    if (!template) {
      return next(new Error("Template not found", 404))
    }

    template.name = name || template.name
    template.type = type || template.type
    template.jobRole = jobRole || template.jobRole
    template.difficulty = difficulty || template.difficulty
    template.topics = topics || template.topics
    template.instructions = instructions || template.instructions

    await template.save()

    res.status(200).json({ success: true, message: "Template updated successfully", template })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete interview template
// @route   DELETE /api/admin/templates/:id
// @access  Private/Admin
export const deleteInterviewTemplate = async (req, res, next) => {
  try {
    const template = await InterviewTemplate.findById(req.params.id)

    if (!template) {
      return next(new Error("Template not found", 404))
    }

    await template.deleteOne()

    res.status(200).json({ success: true, message: "Template deleted successfully" })
  } catch (err) {
    next(err)
  }
}

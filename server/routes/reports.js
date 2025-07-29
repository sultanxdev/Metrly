import express from "express"
import { getReports, getReport, deleteReport, getSharedReport } from "../controllers/reportController.js"
import { protect } from "../middleware/authMiddleware.js"
import Report from "../models/Report"

const router = express.Router()

// Public route for shared reports
router.get("/shared/:id", getSharedReport)

router.use(protect) // All routes below this will be protected

// @route   GET /api/reports
// @desc    Get all reports for the authenticated user
// @access  Private
router.get("/", getReports)

// @route   GET /api/reports/:id
// @desc    Get a single report by ID
// @access  Private
router.get("/:id", getReport)

// @route   DELETE /api/reports/:id
// @desc    Delete a report by ID
// @access  Private
router.delete("/:id", deleteReport)

// @route   GET /api/reports/analytics
// @desc    Get aggregated analytics data for the authenticated user
// @access  Private
router.get("/analytics", async (req, res) => {
  const { timeframe } = req.query // e.g., 'last7days', 'last30days', 'alltime'
  const userId = req.user.id

  let startDate = null
  const now = new Date()

  if (timeframe === "last7days") {
    startDate = new Date(now.setDate(now.getDate() - 7))
  } else if (timeframe === "last30days") {
    startDate = new Date(now.setMonth(now.getMonth() - 1))
  }
  // If 'alltime', startDate remains null, fetching all reports

  try {
    const query = { user: userId }
    if (startDate) {
      query.date = { $gte: startDate }
    }

    const reports = await Report.find(query).sort({ date: 1 }) // Sort by date for trend analysis

    // Overall Summary
    const totalInterviews = reports.length
    const totalScore = reports.reduce((sum, r) => sum + (r.overallScore || 0), 0)
    const averageScore = totalInterviews > 0 ? totalScore / totalInterviews : 0
    const interviewsPassed = reports.filter((r) => r.overallScore >= 80).length // Example threshold
    const interviewsFailed = reports.filter((r) => r.overallScore < 50).length // Example threshold

    // Calculate changes from previous period (simplified for example)
    // This would require fetching data from an earlier period and comparing
    const previousPeriodReports = await Report.find({
      user: userId,
      date: { $lt: startDate || new Date() }, // All reports before current timeframe
    })
      .sort({ date: -1 })
      .limit(totalInterviews) // Get roughly same number of previous reports

    const prevTotalInterviews = previousPeriodReports.length
    const prevTotalScore = previousPeriodReports.reduce((sum, r) => sum + (r.overallScore || 0), 0)
    const prevAverageScore = prevTotalInterviews > 0 ? prevTotalScore / prevTotalInterviews : 0
    const prevInterviewsPassed = previousPeriodReports.filter((r) => r.overallScore >= 80).length
    const prevInterviewsFailed = previousPeriodReports.filter((r) => r.overallScore < 50).length

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0 // If previous was 0 and current is > 0, 100% growth
      return (((current - previous) / previous) * 100).toFixed(1)
    }

    const overallSummary = {
      totalInterviews,
      averageScore,
      interviewsPassed,
      interviewsFailed,
      totalInterviewsChange: calculateChange(totalInterviews, prevTotalInterviews),
      averageScoreChange: calculateChange(averageScore, prevAverageScore),
      interviewsPassedChange: calculateChange(interviewsPassed, prevInterviewsPassed),
      interviewsFailedChange: calculateChange(interviewsFailed, prevInterviewsFailed),
    }

    // Score Trend (daily/weekly average)
    const scoreTrendMap = new Map()
    reports.forEach((report) => {
      const dateKey = new Date(report.date).toISOString().split("T")[0] // YYYY-MM-DD
      if (!scoreTrendMap.has(dateKey)) {
        scoreTrendMap.set(dateKey, { totalScore: 0, count: 0 })
      }
      const data = scoreTrendMap.get(dateKey)
      data.totalScore += report.overallScore || 0
      data.count += 1
    })
    const scoreTrend = Array.from(scoreTrendMap.entries())
      .map(([date, data]) => ({
        date,
        averageScore: data.count > 0 ? Number.parseFloat((data.totalScore / data.count).toFixed(1)) : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Skill Distribution (average score per skill)
    const skillScores = {}
    reports.forEach((report) => {
      if (report.skillBreakdown) {
        for (const skill in report.skillBreakdown) {
          if (!skillScores[skill]) {
            skillScores[skill] = { total: 0, count: 0 }
          }
          skillScores[skill].total += report.skillBreakdown[skill]
          skillScores[skill].count += 1
        }
      }
    })
    const skillDistribution = Object.keys(skillScores).map((skill) => ({
      skill,
      averageScore: Number.parseFloat((skillScores[skill].total / skillScores[skill].count).toFixed(1)),
    }))

    // Interview Type Distribution
    const interviewTypeCounts = {}
    reports.forEach((report) => {
      interviewTypeCounts[report.interviewType] = (interviewTypeCounts[report.interviewType] || 0) + 1
    })
    const interviewTypeDistribution = Object.keys(interviewTypeCounts).map((type) => ({
      type,
      count: interviewTypeCounts[type],
    }))

    // Difficulty Distribution
    const difficultyCounts = {}
    reports.forEach((report) => {
      difficultyCounts[report.difficulty] = (difficultyCounts[report.difficulty] || 0) + 1
    })
    const difficultyDistribution = Object.keys(difficultyCounts).map((difficulty) => ({
      difficulty,
      count: difficultyCounts[difficulty],
    }))

    // Top Roles Interviewed
    const roleCounts = {}
    reports.forEach((report) => {
      roleCounts[report.role] = (roleCounts[report.role] || 0) + 1
    })
    const topRoles = Object.keys(roleCounts)
      .map((role) => ({ role, count: roleCounts[role] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 roles

    // Weakest Skills (skills with lowest average score)
    const weakestSkills = [...skillDistribution].sort((a, b) => a.averageScore - b.averageScore).slice(0, 3) // Top 3 weakest

    res.status(200).json({
      overallSummary,
      scoreTrend,
      skillDistribution,
      interviewTypeDistribution,
      difficultyDistribution,
      topRoles,
      weakestSkills,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error fetching analytics data." })
  }
})

export default router

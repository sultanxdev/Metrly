import Interview from "../models/Interview.js"
import Report from "../models/Report.js"
import User from "../models/User.js"
import { cloudinary } from "../config/cloudinaryConfig.js"
import { generateReport } from "../services/geminiService.js"

// @desc    Start a new interview
// @route   POST /api/interviews/start
// @access  Private
export const startInterview = async (req, res, next) => {
  const { interviewType, jobRole, difficulty, topics, customInstructions } = req.body

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return next(new Error("User not found", 404))
    }

    // Check if user has remaining minutes (if not admin)
    if (user.role !== "admin" && user.remainingMinutes <= 0) {
      return next(new Error("You have no remaining interview minutes. Please upgrade your plan.", 403))
    }

    let resumeUrl = null
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "resumes",
        resource_type: "auto", // auto-detect file type
      })
      resumeUrl = result.secure_url
    }

    const interview = await Interview.create({
      user: req.user.id,
      interviewType,
      jobRole,
      difficulty,
      topics: topics ? topics.split(",").map((t) => t.trim()) : [],
      customInstructions,
      resumeUrl,
      status: "active",
      duration: 0, // Initialize duration
    })

    res.status(201).json({
      success: true,
      message: "Interview started successfully",
      interviewId: interview._id,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get interview details
// @route   GET /api/interviews/:id
// @access  Private
export const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return next(new Error("Interview not found", 404))
    }

    // Ensure user owns the interview or is an admin
    if (interview.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new Error("Not authorized to view this interview", 403))
    }

    res.status(200).json({ success: true, interview })
  } catch (err) {
    next(err)
  }
}

// @desc    End an interview and generate report
// @route   POST /api/interviews/:id/end
// @access  Private
export const endInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return next(new Error("Interview not found", 404))
    }

    if (interview.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new Error("Not authorized to end this interview", 403))
    }

    if (interview.status === "completed") {
      return next(new Error("Interview already completed and report generated", 400))
    }

    // Update interview status and duration (assuming duration is sent from frontend or calculated here)
    // For now, let's assume a dummy duration or calculate based on start time
    const durationInMinutes = Math.ceil((Date.now() - interview.createdAt.getTime()) / (1000 * 60))
    interview.duration = durationInMinutes
    interview.status = "completed"
    await interview.save()

    // Deduct minutes from user's remainingMinutes (if not admin)
    const user = await User.findById(req.user.id)
    if (user && user.role !== "admin") {
      user.remainingMinutes = Math.max(0, user.remainingMinutes - durationInMinutes)
      await user.save()
    }

    // --- Generate Report using Gemini AI ---
    // This is a placeholder for actual AI interaction and feedback collection
    // In a real scenario, you'd collect questions asked, user responses, and AI's real-time feedback
    // and then send it to Gemini for a comprehensive report.
    const dummyInterviewDataForAI = {
      interviewType: interview.interviewType,
      jobRole: interview.jobRole,
      difficulty: interview.difficulty,
      topics: interview.topics,
      customInstructions: interview.customInstructions,
      // In a real app, you'd pass actual conversation history here
      conversationHistory: [
        { role: "interviewer", text: "Tell me about yourself." },
        { role: "candidate", text: "I am a software engineer with 5 years of experience..." },
        { role: "interviewer", text: "What are your strengths?" },
        { role: "candidate", text: "My strengths include problem-solving and teamwork..." },
      ],
    }

    const aiReport = await generateReport(dummyInterviewDataForAI)

    const report = await Report.create({
      user: req.user.id,
      interview: interview._id,
      interviewType: interview.interviewType,
      jobRole: interview.jobRole,
      difficulty: interview.difficulty,
      topics: interview.topics,
      duration: interview.duration,
      overallScore: aiReport.overallScore,
      strengths: aiReport.strengths,
      areasForImprovement: aiReport.areasForImprovement,
      detailedFeedback: aiReport.detailedFeedback,
      resumeUrl: interview.resumeUrl,
    })

    res.status(200).json({
      success: true,
      message: "Interview completed and report generated successfully",
      reportId: report._id,
    })
  } catch (err) {
    next(err)
  }
}

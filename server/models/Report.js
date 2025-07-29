import mongoose from "mongoose"

const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    interview: {
      type: mongoose.Schema.ObjectId,
      ref: "Interview",
      required: true,
      unique: true, // One report per interview
    },
    interviewType: {
      type: String,
      enum: ["HR", "Technical", "Custom"],
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    topics: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasForImprovement: {
      type: [String],
      default: [],
    },
    detailedFeedback: [
      {
        question: String,
        userAnswer: String,
        aiFeedback: String,
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    resumeUrl: {
      type: String,
      default: null,
    },
    // Optional: Add a field for sharing if you want public links
    isShareable: {
      type: Boolean,
      default: false,
    },
    sharedToken: String, // A unique token for public sharing
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Report", ReportSchema)

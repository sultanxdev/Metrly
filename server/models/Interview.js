import mongoose from "mongoose"

const InterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
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
      type: [String], // Array of strings, e.g., ["React", "Node.js"]
      default: [],
    },
    customInstructions: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "failed"],
      default: "pending",
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    vapiCallId: {
      type: String, // ID from Vapi for the specific call
      default: null,
    },
    transcript: [
      {
        speaker: {
          type: String,
          enum: ["interviewer", "candidate"],
        },
        text: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

export default mongoose.model("Interview", InterviewSchema)

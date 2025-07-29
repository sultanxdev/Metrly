import mongoose from "mongoose"

const InterviewTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a template name"],
      unique: true,
    },
    type: {
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
    instructions: {
      type: String,
      required: [true, "Please add instructions for the AI interviewer"],
    },
    // You could add a field for associated Vapi Assistant ID if templates map directly
    // vapiAssistantId: {
    //   type: String,
    //   default: null
    // }
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("InterviewTemplate", InterviewTemplateSchema)

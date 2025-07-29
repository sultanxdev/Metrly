import express from "express"
import axios from "axios"
import { protect } from "../middleware/authMiddleware.js"
import Interview from "../models/Interview.js"
import { generateInterviewFeedback } from "../services/geminiService.js"
import { getVapiAssistant } from "../controllers/vapiController.js"

const router = express.Router()

const VAPI_API_KEY = process.env.VAPI_API_KEY
const VAPI_BASE_URL = "https://api.vapi.ai"

router.use(protect) // All routes below this will be protected

// Create Vapi Call (can be used for server-initiated calls, though client-side is common)
router.post("/start-call", async (req, res) => {
  const { assistantId, customerPhoneNumber, interviewId } = req.body // interviewId to link call to our session

  if (!assistantId) {
    return res.status(400).json({ message: "Assistant ID is required." })
  }

  try {
    const response = await axios.post(
      `${VAPI_BASE_URL}/call/phone`,
      {
        assistantId: assistantId,
        customer: {
          number: customerPhoneNumber, // This would be the user's phone number if doing outbound calls
        },
        // You can pass metadata to Vapi that will be returned in webhooks
        metadata: {
          userId: req.user.id,
          interviewId: interviewId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    res.status(200).json(response.data) // Vapi's call object
  } catch (error) {
    console.error("Error starting Vapi call:", error.response ? error.response.data : error.message)
    res.status(500).json({
      message: "Failed to start Vapi call.",
      error: error.response ? error.response.data : error.message,
    })
  }
})

// End Vapi Call
router.post("/end-call/:callId", async (req, res) => {
  try {
    const { callId } = req.params

    await axios.post(
      `${VAPI_BASE_URL}/call/${callId}/end`,
      {},
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
        },
      },
    )

    res.status(200).json({ message: "Call ended successfully" })
  } catch (error) {
    console.error("Vapi end call error:", error.response?.data || error.message)
    res.status(500).json({ message: "Failed to end Vapi call" })
  }
})

// Get Transcript from Vapi (if Vapi stores it)
router.get("/transcript/:callId", async (req, res) => {
  try {
    const { callId } = req.params

    const response = await axios.get(`${VAPI_BASE_URL}/call/${callId}/transcript`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error("Vapi get transcript error:", error.response?.data || error.message)
    res.status(500).json({ message: "Failed to retrieve Vapi transcript" })
  }
})

// Vapi Webhook Endpoint (for real-time events from Vapi)
router.post("/webhook", async (req, res) => {
  const event = req.body
  console.log("Vapi Webhook Event Received:", event.type)

  // Handle different Vapi event types
  switch (event.type) {
    case "call-start":
      console.log(`Call ${event.call.id} started.`)
      // Update interview status in your DB if needed
      await Interview.findByIdAndUpdate(event.call.metadata.interviewId, {
        vapiCallId: event.call.id,
        status: "in-progress",
        startedAt: new Date(),
      })
      break
    case "call-end":
      console.log(`Call ${event.call.id} ended. Duration: ${event.call.duration}s`)
      // Extract metadata and update your interview/report
      const { userId, interviewId } = event.call.metadata
      const transcript = event.call.transcript // Array of {role: 'user'/'assistant', content: '...'}

      // Here you would typically save the transcript and trigger report generation
      const interview = await Interview.findById(interviewId)
      if (interview) {
        interview.transcript = transcript.map((t) => ({
          speaker: t.role === "user" ? "candidate" : "interviewer",
          text: t.content,
        }))
        interview.durationTaken = event.call.duration
        interview.status = "completed"
        await interview.save()
        generateInterviewFeedback(interviewId, userId) // Trigger report generation
      }
      break
    case "speech-update":
      // console.log(`Speech update from ${event.speaker}: ${event.transcript}`);
      // You might use this for live transcript display in your frontend
      break
    case "function-call":
      console.log(`Function call requested: ${event.functionCall.name} with args:`, event.functionCall.parameters)
      // Implement your backend logic to handle function calls from Vapi
      // e.g., fetching user data, scheduling, etc.
      // You would then send a response back to Vapi with the result
      // res.json({ functionCall: { name: event.functionCall.name, result: { yourData: "..." } } });
      break
    case "hang":
      console.log(`Call ${event.call.id} hung up.`)
      break
    // Add other event types as needed
    default:
      console.log(`Unhandled Vapi event type: ${event.type}`)
  }

  res.status(200).send("Webhook received")
})

router.get("/assistant/:type", getVapiAssistant)

export default router

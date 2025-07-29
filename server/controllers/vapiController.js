// This controller is primarily for providing Vapi assistant IDs to the frontend.
// Actual Vapi call handling (webhooks, etc.) would be configured directly in Vapi
// or handled by a separate webhook endpoint if needed.

// @desc    Get Vapi Assistant ID based on type
// @route   GET /api/vapi/assistant/:type
// @access  Private
export const getVapiAssistant = async (req, res, next) => {
  const { type } = req.params // 'HR' or 'Technical'

  let assistantId

  if (type === "HR") {
    assistantId = process.env.VAPI_HR_ASSISTANT_ID
  } else if (type === "Technical") {
    assistantId = process.env.VAPI_TECHNICAL_ASSISTANT_ID
  } else {
    return next(new Error("Invalid assistant type specified", 400))
  }

  if (!assistantId) {
    return next(new Error(`Vapi Assistant ID for type '${type}' is not configured.`, 500))
  }

  res.status(200).json({
    success: true,
    assistantId,
  })
}

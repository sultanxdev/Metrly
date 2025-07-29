import express from "express"
import { startInterview, getInterview, endInterview } from "../controllers/interviewController.js"
import { protect } from "../middleware/authMiddleware.js"
import { upload } from "../config/multerConfig.js"

const router = express.Router()

router.use(protect) // All routes below this will be protected

router.post("/start", upload.single("resume"), startInterview)
router.get("/:id", getInterview)
router.post("/:id/end", endInterview) // Endpoint to mark interview as completed and trigger report generation

export default router

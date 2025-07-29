import express from "express"
import { protect, authorize } from "../middleware/authMiddleware.js"
import {
  getAdminDashboardStats,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAllPayments,
  getAllInterviewTemplates,
  createInterviewTemplate,
  updateInterviewTemplate,
  deleteInterviewTemplate,
} from "../controllers/adminController.js"

const router = express.Router()

router.use(protect) // All routes below this require authentication
router.use(authorize("admin")) // All routes below this require admin role

// Dashboard Stats
router.get("/dashboard-stats", getAdminDashboardStats)

// User Management
router.get("/users", getAllUsers)
router.put("/users/:id", updateUserByAdmin)
router.delete("/users/:id", deleteUserByAdmin)

// Payment Management
router.get("/payments", getAllPayments)

// Interview Template Management
router.get("/templates", getAllInterviewTemplates)
router.post("/templates", createInterviewTemplate)
router.put("/templates/:id", updateInterviewTemplate)
router.delete("/templates/:id", deleteInterviewTemplate)

export default router

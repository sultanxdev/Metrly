import express from "express"
import { createOrder, verifyPayment, getSubscriptionDetails } from "../controllers/paymentController.js"
import { protect } from "../middleware/authMiddleware.js"
import Razorpay from "razorpay"
import Payment from "../models/Payment"

const router = express.Router()
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

router.use(protect) // All routes below this will be protected

router.post("/create-order", createOrder)

router.post("/verify-payment", verifyPayment)

router.get("/subscription-details", getSubscriptionDetails)

// @route   GET /api/payments/history
// @desc    Get payment history for the authenticated user
// @access  Private
router.get("/history", async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ date: -1 })
    res.status(200).json(payments)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error fetching payment history." })
  }
})

export default router

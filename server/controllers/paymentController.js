import Razorpay from "razorpay"
import Payment from "../models/Payment.js"
import User from "../models/User.js"
import crypto from "crypto"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  const { amount, currency, plan } = req.body // amount in smallest currency unit (e.g., paise for INR)

  try {
    const options = {
      amount: amount,
      currency: currency,
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1, // 1 for automatic capture
      notes: {
        userId: req.user.id,
        plan: plan,
      },
    }

    const order = await razorpay.orders.create(options)

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (err) {
    console.error("Error creating Razorpay order:", err)
    next(new Error("Failed to create payment order", 500))
  }
}

// @desc    Verify Razorpay payment and update user subscription
// @route   POST /api/payments/verify-payment
// @access  Private
export const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      const payment = await razorpay.payments.fetch(razorpay_payment_id)

      // Save payment details to your database
      const newPayment = await Payment.create({
        user: req.user.id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status, // 'captured' on success
        plan: plan,
      })

      // Update user's subscription/minutes
      const user = await User.findById(req.user.id)
      if (!user) {
        return next(new Error("User not found", 404))
      }

      if (plan === "pro") {
        user.plan = "pro"
        user.remainingMinutes = 999999999 // Effectively unlimited for pro
        user.planStartDate = Date.now()
        user.planEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year subscription
      }
      // Add logic for other plans if any

      await user.save()

      res.status(200).json({
        success: true,
        message: "Payment verified and subscription updated successfully!",
        payment: newPayment,
      })
    } else {
      return next(new Error("Payment verification failed: Invalid signature", 400))
    }
  } catch (err) {
    console.error("Error verifying payment:", err)
    next(new Error("Payment verification failed", 500))
  }
}

// @desc    Get user's subscription details
// @route   GET /api/payments/subscription-details
// @access  Private
export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return next(new Error("User not found", 404))
    }

    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 })

    // Determine free plan minutes (e.g., from env or config)
    const freePlanMinutes = 30 // Example: 30 minutes for free plan

    res.status(200).json({
      success: true,
      plan: user.plan,
      remainingMinutes: user.remainingMinutes,
      planStartDate: user.planStartDate,
      planEndDate: user.planEndDate,
      freePlanMinutes: freePlanMinutes,
      payments: payments,
    })
  } catch (err) {
    next(err)
  }
}

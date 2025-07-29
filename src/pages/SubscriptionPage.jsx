"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SubscriptionPage() {
  const { user, loadUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState(null)

  const fetchSubscriptionDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get("/payments/subscription-details")
      setSubscriptionDetails(res.data)
    } catch (error) {
      console.error("Failed to fetch subscription details:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [])

  const handleUpgrade = async () => {
    setPaymentLoading(true)
    try {
      const orderRes = await api.post("/payments/create-order", {
        amount: 999, // Amount in paise (e.g., 999 for 9.99 USD/INR)
        currency: "INR", // Or "USD"
        plan: "pro",
      })

      const { orderId, amount, currency, receipt } = orderRes.data

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay Key ID
        amount: amount,
        currency: currency,
        name: "InterviewMate",
        description: "Pro Plan Subscription",
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: "pro",
            })
            toast({
              title: "Payment Successful!",
              description: verifyRes.data.message,
            })
            await loadUser() // Refresh user data to show updated minutes/plan
            await fetchSubscriptionDetails() // Refresh subscription details
          } catch (error) {
            console.error("Payment verification failed:", error.response?.data || error.message)
            toast({
              title: "Payment Failed",
              description: error.response?.data?.message || "Payment verification failed. Please contact support.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: "", // Optional: User's phone number
        },
        notes: {
          address: "InterviewMate Office",
        },
        theme: {
          color: "#6B46C1", // Purple color
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Failed to initiate payment:", error.response?.data || error.message)
      toast({
        title: "Upgrade Failed",
        description: error.response?.data?.message || "Could not initiate payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const isPro = subscriptionDetails?.plan === "pro"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscription & Billing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
          <CardDescription>Details about your active subscription.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Plan:</p>
            <Badge variant={isPro ? "default" : "secondary"}>{isPro ? "Pro" : "Free"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Remaining Minutes:</p>
            <p className="text-lg">{subscriptionDetails?.remainingMinutes || 0} minutes</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Next Renewal:</p>
            <p className="text-lg">
              {isPro
                ? subscriptionDetails?.renewalDate
                  ? new Date(subscriptionDetails.renewalDate).toLocaleDateString()
                  : "N/A"
                : "N/A"}
            </p>
          </div>
          {!isPro && (
            <div className="text-muted-foreground text-sm">
              Free plan includes {subscriptionDetails?.freePlanMinutes || 0} minutes per month.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>Unlock more features and interview minutes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Free Plan Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold mt-2">
                $0<span className="text-lg text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> {subscriptionDetails?.freePlanMinutes || 0}{" "}
                  minutes/month
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Basic Interview Types
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Standard Reports
                </li>
                <li className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" /> Advanced Analytics
                </li>
                <li className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" /> Priority Support
                </li>
              </ul>
              <Button className="w-full mt-4 bg-transparent" variant="outline" disabled={!isPro}>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <CardDescription>For serious interview preparation</CardDescription>
              <div className="text-4xl font-bold mt-2">
                $9.99<span className="text-lg text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Unlimited Minutes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> All Interview Types (HR, Technical, Custom)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Detailed & Shareable Reports
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Advanced Analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Priority Support
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={handleUpgrade} disabled={isPro || paymentLoading}>
                {paymentLoading ? <LoadingSpinner className="mr-2" /> : null}
                {isPro ? "Subscribed" : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionDetails?.payments && subscriptionDetails.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionDetails.payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {payment.currency} {payment.amount / 100}
                      </TableCell>
                      <TableCell>{payment.status}</TableCell>
                      <TableCell>{payment.razorpayPaymentId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No payment history found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

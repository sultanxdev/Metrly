"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const { token } = useParams()
  const [verificationStatus, setVerificationStatus] = useState("loading") // loading, success, error
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`)
        setVerificationStatus("success")
        setMessage(res.data.message)
      } catch (error) {
        setVerificationStatus("error")
        setMessage(error.response?.data?.message || "Email verification failed. The link might be invalid or expired.")
        console.error("Email verification failed:", error.response?.data || error.message)
      }
    }

    if (token) {
      verifyEmail()
    } else {
      setVerificationStatus("error")
      setMessage("No verification token provided.")
    }
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === "loading" && "Verifying your email address..."}
            {verificationStatus === "success" && "Your email has been successfully verified!"}
            {verificationStatus === "error" && "Email verification failed."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {verificationStatus === "loading" && <LoadingSpinner size="lg" />}
          {verificationStatus === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {verificationStatus === "error" && <XCircle className="h-16 w-16 text-red-500" />}
          <p className="text-muted-foreground">{message}</p>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

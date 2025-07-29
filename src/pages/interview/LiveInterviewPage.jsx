"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useVapi } from "@vapi-ai/web"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, CheckCircle, XCircle } from "lucide-react"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function LiveInterviewPage() {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { toggleCall, callState, setMuted, muted, volume, setVolume } = useVapi()

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [callConnecting, setCallConnecting] = useState(false)
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [interviewStatus, setInterviewStatus] = useState("active") // active, ended, generating_report

  const callActive = callState === "connected" || callState === "connecting"

  const fetchInterviewDetails = useCallback(async () => {
    try {
      const res = await api.get(`/interviews/${interviewId}`)
      setInterview(res.data)
      if (res.data.status === "completed") {
        setInterviewEnded(true)
        setInterviewStatus("ended")
      }
    } catch (error) {
      console.error("Failed to fetch interview details:", error)
      toast({
        title: "Error",
        description: "Failed to load interview details.",
        variant: "destructive",
      })
      navigate("/dashboard") // Redirect if interview not found or error
    } finally {
      setLoading(false)
    }
  }, [interviewId, navigate, toast])

  useEffect(() => {
    fetchInterviewDetails()
  }, [fetchInterviewDetails])

  useEffect(() => {
    if (callState === "connected") {
      setCallConnecting(false)
      toast({
        title: "Call Connected",
        description: "You are now speaking with the AI interviewer.",
      })
    } else if (callState === "ended") {
      setCallConnecting(false)
      if (!interviewEnded) {
        // Only show toast if it wasn't manually ended by user
        toast({
          title: "Call Ended",
          description: "The interview call has ended.",
        })
      }
      setInterviewEnded(true)
      setInterviewStatus("generating_report")
      handleEndInterview()
    } else if (callState === "error") {
      setCallConnecting(false)
      toast({
        title: "Call Error",
        description: "There was an error with the call. Please try again.",
        variant: "destructive",
      })
      setInterviewEnded(true)
      setInterviewStatus("ended") // Mark as ended to allow report generation or navigation
    } else if (callState === "connecting") {
      setCallConnecting(true)
    }
  }, [callState, toast, interviewEnded])

  const handleStartCall = async () => {
    if (!interview) return

    setCallConnecting(true)
    try {
      const assistantId =
        interview.interviewType === "Technical"
          ? import.meta.env.VITE_VAPI_TECHNICAL_ASSISTANT_ID
          : import.meta.env.VITE_VAPI_HR_ASSISTANT_ID

      if (!assistantId) {
        throw new Error("Vapi Assistant ID is not configured for this interview type.")
      }

      await toggleCall(assistantId)
    } catch (error) {
      console.error("Error starting Vapi call:", error)
      toast({
        title: "Call Failed",
        description: error.message || "Could not start the call. Please check your Vapi configuration.",
        variant: "destructive",
      })
      setCallConnecting(false)
    }
  }

  const handleEndInterview = async () => {
    if (callActive) {
      toggleCall() // End the Vapi call if active
    }
    setInterviewEnded(true)
    setInterviewStatus("generating_report")
    try {
      const res = await api.post(`/interviews/${interviewId}/end`)
      toast({
        title: "Interview Ended",
        description: res.data.message,
      })
      navigate(`/reports/${interviewId}`)
    } catch (error) {
      console.error("Failed to end interview or generate report:", error.response?.data || error.message)
      toast({
        title: "Report Generation Failed",
        description: error.response?.data?.message || "Could not generate report. Please check interview status.",
        variant: "destructive",
      })
      setInterviewStatus("ended") // Allow user to navigate manually
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The interview you are looking for does not exist or an error occurred.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Live Interview</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {interview.interviewType} Interview for {interview.jobRole}
          </CardTitle>
          <CardDescription>
            Difficulty: {interview.difficulty} | Topics: {interview.topics || "General"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!callActive && !interviewEnded && (
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">Click the button below to start your AI mock interview.</p>
              <Button onClick={handleStartCall} disabled={callConnecting} className="px-8 py-4 text-lg">
                {callConnecting ? (
                  <>
                    <LoadingSpinner className="mr-2" /> Connecting...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" /> Start Call
                  </>
                )}
              </Button>
            </div>
          )}

          {callActive && (
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-primary">
                {callState === "connected" ? "Interview in Progress..." : "Connecting to AI..."}
              </p>
              <Progress value={(interview.duration / 30) * 100} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground">Duration: {interview.duration} minutes (max 30 minutes)</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMuted(!muted)}
                  title={muted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVolume(volume === 1 ? 0 : 1)}
                  title={volume === 1 ? "Mute AI Voice" : "Unmute AI Voice"}
                >
                  {volume === 1 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleEndInterview}
                  disabled={interviewStatus === "generating_report"}
                >
                  <PhoneOff className="mr-2 h-5 w-5" /> End Interview
                </Button>
              </div>
            </div>
          )}

          {interviewEnded && interviewStatus === "generating_report" && (
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <h2 className="text-xl font-semibold">Generating Report...</h2>
              <p className="text-muted-foreground">This may take a few moments. Please do not close this page.</p>
            </div>
          )}

          {interviewEnded && interviewStatus === "ended" && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Interview Completed!</h2>
              <p className="text-muted-foreground">Your report is ready.</p>
              <Button onClick={() => navigate(`/reports/${interviewId}`)}>View Report</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

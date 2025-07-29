"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function InterviewSetupPage() {
  const [interviewType, setInterviewType] = useState("HR") // HR, Technical, Custom
  const [jobRole, setJobRole] = useState("")
  const [difficulty, setDifficulty] = useState("Medium") // Easy, Medium, Hard
  const [topics, setTopics] = useState("") // Comma separated
  const [customInstructions, setCustomInstructions] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("interviewType", interviewType)
    formData.append("jobRole", jobRole)
    formData.append("difficulty", difficulty)
    formData.append("topics", topics)
    formData.append("customInstructions", customInstructions)
    if (resumeFile) {
      formData.append("resume", resumeFile)
    }

    try {
      const res = await api.post("/interviews/start", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      toast({
        title: "Interview Started!",
        description: "Redirecting to live interview...",
      })
      navigate(`/interview/live/${res.data.interviewId}`)
    } catch (error) {
      console.error("Failed to start interview:", error.response?.data || error.message)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start interview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Setup Your Mock Interview</h1>
      <Card>
        <CardHeader>
          <CardTitle>Interview Configuration</CardTitle>
          <CardDescription>Tailor your mock interview to match your specific needs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="interviewType">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger id="interviewType">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR Interview</SelectItem>
                  <SelectItem value="Technical">Technical Interview</SelectItem>
                  <SelectItem value="Custom">Custom Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="jobRole">Job Role</Label>
              <Input
                id="jobRole"
                placeholder="e.g., Software Engineer, Marketing Manager"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topics">Key Topics (comma-separated)</Label>
              <Input
                id="topics"
                placeholder="e.g., React, Node.js, Agile, Leadership"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Specify key areas you want to be questioned on.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resume">Upload Resume (Optional)</Label>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              <p className="text-sm text-muted-foreground">
                Upload your resume for a more personalized interview experience.
              </p>
            </div>

            {interviewType === "Custom" && (
              <div className="grid gap-2">
                <Label htmlFor="customInstructions">Custom Instructions</Label>
                <Textarea
                  id="customInstructions"
                  placeholder="e.g., Focus on my problem-solving skills, ask about my experience with cloud platforms."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">Provide specific instructions for the AI interviewer.</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              Start Interview
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BarChart2, XCircle, Download, Share2, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import jsPDF from "jspdf"
import "jspdf-autotable"
import html2canvas from "html2canvas"

export default function ReportDetailPage({ isShared = false }) {
  const { reportId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = isShared ? `/reports/shared/${reportId}` : `/reports/${reportId}`
      const res = await api.get(endpoint)
      setReport(res.data)
    } catch (error) {
      console.error("Failed to fetch report:", error)
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load report. It might not exist or you don't have access.",
        variant: "destructive",
      })
      if (!isShared) {
        navigate("/reports") // Redirect to reports list if not a shared report
      }
    } finally {
      setLoading(false)
    }
  }, [reportId, isShared, navigate, toast])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleDownloadPdf = async () => {
    if (!report) return

    const input = document.getElementById("report-content")
    if (!input) {
      toast({
        title: "Error",
        description: "Report content not found for PDF generation.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const canvas = await html2canvas(input, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`InterviewMate_Report_${report.jobRole}_${new Date(report.createdAt).toLocaleDateString()}.pdf`)
      toast({
        title: "Download Complete",
        description: "Your report has been downloaded as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/reports/${reportId}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copied!",
      description: "The shareable link has been copied to your clipboard.",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The report you are looking for does not exist or you do not have permission to view it.
        </p>
        {!isShared && <Button onClick={() => navigate("/reports")}>Go to Reports</Button>}
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interview Report</h1>
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleDownloadPdf} disabled={loading}>
          {loading ? <LoadingSpinner className="mr-2" /> : <Download className="mr-2 h-4 w-4" />}
          Download PDF
        </Button>
        {!isShared && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Share Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share This Report</DialogTitle>
                <DialogDescription>Anyone with this link will be able to view this report.</DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <Input readOnly value={`${window.location.origin}/shared/reports/${reportId}`} />
                <Button type="button" size="sm" className="px-3" onClick={handleCopyShareLink}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div id="report-content" className="space-y-6 p-4 bg-background rounded-lg shadow-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Overall Performance</CardTitle>
            <CardDescription>Summary of your interview performance.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold mb-4" style={{ color: getScoreColor(report.overallScore) }}>
              {report.overallScore}%
            </div>
            <p className="text-lg text-muted-foreground">
              You scored {report.overallScore}% in your {report.interviewType} interview for the {report.jobRole} role.
            </p>
            <div className="mt-4">
              <Progress value={report.overallScore} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {report.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {report.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {report.detailedFeedback.map((feedback, index) => (
              <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                <h3 className="font-semibold text-lg mb-2">{feedback.question}</h3>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium">Your Answer:</span> {feedback.userAnswer}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">AI Feedback:</span> {feedback.aiFeedback}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <BarChart2 className="h-4 w-4 mr-1 text-primary" />
                  <span className="font-medium">Score:</span>{" "}
                  <span className={getScoreColor(feedback.score)}>{feedback.score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-muted-foreground">
            <p>
              <strong>Interview ID:</strong> {report.interviewId}
            </p>
            <p>
              <strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {report.duration} minutes
            </p>
            <p>
              <strong>Job Role:</strong> {report.jobRole}
            </p>
            <p>
              <strong>Difficulty:</strong> {report.difficulty}
            </p>
            <p>
              <strong>Topics:</strong> {report.topics || "N/A"}
            </p>
            {report.resumeUrl && (
              <p>
                <strong>Resume Used:</strong>{" "}
                <a href={report.resumeUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  View Resume
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

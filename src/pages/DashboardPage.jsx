"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, FileText, Mic, Clock, CreditCard } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get("/users/dashboard-stats")
        setStats(statsRes.data)

        const reportsRes = await api.get("/reports?limit=5") // Fetching last 5 reports
        setRecentReports(reportsRes.data.reports)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInterviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              You've completed {stats?.totalInterviews || 0} mock interviews.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore ? stats.averageScore.toFixed(1) : "N/A"}%</div>
            <p className="text-xs text-muted-foreground">Your average performance score.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes Used</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.minutesUsed || 0} min</div>
            <p className="text-xs text-muted-foreground">Total AI interaction time.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Minutes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.remainingMinutes || 0} min</div>
            <p className="text-xs text-muted-foreground">Minutes left in your subscription.</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/interview/setup">
              <Mic className="mr-2 h-4 w-4" /> Start New Interview
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reports">
              <FileText className="mr-2 h-4 w-4" /> View All Reports
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/analytics">
              <BarChart2 className="mr-2 h-4 w-4" /> Check Analytics
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reports</CardTitle>
          <Button asChild variant="link">
            <Link to="/reports">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <ul className="space-y-3">
              {recentReports.map((report) => (
                <li key={report._id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Link to={`/reports/${report._id}`} className="font-medium hover:underline">
                      {report.interviewType} Interview - {report.jobRole}
                    </Link>
                    <p className="text-sm text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={report.overallScore >= 70 ? "default" : "secondary"}>
                    Score: {report.overallScore}%
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No recent reports. Start an interview to generate one!</p>
          )}
        </CardContent>
      </Card>

      {/* Tips for Improvement (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Based on your recent performance, here are some areas to focus on:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Practice active listening to better understand questions.</li>
            <li>Structure your answers using the STAR method for behavioral questions.</li>
            <li>Review common technical concepts for your target role.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

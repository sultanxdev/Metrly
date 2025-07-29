"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("30days")
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/users/analytics?timeframe=${timeframe}`)
        setAnalyticsData(res.data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeframe, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const formatChartData = (data) => {
    if (!data) return []
    return Object.keys(data).map((key) => ({
      name: key,
      value: data[key],
    }))
  }

  const scoreTrendData =
    analyticsData?.scoreTrend?.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      score: item.averageScore,
    })) || []

  const interviewTypeData = formatChartData(analyticsData?.interviewTypeDistribution)
  const difficultyData = formatChartData(analyticsData?.difficultyDistribution)
  const minutesUsedData =
    analyticsData?.minutesUsedTrend?.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      minutes: item.minutes,
    })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Analytics</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Overview</CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Interviews</CardDescription>
              <CardTitle className="text-2xl">{analyticsData?.totalInterviews || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-2xl">
                {analyticsData?.averageScore ? analyticsData.averageScore.toFixed(1) : "N/A"}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Minutes Used</CardDescription>
              <CardTitle className="text-2xl">{analyticsData?.totalMinutesUsed || 0} min</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Remaining Minutes</CardDescription>
              <CardTitle className="text-2xl">{analyticsData?.remainingMinutes || 0} min</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Score Trend</CardTitle>
            <CardDescription>Your performance over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Avg. Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minutes Used Trend</CardTitle>
            <CardDescription>Your interview time consumption over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={minutesUsedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="minutes" stroke="#82ca9d" activeDot={{ r: 8 }} name="Minutes Used" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Type Distribution</CardTitle>
            <CardDescription>Breakdown of interview types you've taken.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interviewTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>Breakdown of interview difficulties you've faced.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

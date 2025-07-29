"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Users, DollarSign, Mic, Clock } from "lucide-react"
import api from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "../../components/ui/loading-spinner"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true)
        const res = await api.get("/admin/dashboard-stats")
        setStats(res.data)
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAdminDashboardData()
  }, [toast])

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

  const userGrowthData =
    stats?.userGrowth?.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      users: item.count,
    })) || []

  const interviewTypeData = formatChartData(stats?.interviewTypeDistribution)
  const paymentStatusData = formatChartData(stats?.paymentStatusDistribution)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-500">Registered users</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Mic className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInterviews || 0}</div>
            <p className="text-xs text-gray-500">Completed interviews</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats?.totalRevenue ? (stats.totalRevenue / 100).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-gray-500">From subscriptions</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interview Duration</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageInterviewDuration ? stats.averageInterviewDuration.toFixed(1) : "N/A"} min
            </div>
            <p className="text-xs text-gray-500">Average time per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              New user registrations over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Interview Type Distribution</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Breakdown of interview types taken by users.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interviewTypeData}>
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

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Status Distribution</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Overview of payment statuses.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Add more admin-specific charts/data as needed */}
      </div>
    </motion.div>
  )
}

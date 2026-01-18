"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BarChart3, Calendar, Clock, TrendingUp, Users, BookOpen, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { UserRole } from "@/generated/enums"
import { useAnalyticsForHOD } from "@/hooks/react-query/useHalls"

const STATUS_COLORS = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  cancelled: "#6b7280",
}

const AnalyticsPage = () => {
  const router = useRouter()
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? undefined)

  const departmentId = profile?.department_id
  const { data: analyticsData, isLoading } = useAnalyticsForHOD(departmentId ? departmentId : "")

  useEffect(() => {
    if (profileLoading) return
    if (profile?.roles[0]?.role !== UserRole.hod) {
      toast.error("Access denied: HOD only")
      router.push("/dashboard")
    }
  }, [profile, profileLoading, router])

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  if (!analyticsData) {
    return <p className="text-center">No data found</p>
  }

  const statusDistributionData = Object.entries(analyticsData.statusDistribution || {}).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#3b82f6",
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Department-level insights for halls under your management
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm">Total Halls</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analyticsData.totalHalls}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm">Teachers</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analyticsData.totalTeachers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analyticsData.totalBookings}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm">Tech Staff</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analyticsData.totalTechStaff}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Hall Utilization
              </CardTitle>
              <CardDescription>Booking count per hall</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analyticsData.hallUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hall_name" />
                  <YAxis />
                  <Tooltip cursor={{ }} />
                  <Bar
                    dataKey="total_bookings"
                    fill="#10b981"
                    barSize={40}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {analyticsData.hallUsage.map((hall) => (
                  <div
                    key={hall.hall_id}
                    onClick={() => router.push(`/dashboard/hod/analytics/${hall.hall_id}`)}
                    className="flex items-center justify-between px-3 py-2 rounded-md border
                               hover:bg-muted/40 cursor-pointer transition"
                  >
                    <span className="text-sm font-medium">{hall.hall_name}</span>
                    <span className="text-xs text-primary font-semibold">
                      View →
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Peak Booking Hours
              </CardTitle>
              <CardDescription>Most popular time slots</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={analyticsData.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="booking_count"
                    stroke="#f59e0b"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Monthly Booking Trends
              </CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analyticsData.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="booking_count"
                    fill="#3b82f6"
                    barSize={36}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Booking Status Distribution
              </CardTitle>
              <CardDescription>All bookings by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusDistributionData} dataKey="value" outerRadius={80}>
                    {statusDistributionData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Most Active Teachers
            </CardTitle>
            <CardDescription>Top 5 teachers by booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analyticsData.activeTeachers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="teacher_name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="booking_count"
                  fill="#8b5cf6"
                  barSize={32}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AnalyticsPage

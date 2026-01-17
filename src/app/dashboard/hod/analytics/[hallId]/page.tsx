"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { useProfile } from "@/hooks/react-query/useUser"
import { UserRole } from "@/generated/enums"
import { useHallAnalytics } from "@/hooks/react-query/useHalls"
import { Download, Calendar, Clock, Zap, AlertCircle, TrendingUp } from "lucide-react"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]
const STATUS_COLORS = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  cancelled: "#6b7280",
}

const HallAnalyticsPage = () => {
  const router = useRouter()
  const { hallId } = useParams<{ hallId: string }>()
  const { userId: clerkId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? undefined)
  const departmentId = profile?.department_id
  const { data, isLoading } = useHallAnalytics(hallId, departmentId!)

  useEffect(() => {
    if (profileLoading) return

    if (profile?.roles[0]?.role !== UserRole.hod) {
      toast.error("Access denied")
      router.push("/dashboard")
    }
  }, [profile, profileLoading, router])

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading hall analytics...</p>
      </div>
    )
  }

  if (!data) {
    return <p className="text-center">No data found</p>
  }

  const { hall, hod, techStaff, stats, bookings } = data

  const statusBreakdown = Object.entries(stats.byStatus).map(([status, count]) => ({
    status,
    count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
  }))

  const equipmentData = stats.equipmentUsage
    ? Object.entries(stats.equipmentUsage).map(([type, count], idx) => ({
        name: type,
        value: count,
        color: COLORS[idx % COLORS.length],
      }))
    : []

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-pretty">{hall.name}</h1>
              <p className="text-muted-foreground mt-2">{hall.location}</p>
            </div>
            <Button onClick={() => (window.location.href = `/api/analytics/${hallId}`)} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Seating Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{hall.seating_capacity}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">{hall.status}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">HOD</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{hod?.name}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tech Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{techStaff.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Booking Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statusBreakdown.map(({ status, count, color }) => (
                <div
                  key={status}
                  className="p-4 rounded-lg border border-border/50 text-center hover:shadow-md transition-shadow"
                >
                  <p className="text-3xl font-bold" style={{ color }}>
                    {count}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize mt-1">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Monthly Booking Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.monthlyTrend || []}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Peak Usage Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#f59e0b" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Equipment Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={equipmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={800}
                  >
                    {equipmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Session Duration Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Average Duration</span>
                  <span className="font-bold">{stats.avgSessionDuration || 0} mins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Longest Session</span>
                  <span className="font-semibold">{stats.longestSession || 0} mins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shortest Session</span>
                  <span className="font-semibold">{stats.shortestSession || 0} mins</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking History
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Teacher</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{b.booking_date.toISOString().split("T")[0]}</td>
                    <td className="py-3 px-4">
                      {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4">{b.teacher.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: STATUS_COLORS[b.status as keyof typeof STATUS_COLORS] + "20",
                          color: STATUS_COLORS[b.status as keyof typeof STATUS_COLORS],
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{b.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default HallAnalyticsPage

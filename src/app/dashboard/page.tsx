"use client"

import { Building2, Calendar, Bell, Loader2, CalendarDays, BarChart3, Users } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile, useUserRole } from "@/hooks/react-query/useUser"
import { useHalls } from "@/hooks/react-query/useHalls"
import { usePendingBookingsForHOD } from "@/hooks/react-query/useBookings"
import { UserRole } from "@/generated/enums"

export default function Dashboard() {
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(userId ?? undefined)
  const { data: halls = [], isLoading: hallsLoading } = useHalls()
  const { data: role, isLoading: roleLoading } = useUserRole(profile?.id ?? undefined)
  const { data: pendingBookings = [], isLoading: pendingBookingsLoading } = usePendingBookingsForHOD(
    profile?.department_id ?? undefined,
  )

  if (profileLoading || roleLoading || pendingBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
      case "booked":
        return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
      case "ongoing":
        return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
      case "maintenance":
        return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2 text-balance">Welcome back, {profile?.name} 👋</h2>
          <p className="text-lg text-muted-foreground">Manage all seminar hall bookings and actions from one place.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Button
            variant="default"
            className="h-28 shadow-md hover:shadow-xl transition-all flex flex-col items-start justify-center p-6 cursor-pointer rounded-xl group"
            onClick={() => router.push("/dashboard/halls")}
          >
            <Building2 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-base font-semibold">Browse All Halls</span>
          </Button>

          {role == UserRole.hod || role == UserRole.teacher ? (
            <Button
              variant="default"
              className="h-28 shadow-md hover:shadow-xl transition-all flex flex-col items-start justify-center p-6 cursor-pointer rounded-xl group"
              onClick={() => router.push("/dashboard/book")}
            >
              <CalendarDays className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-base font-semibold">Request Booking</span>
            </Button>
          ) : null}

          <Button
            variant="secondary"
            className="h-28 shadow-md hover:shadow-xl transition-all flex flex-col items-start justify-center p-6 cursor-pointer rounded-xl group"
            onClick={() => router.push("/dashboard/calendar")}
          >
            <Calendar className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-base font-semibold">View Calendar</span>
          </Button>

          {role === UserRole.hod && (
            <Button
              variant="outline"
              className="h-28 shadow-md hover:shadow-xl transition-all flex flex-col items-start justify-center p-6 cursor-pointer rounded-xl group bg-transparent"
              onClick={() => router.push("/dashboard/hod/analytics")}
            >
              <BarChart3 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-base font-semibold">Analytics</span>
            </Button>
          )}
        </div>

        {role === UserRole.hod && (
          <div className="mb-12">
            <Card className="shadow-md border-border/50">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Pending Approvals</CardTitle>
                      <CardDescription className="mt-0.5">Requests awaiting your review</CardDescription>
                    </div>
                  </div>
                  {pendingBookings?.length ? (
                    <Badge variant="destructive" className="text-base px-3 py-1">
                      {pendingBookings.length}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/dashboard/hod/approval")}
                    className="gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Bell className="h-4 w-4" />
                    View All Requests
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/hod/hall-management")}
                    variant="outline"
                    className="gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Manage Halls
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/hod/department-management")}
                    variant="outline"
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Manage Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold">Available Halls</h3>
          <p className="text-muted-foreground mt-1">Browse and book seminar halls</p>
        </div>

        {hallsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.slice(0, 6).map((hall: any, idx: number) => (
              <Card
                key={hall.id}
                className="shadow-md hover:shadow-xl transition-all cursor-pointer border-border/50 hover:border-primary/50 group"
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => router.push(`/dashboard/halls/${hall.id}`)}
              >
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {hall.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{hall.department?.name}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(hall.status)}>{hall.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-semibold">{hall.seating_capacity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-right">{hall.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

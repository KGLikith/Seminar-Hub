"use client"

import { Building2, Calendar, Loader2, CalendarDays, BarChart3, Users, Bell, ArrowRight } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile } from "@/hooks/react-query/useUser"
import { useHalls } from "@/hooks/react-query/useHalls"
import { usePendingBookingsForHOD } from "@/hooks/react-query/useBookings"
import { UserRole } from "@/generated/enums"
import { useMemo } from "react"
import { useGetHallForTechStaff } from "@/hooks/react-query/useTechStaff"

export default function Dashboard() {
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(userId ?? undefined)
  const { data: halls = [], isLoading: hallsLoading } = useHalls()
  const departmentId = profile?.department_id

  const { data: pendingBookings = [], isLoading: pendingBookingsLoading } =
    usePendingBookingsForHOD(departmentId as string)


  const { data: hallForTechStaff } = useGetHallForTechStaff(
    profile?.id ?? undefined,
    profile?.roles[0].role === UserRole.tech_staff,
  )

  const role = profile?.roles[0].role

  const { primaryHalls, secondaryHalls, primaryTitle } = useMemo(() => {
    if (!profile) {
      return {
        primaryHalls: halls,
        secondaryHalls: [],
        primaryTitle: "Halls",
      }
    }

    if (role === UserRole.tech_staff) {
      const maintainedIds = hallForTechStaff?.map((h: any) => h.hall_id) ?? []

      const primary = halls.filter((h) => maintainedIds.includes(h.id))
      const secondary = halls.filter((h) => !maintainedIds.includes(h.id))

      return {
        primaryHalls: primary,
        secondaryHalls: secondary,
        primaryTitle: "My Maintained Halls",
      }
    }

    if (role === UserRole.hod || role === UserRole.teacher) {
      const primary = halls.filter((h) => h.department_id === profile.department_id)
      const secondary = halls.filter((h) => h.department_id !== profile.department_id)

      return {
        primaryHalls: primary,
        secondaryHalls: secondary,
        primaryTitle: "Department Halls",
      }
    }

    return {
      primaryHalls: halls,
      secondaryHalls: [],
      primaryTitle: "Halls",
    }
  }, [halls, profile, role, hallForTechStaff])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      case "booked":
        return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
      case "ongoing":
        return "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200"
      case "maintenance":
        return "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200"
      default:
        return "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200"
    }
  }

  if (profileLoading || pendingBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-bold text-balance bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back, {profile?.name}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Manage all seminar hall bookings and actions from one place
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Button
            variant="outline"
            className="h-24 px-5 flex items-center justify-between rounded-xl border-border/60 
               bg-background hover:bg-muted/40 transition-all group"
            onClick={() => router.push("/dashboard/halls")}
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Browse Halls</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Button>

          {(role === UserRole.hod || role === UserRole.teacher) && (
            <Button
              variant="outline"
              className="h-24 px-5 flex items-center justify-between rounded-xl border-border/60 
                 bg-background hover:bg-muted/40 transition-all group"
              onClick={() => router.push("/dashboard/book")}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">Request Booking</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          <Button
            variant="outline"
            className="h-24 px-5 flex items-center justify-between rounded-xl border-border/60 
               bg-background hover:bg-muted/40 transition-all group"
            onClick={() => router.push("/dashboard/calendar")}
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">View Calendar</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Button>

          {role === UserRole.hod && (
            <Button
              variant="outline"
              className="h-24 px-5 flex items-center justify-between rounded-xl border-border/60 
                 bg-background hover:bg-muted/40 transition-all group"
              onClick={() => router.push("/dashboard/hod/analytics")}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">Analytics</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>

        {role === UserRole.hod && (
          <div className="mb-12">
            <Card className="shadow-lg border-0 bg-linear-to-br from-card to-card/95">
              <CardHeader className="border-b border-border/30 pb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                      <Bell className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Pending Approvals</CardTitle>
                      <CardDescription className="mt-1">Requests awaiting your review</CardDescription>
                    </div>
                  </div>
                  {pendingBookings?.length! > 0 && (
                    <Badge className="text-lg px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white shadow-md">
                      {pendingBookings?.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => router.push("/dashboard/hod/approval")}
                    className="gap-2 shadow-md hover:shadow-lg transition-all bg-linear-to-r from-primary to-primary/80"
                  >
                    <Bell className="h-4 w-4" />
                    View All Requests
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/hod/hall-management")}
                    variant="outline"
                    className="gap-2 hover:bg-muted/80"
                  >
                    <Building2 className="h-4 w-4" />
                    Manage Halls
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/hod/department-management")}
                    variant="outline"
                    className="gap-2 hover:bg-muted/80"
                  >
                    <Users className="h-4 w-4" />
                    Manage Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-3xl font-bold text-balance">{primaryTitle}</h3>
          <p className="text-muted-foreground mt-2">
            {role === UserRole.tech_staff ? "Halls you maintain" : "Your department halls"}
          </p>
        </div>

        {hallsLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Loading halls...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {primaryHalls.map((hall, idx) => (
                <HallCard
                  key={hall.id}
                  hall={hall}
                  idx={idx}
                  getStatusColor={getStatusColor}
                  onClick={() => router.push(`/dashboard/halls/${hall.id}`)}
                />
              ))}
            </div>

            {secondaryHalls.length > 0 && (
              <>
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-balance">Other Halls</h3>
                  <p className="text-muted-foreground mt-2">Available halls from other departments</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secondaryHalls.map((hall, idx) => (
                    <HallCard
                      key={hall.id}
                      hall={hall}
                      idx={idx}
                      getStatusColor={getStatusColor}
                      onClick={() => router.push(`/dashboard/halls/${hall.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
function HallCard({ hall, idx, onClick, getStatusColor }: any) {
  return (
    <Card
      className="shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer 
                 border-border/60 hover:border-border group overflow-hidden"
      style={{ animationDelay: `${idx * 40}ms` }}
      onClick={onClick}
    >
      <CardHeader className="border-b border-border/40 pb-3 bg-muted/20">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base font-semibold leading-tight">
              {hall.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {hall.department?.name}
            </CardDescription>
          </div>

          <Badge
            className={`${getStatusColor(hall.status)} text-[11px] font-medium px-2 py-0.5`}
          >
            {hall.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="font-semibold">{hall.seating_capacity}</p>
          </div>

          <div className="rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium truncate">{hall.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {hall.floor && (
            <span>
              Floor: <span className="font-medium text-foreground">{hall.floor}</span>
            </span>
          )}

          {hall.hallTechStaffs?.length > 0 && (
            <span>
              Maintained by{" "}
              <span className="font-medium text-foreground">
                {hall.hallTechStaffs.length}
              </span>{" "}
              staff
            </span>
          )}
        </div>

        {hall.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hall.facilities.slice(0, 3).map((f: string) => (
              <span
                key={f}
                className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {f}
              </span>
            ))}
            {hall.facilities.length > 3 && (
              <span className="text-[11px] text-muted-foreground">
                +{hall.facilities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-end text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View details →
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import {
  Building2,
  Calendar,
  Bell,
  Loader2,
  CalendarDays,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProfile } from "@/hooks/react-query/useUser"
import { useHalls } from "@/hooks/react-query/useHalls"
import { usePendingBookingsForHOD } from "@/hooks/react-query/useBookings"
import { UserRole } from "@/generated/enums"
import { useMemo } from "react"
import { useGetHallForTechStaff } from "@/hooks/react-query/useTechStaff"

export default function Dashboard() {
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(
    userId ?? undefined,
  )
  const { data: halls = [], isLoading: hallsLoading } = useHalls()
  const { data: pendingBookings = [], isLoading: pendingBookingsLoading } =
    usePendingBookingsForHOD(profile?.department_id ?? undefined)

  const { data: hallForTechStaff } = useGetHallForTechStaff(
    profile?.id ?? undefined,
    profile?.roles[0].role === UserRole.tech_staff,
  )

  const role = profile?.roles[0].role

  const {
    primaryHalls,
    secondaryHalls,
    primaryTitle,
  } = useMemo(() => {
    if (!profile) {
      return {
        primaryHalls: halls,
        secondaryHalls: [],
        primaryTitle: "Halls",
      }
    }

    if (role === UserRole.tech_staff) {
      const maintainedIds =
        hallForTechStaff?.map((h: any) => h.hall_id) ?? []

      const primary = halls.filter((h) =>
        maintainedIds.includes(h.id),
      )
      const secondary = halls.filter(
        (h) => !maintainedIds.includes(h.id),
      )

      return {
        primaryHalls: primary,
        secondaryHalls: secondary,
        primaryTitle: "My Maintained Halls",
      }
    }

    if (role === UserRole.hod || role === UserRole.teacher) {
      const primary = halls.filter(
        (h) => h.department_id === profile.department_id,
      )
      const secondary = halls.filter(
        (h) => h.department_id !== profile.department_id,
      )

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

  if (profileLoading || pendingBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-10">
        {/* ---------------- WELCOME ---------------- */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.name}
          </h2>
          <p className="text-lg text-muted-foreground">
            Manage all seminar hall bookings and actions from one place.
          </p>
        </div>

        {/* ---------------- QUICK ACTIONS ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Button
            className="h-28 shadow-md flex flex-col items-start justify-center p-6 rounded-xl"
            onClick={() => router.push("/dashboard/halls")}
          >
            <Building2 className="h-6 w-6 mb-2" />
            Browse All Halls
          </Button>

          {(role === UserRole.hod || role === UserRole.teacher) && (
            <Button
              className="h-28 shadow-md flex flex-col items-start justify-center p-6 rounded-xl"
              onClick={() => router.push("/dashboard/book")}
            >
              <CalendarDays className="h-6 w-6 mb-2" />
              Request Booking
            </Button>
          )}

          <Button
            variant="secondary"
            className="h-28 shadow-md flex flex-col items-start justify-center p-6 rounded-xl"
            onClick={() => router.push("/dashboard/calendar")}
          >
            <Calendar className="h-6 w-6 mb-2" />
            View Calendar
          </Button>

          {role === UserRole.hod && (
            <Button
              variant="outline"
              className="h-28 shadow-md flex flex-col items-start justify-center p-6 rounded-xl"
              onClick={() => router.push("/dashboard/hod/analytics")}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Analytics
            </Button>
          )}
        </div>

        {role === UserRole.hod && (
          <div className="mb-12">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Pending Approvals</CardTitle>
                  {pendingBookings && pendingBookings?.length > 0 && (
                    <Badge variant="destructive">
                      {pendingBookings.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/dashboard/hod/approval")}>
                  View Requests
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold">{primaryTitle}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Other Halls</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryHalls.map((hall, idx) => (
                <HallCard
                  key={hall.id}
                  hall={hall}
                  idx={idx}
                  getStatusColor={getStatusColor}
                  onClick={() =>
                    router.push(`/dashboard/halls/${hall.id}`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}


function HallCard({
  hall,
  idx,
  onClick,
  getStatusColor,
}: any) {
  return (
    <Card
      className="shadow-md hover:shadow-xl cursor-pointer border-border/50"
      style={{ animationDelay: `${idx * 40}ms` }}
      onClick={onClick}
    >
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">{hall.name}</CardTitle>
            <CardDescription>{hall.department?.name}</CardDescription>
          </div>
          <Badge className={getStatusColor(hall.status)}>
            {hall.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-semibold">{hall.seating_capacity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Location</span>
          <span className="font-medium">{hall.location}</span>
        </div>
      </CardContent>
    </Card>
  )
}

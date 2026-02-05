"use client"

import {
  Calendar,
  Loader2,
  Users,
  MapPin,
  ClipboardList,
  Wrench,
  Clock,
  ArrowRight,
  User,
} from "lucide-react"

import { useAuth } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useProfile } from "@/hooks/react-query/useUser"
import { useHall } from "@/hooks/react-query/useHalls"
import { useBookings } from "@/hooks/react-query/useBookings"
import { useGetTechStaffForHall } from "@/hooks/react-query/useTechStaff"
import { useGetMaintenanceRequestsForHall } from "@/hooks/react-query/useMaintance"

import HallImageGallery from "@/components/dashboard/hall/HallImageGallery"
import EquipmentManagement from "@/components/dashboard/hall/EquipmentManagement"
import { ComponentManagement } from "@/components/dashboard/hall/ComponentManagement"
import HallBookingDialog from "@/components/dashboard/booking/HallBookingDialog"

import { UserRole } from "@/generated/enums"

const statusColorMap: Record<string, string> = {
  approved: "bg-green-100 text-green-800 border-green-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  cancelled: "bg-gray-100 text-gray-700 border-gray-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
  ongoing: "bg-purple-100 text-purple-800 border-purple-300",
}

export default function HallDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(userId!)
  const { data: hall, isLoading: hallLoading } = useHall(id)

  /* ---------------- BOOKINGS ---------------- */
  const { data: upcomingBookings = [], isLoading: upcomingLoading } = useBookings({
    hallId: id,
    status: ["approved"],
    limit: 5,
  })

  const { data: previousBookings = [], isLoading: previousLoading } = useBookings({
    hallId: id,
    status: ["completed", "cancelled", "rejected"],
    limit: 10,
  })

  /* ---------------- MAINTENANCE ---------------- */
  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } =
    useGetMaintenanceRequestsForHall(id)

  const { data: techStaff } = useGetTechStaffForHall(profile?.id!, id)

  const [openBooking, setOpenBooking] = useState(false)

  const isTechStaff = profile?.roles.some(
    (r) => r.role === UserRole.tech_staff
  )

  const isAssignedTechStaff = useMemo(() => {
    if (!hall || !profile) return false
    return hall.hallTechStaffs.some(
      (h: any) => h.tech_staff.id === profile.id
    )
  }, [hall, profile])

  /* ================= ONGOING BOOKING LOGIC ================= */

  const now = new Date()

  const ongoingBooking = useMemo(() => {
    return upcomingBookings.find((b: any) => {
      const start = new Date(b.start_time)
      const end = new Date(b.end_time)
      return start <= now && now < end
    }) ?? null
  }, [upcomingBookings])

  const filteredUpcomingBookings = useMemo(() => {
    if (!ongoingBooking) return upcomingBookings
    return upcomingBookings.filter(
      (b: any) => b.id !== ongoingBooking.id
    )
  }, [upcomingBookings, ongoingBooking])

  /* ================= LOAD STATES ================= */

  if (profileLoading || hallLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Hall not found
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{hall.name}</h1>
          <p className="text-muted-foreground">{hall.department?.name}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {hall.status}
        </Badge>
      </div>

      {!isTechStaff && (
        <Button size="lg" onClick={() => setOpenBooking(true)} className="gap-2">
          <Calendar className="h-4 w-4" />
          Book This Hall
        </Button>
      )}

      {isAssignedTechStaff && (
        <Button
          size="lg"
          variant="secondary"
          className="gap-2"
          onClick={() =>
            router.push(`/dashboard/tech-staff/maintenance-request?hall_id=${id}`)
          }
        >
          <Wrench className="h-4 w-4" />
          Add Maintenance Request
        </Button>
      )}

      {ongoingBooking && (
        <Card className="border-purple-200 bg-linear-to-br from-purple-50 to-purple-50/40 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between pb-0">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-600" />
              </div>
              <CardTitle className="text-base font-semibold text-purple-900">
                Current Session
              </CardTitle>
            </div>
            <Badge className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-0.5">
              LIVE
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-bold text-purple-950">
                {ongoingBooking.purpose}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-purple-600 shrink-0" />
                <span>
                  {new Date(ongoingBooking.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} – {new Date(ongoingBooking.end_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <User className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Conducted by {ongoingBooking.teacher.name}</span>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/dashboard/bookings/${ongoingBooking.id}`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium gap-2"
            >
              View Booking Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================= HALL OVERVIEW ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Hall Overview</CardTitle>
          <CardDescription>Administrative and operational details</CardDescription>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Info icon={Users} label="Capacity" value={`${hall.seating_capacity} seats`} />
          <Info icon={MapPin} label="Location" value={hall.location} />
          <Info icon={ClipboardList} label="Department" value={hall.department?.name} />
          <Info
            icon={Users}
            label="HOD"
            value={hall.department?.hod_profile?.name ?? "Not assigned"}
          />

          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Maintained By</p>
            <div className="flex flex-wrap gap-2">
              {hall.hallTechStaffs.map((t: any) => (
                <Badge key={t.id} variant="outline">
                  {t.tech_staff.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= MEDIA & MANAGEMENT ================= */}
      <HallImageGallery hallId={id} canManage={isAssignedTechStaff} coverImage={hall.image_url} />
      <EquipmentManagement hallId={id} canManage={isAssignedTechStaff} />
      <ComponentManagement hallId={id} canManage={isAssignedTechStaff} />

      {/* ================= UPCOMING BOOKINGS ================= */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Bookings
            </CardTitle>
            <CardDescription>Next scheduled sessions</CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.push(`/dashboard/calendar?seminar_hall=${id}`)}
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {upcomingLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filteredUpcomingBookings.length ? (
            <div className="space-y-3">
              {filteredUpcomingBookings.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No upcoming bookings
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= TABS ================= */}
      <Tabs defaultValue="bookings">
        <TabsList className="grid grid-cols-2 w-full sm:w-[420px]">
          <TabsTrigger value="bookings">Booking History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                Completed, cancelled, or rejected bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {previousLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : previousBookings.length ? (
                previousBookings.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  No previous bookings
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>
                Requests raised for this hall
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {maintenanceLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : maintenanceRequests.length ? (
                maintenanceRequests.map((r) => (
                  <div key={r.id} className="p-4 border rounded-xl space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold">{r.title}</p>
                      <Badge variant="outline" className="capitalize">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {r.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Priority: {r.priority} •{" "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  No maintenance requests
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <HallBookingDialog
        open={openBooking}
        onOpenChange={setOpenBooking}
        hallId={id}
        hallName={hall.name}
      />
    </main>
  )
}

/* ================= HELPERS ================= */

function Info({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function BookingRow({ booking }: any) {
  const router = useRouter()

  return (
    <div className="p-4 border rounded-xl flex justify-between items-center gap-4">
      <div>
        <p className="font-semibold text-sm">{booking.purpose}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(booking.booking_date).toLocaleDateString()} •{" "}
          {new Date(booking.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          –{" "}
          {new Date(booking.end_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          by {booking.teacher.name}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={`capitalize ${statusColorMap[booking.status] ?? ""}`}
        >
          {booking.status}
        </Badge>

        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
        >
          View
        </Button>
      </div>
    </div>
  )
}

"use client"

import {
  Calendar,
  Loader2,
  Users,
  MapPin,
  Clock,
  ClipboardList,
  Wrench,
  Package,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProfile } from "@/hooks/react-query/useUser"
import { useHall } from "@/hooks/react-query/useHalls"
import { useBookings } from "@/hooks/react-query/useBookings"
import { useGetTechStaffForHall } from "@/hooks/react-query/useTechStaff"
import { useGetComponentMaintenanceLogs, useGetEquipmentLogs } from "@/hooks/react-query/useEquipments"
import HallImageGallery from "@/components/dashboard/hall/HallImageGallery"
import EquipmentManagement from "@/components/dashboard/hall/EquipmentManagement"
import { ComponentManagement } from "@/components/dashboard/hall/ComponentManagement"
import HallBookingDialog from "@/components/dashboard/booking/HallBookingDialog"
import { useMemo, useState } from "react"

export default function HallDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(userId as string)
  const { data: hall, isLoading: hallLoading } = useHall(id as string)

  const {
    data: upcomingBookings,
    isLoading: upcomingLoading,
    refetch,
  } = useBookings({
    hallId: id,
    status: ["approved"],
    limit: 5,
  })

  const {
    data: previousBookings,
    isLoading: previousLoading,
  } = useBookings({
    hallId: id,
    status: ["completed", "cancelled", "rejected"],
    limit: 10,
  })

  const { data: techStaff, isLoading: techStaffLoading } = useGetTechStaffForHall(profile?.id as string, id)
  const { data: maintenanceLogs } = useGetComponentMaintenanceLogs(id)
  const { data: equipmentLogs } = useGetEquipmentLogs(id)

  const [open, setOpen] = useState(false)

  const canManage = useMemo(() => Boolean(techStaff), [techStaff])

  if (profileLoading || hallLoading || techStaffLoading) {
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">

        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{hall.name}</h1>
            <p className="text-muted-foreground">{hall.department?.name}</p>
          </div>
          <Badge variant="outline" className="capitalize">
            {hall.status}
          </Badge>
        </div>

        <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
          <Calendar className="h-4 w-4" />
          Book This Hall
        </Button>

        <HallImageGallery hallId={id} canManage={canManage} coverImage={hall.image_url} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hall Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Info icon={Users} label="Capacity" value={`${hall.seating_capacity} seats`} />
              <Info icon={MapPin} label="Location" value={hall.location} />
              {hall.description && (
                <p className="text-sm text-muted-foreground">{hall.description}</p>
              )}
            </CardContent>
          </Card>

          <EquipmentManagement hallId={id} canManage={canManage} />
        </div>

        <ComponentManagement hallId={id} canManage={canManage} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
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
              className="text-sm gap-1"
              onClick={() => router.push(`/dashboard/calendar?seminar_hall=${id}`)}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {upcomingLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : upcomingBookings?.length ? (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border rounded-xl flex justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold">{b.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        by {b.teacher.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.booking_date).toLocaleDateString()} •{" "}
                        {new Date(b.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {new Date(b.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/bookings/${b.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                No upcoming bookings
              </p>
            )}
          </CardContent>
        </Card>


        <Tabs defaultValue="booking">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="booking">
              <ClipboardList className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="equipment">
              <Package className="h-4 w-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Previous Bookings</CardTitle>
                <CardDescription>Completed, cancelled, or rejected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {previousLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : previousBookings?.length ? (
                  previousBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 border rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-sm">{b.purpose}</p>
                        <p className="text-xs text-muted-foreground">
                          by {b.teacher.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.booking_date).toLocaleDateString()} •{" "}
                          {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {b.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/bookings/${b.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No previous bookings
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <LogCard logs={equipmentLogs || []} />
          </TabsContent>

          <TabsContent value="maintenance">
            <LogCard logs={maintenanceLogs || []} />
          </TabsContent>
        </Tabs>

      </main>

      <HallBookingDialog
        open={open}
        onOpenChange={setOpen}
        hallId={id}
        hallName={hall.name}
        onSuccess={refetch}
      />
    </div>
  )
}

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

function LogCard({ logs }: { logs: any[] }) {
  return (
    <Card className="mt-4">
      <CardContent className="space-y-3 pt-4">
        {logs.length ? logs.map((l) => (
          <div key={l.id} className="p-4 border rounded-xl">
            <p className="font-semibold">
              {l.component?.name || l.equipment?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(l.created_at).toLocaleDateString()}
            </p>
            {l.notes && (
              <p className="text-xs text-muted-foreground mt-2">{l.notes}</p>
            )}
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center">
            No records available
          </p>
        )}
      </CardContent>
    </Card>
  )
}

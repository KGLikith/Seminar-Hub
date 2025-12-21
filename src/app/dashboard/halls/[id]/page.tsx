"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useProfile } from "@/hooks/react-query/useUser"
import { useAuth } from "@clerk/nextjs"
import { useHall } from "@/hooks/react-query/useHalls"
import { useBookingLogs, useBookings } from "@/hooks/react-query/useBookings"
import { useGetTechStaffForHall } from "@/hooks/react-query/useTechStaff"
import HallImageGallery from "@/components/dashboard/hall/HallImageGallery"
import EquipmentManagement from "@/components/dashboard/hall/EquipmentManagement"
import { useState } from "react"
import HallBookingDialog from "@/components/dashboard/booking/HallBookingDialog"
import { ComponentManagement } from "@/components/dashboard/hall/ComponentManagement"

const HallDetail = () => {
  const { id } = useParams()
  const [date, setDate] = useState<Date>(new Date())
  const router = useRouter()
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ? clerkId : "")
  const { data: hall, isLoading: hallLoading } = useHall(id as string)
  const {
    data: upcomingBookings,
    isLoading: bookingsLoading,
    refetch,
  } = useBookings({
    hallId: id as string,
    dateFrom: date,
    status: ["approved"],
    limit: 5,
  })
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  const { data: techStaff, isLoading: techStaffLoading } = useGetTechStaffForHall(profile?.id, id as string)
  const { data: bookingLogs, isLoading: logsLoading } = useBookingLogs(id as string)

  const handleBookNow = (hallId: string, hallName: string) => {
    setBookingDialogOpen(true)
  }

  const handleBookingSuccess = () => {
    refetch()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      case "booked":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
      case "ongoing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
      case "maintenance":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30"
    }
  }

  if (profileLoading || hallLoading || techStaffLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading hall details...</p>
      </div>
    )
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Hall not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{hall.name}</h1>
              <p className="text-base md:text-lg text-muted-foreground">{hall.department?.name}</p>
            </div>
            <Badge className={`${getStatusColor(hall.status)} font-medium text-sm shrink-0`} variant="outline">
              {hall.status}
            </Badge>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleBookNow(hall.id, hall.name)
            }}
            size="lg"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Book This Hall
          </Button>
        </motion.div>

        {id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6"
          >
            <HallImageGallery
              hallId={id as string}
              canManage={techStaff ? true : false}
              coverImage={hall.image_url}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle>Hall Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seating Capacity</p>
                    <p className="font-semibold text-base">{hall.seating_capacity} seats</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-base">{hall.location}</p>
                  </div>
                </div>
                {hall.description && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{hall.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {id && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <EquipmentManagement hallId={id as string} canManage={techStaff ? true : false} />
            </motion.div>
          )}
        </div>

        {id && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mt-4 md:mt-6"
          >
            <ComponentManagement hallId={id as string} canManage={techStaff ? true : false} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="mt-4 md:mt-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Bookings
              </CardTitle>
              <CardDescription>Scheduled events for this hall</CardDescription>
            </CardHeader>
            {!bookingsLoading ? (
              <CardContent>
                <div className="space-y-3">
                  {upcomingBookings && upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-base mb-1">{booking.purpose}</p>
                          <p className="text-sm text-muted-foreground mb-2">by {booking.teacher.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(booking.start_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(booking.end_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <Badge variant={booking.status === "approved" ? "default" : "secondary"} className="shrink-0">
                          {booking.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming bookings</p>
                  )}
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">Loading upcoming bookings...</p>
              </CardContent>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="mt-4 md:mt-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Activity Logs
              </CardTitle>
              <CardDescription>Recent booking activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookingLogs && bookingLogs.length > 0 ? (
                  bookingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
                    >
                      <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="text-sm font-semibold">{log.action}</p>
                          {log.new_status && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="secondary" className="text-xs font-medium">
                                {log.previous_status} → {log.new_status}
                              </Badge>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {log.performer?.name || "System"} • {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">{log.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No activity logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <HallBookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        hallId={id as string}
        hallName={hall.name}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}

export default HallDetail

"use client"

import { useEffect, useState } from "react"
import { useBookings } from "@/hooks/react-query/useBookings"
import { useHalls } from "@/hooks/react-query/useHalls"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Grid3x3, List, Clock, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"

const Calendar = ({ defaultHallId }: { defaultHallId?: string }) => {
  const router = useRouter()
  const [selectedHall, setSelectedHall] = useState<string>("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"calendar" | "status-overview">("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data: halls = [], isLoading: hallsLoading } = useHalls()
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings({
    hallId: selectedHall === "all" ? undefined : selectedHall,
    dateFrom: startOfMonth(currentMonth),
    dateTo: endOfMonth(currentMonth),
  })

  useEffect(() => {
    if (defaultHallId) setSelectedHall(defaultHallId)
  }, [defaultHallId])

  if (hallsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (halls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No halls available</p>
          </CardContent>
        </Card>
      </div>
    )
  }



  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter)

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter((b) => isSameDay(new Date(b.booking_date), date))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50"
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const getHallStatusOverview = () => {
    return halls.map((hall) => {
      const hallBookings = bookings.filter((b) => b.hall_id === hall.id)
      const statusCounts = {
        approved: hallBookings.filter((b) => b.status === "approved").length,
        pending: hallBookings.filter((b) => b.status === "pending").length,
        completed: hallBookings.filter((b) => b.status === "completed").length,
        rejected: hallBookings.filter((b) => b.status === "rejected").length,
      }
      return { hall, bookings: hallBookings, statusCounts }
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Booking Calendar</h1>
          <p className="text-lg text-muted-foreground">View bookings and availability for seminar halls</p>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 h-11">
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="status-overview" className="gap-2">
                <Grid3x3 className="h-4 w-4" />
                Status Overview
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3 flex-wrap w-full sm:w-auto">
              <Select value={selectedHall} onValueChange={setSelectedHall}>
                <SelectTrigger className="w-full sm:w-64 h-11 rounded-lg border-border/60">
                  <SelectValue placeholder="Select a hall" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Halls</SelectItem>
                  {halls.map((hall) => (
                    <SelectItem key={hall.id} value={hall.id}>
                      {hall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 rounded-lg border-border/60">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="calendar" className="space-y-6 mt-0">
            <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-10 w-10 rounded-lg hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-10 w-10 rounded-lg hover:bg-muted"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Card className="shadow-md border-border/50">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-xl">Monthly Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                          key={day}
                          className="text-center font-semibold text-sm text-primary py-3 rounded-lg bg-primary/5"
                        >
                          {day}
                        </div>
                      ))}

                      {monthDays.map((day, idx) => {
                        const dayBookings = getBookingsForDate(day)
                        const isToday = isSameDay(day, new Date())
                        const isCurrentMonth = isSameMonth(day, currentMonth)

                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "approved":
                              return "bg-emerald-500"
                            case "completed":
                              return "bg-blue-500"
                            case "pending":
                              return "bg-amber-500"
                            case "rejected":
                              return "bg-red-500"
                            default:
                              return "bg-gray-400"
                          }
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() => isCurrentMonth && setSelectedDate(day)}
                            className={`
                              min-h-28 p-3 border rounded-lg transition-all hover:shadow-md hover:border-primary/50 cursor-pointer flex flex-col justify-between
                              ${!isCurrentMonth ? "opacity-40 bg-muted/30" : "bg-card"}
                              ${isToday ? "border-2 border-primary shadow-sm ring-2 ring-primary/20" : "border-border/50"}
                            `}
                          >
                            <div className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                              {format(day, "d")}
                            </div>

                            {dayBookings.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {dayBookings.slice(0, 4).map((booking, i) => (
                                  <div
                                    key={i}
                                    className={`h-2 w-2 rounded-full ${getStatusColor(booking.status)} hover:h-3 hover:w-3 transition-all`}
                                    title={`${booking.purpose} - ${format(new Date(booking.start_time), "HH:mm")}`}
                                  />
                                ))}
                                {dayBookings.length > 4 && (
                                  <div className="text-xs text-muted-foreground font-medium ml-1">
                                    +{dayBookings.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border/50">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <List className="h-5 w-5 text-primary" />
                      Bookings for {format(currentMonth, "MMMM yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-1">
                    <div className="space-y-3">
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, idx) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center cursor-pointer justify-between gap-4 p-4 border border-border/50 rounded-xl hover:shadow-md hover:border-primary/50 transition-all bg-card"
                            style={{ animationDelay: `${idx * 30}ms` }}
                            onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                          >
                            {/* LEFT CONTENT */}
                            <div className="flex-1 space-y-2">
                              {/* PURPOSE */}
                              <p className="font-semibold text-base text-foreground leading-tight">
                                {booking.purpose}
                              </p>

                              {/* HALL INFO */}
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <span className="font-medium">{booking.hall.name}</span>
                                {booking.hall.location && (
                                  <>
                                    <span className="opacity-60">•</span>
                                    <span>{booking.hall.location}</span>
                                  </>
                                )}
                              </div>

                              {/* META ROW */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {booking.teacher.name}
                                </span>

                                <span className="opacity-60">•</span>

                                <span>
                                  {format(new Date(booking.booking_date), "MMM d, yyyy")}
                                </span>

                                <span className="opacity-60">•</span>

                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {format(new Date(booking.start_time), "HH:mm")} –{" "}
                                  {format(new Date(booking.end_time), "HH:mm")}
                                </span>
                              </div>
                            </div>

                            {/* STATUS */}
                            <Badge
                              className={`self-start sm:self-center ${getStatusColor(
                                booking.status
                              )} border font-semibold`}
                            >
                              {booking.status}
                            </Badge>
                          </div>

                        ))
                      ) : (
                        <div className="text-center py-16">
                          <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No bookings for this month</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="status-overview" className="space-y-6 mt-0">
            <Card className="shadow-md border-border/50">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Grid3x3 className="h-5 w-5 text-primary" />
                  All Halls Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getHallStatusOverview().map((item) => (
                    <Card
                      key={item.hall.id}
                      className="border-border/50 hover:shadow-lg hover:border-primary/50 transition-all"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{item.hall.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.hall.department?.name}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Approved</span>
                          <Badge className="bg-emerald-600 text-white">{item.statusCounts.approved}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</span>
                          <Badge className="bg-amber-600 text-white">{item.statusCounts.pending}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Completed</span>
                          <Badge className="bg-blue-600 text-white">{item.statusCounts.completed}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">Rejected</span>
                          <Badge className="bg-red-600 text-white">{item.statusCounts.rejected}</Badge>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            Total bookings:{" "}
                            <span className="font-semibold text-foreground">{item.bookings.length}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedDate && (
          <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0 flex flex-col">

              {/* ===== FIXED HEADER ===== */}
              <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    {format(selectedDate, "EEEE, MMM d, yyyy")}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* ===== SCROLLABLE BODY ===== */}
              <div className="px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent space-y-3">

                {getBookingsForDate(selectedDate).length > 0 ? (
                  getBookingsForDate(selectedDate).map((booking) => (
                    <Card
                      key={booking.id}
                      className="border-border/50 hover:shadow-sm transition"
                    >
                      <CardContent className="p-4 pt-2 pb-0 space-y-3">

                        {/* TOP ROW */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {booking.purpose}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {booking.hall.name}
                            </p>
                          </div>

                          <Badge
                            className={`${getStatusColor(
                              booking.status
                            )} text-xs capitalize`}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        {/* DETAILS GRID */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Teacher</p>
                            <p className="font-medium">{booking.teacher.name}</p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium">
                                {format(new Date(booking.start_time), "HH:mm")} –{" "}
                                {format(new Date(booking.end_time), "HH:mm")}
                              </span>
                            </div>
                          </div>

                          {booking.expected_participants && (
                            <div>
                              <p className="text-muted-foreground">Participants</p>
                              <p className="font-medium">
                                {booking.expected_participants}
                              </p>
                            </div>
                          )}

                          {booking.hall.department && (
                            <div>
                              <p className="text-muted-foreground">Department</p>
                              <p className="font-medium">
                                {booking.hall.department.name}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          {booking.approved_at ? (
                            <p className="text-[11px] text-muted-foreground">
                              Approved on{" "}
                              {format(
                                new Date(booking.approved_at),
                                "MMM d, yyyy • HH:mm"
                              )}
                            </p>
                          ) : (
                            <span />
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/dashboard/bookings/${booking.id}`)
                            }
                          >
                            View Booking
                          </Button>
                        </div>

                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No bookings on this date
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

      </main>
    </div>
  )
}

export default Calendar

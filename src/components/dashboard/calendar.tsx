"use client"

import { useState } from "react"
import { useBookings } from "@/hooks/react-query/useBookings"
import { useHalls } from "@/hooks/react-query/useHalls"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"

const Calendar = () => {
  const navigate = useRouter()
  const [selectedHall, setSelectedHall] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: halls = [], isLoading: hallsLoading } = useHalls()
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings({
    hallId: selectedHall,
    dateFrom: startOfMonth(currentMonth),
    dateTo: endOfMonth(currentMonth),
  })

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

  if (!selectedHall) {
    setSelectedHall(halls[0].id)
  }

  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter)

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter((b) => isSameDay(new Date(b.booking_date), date))
  }

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
      case "completed":
        return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
      case "pending":
        return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
      default:
        return "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/30">
      <header className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-2">Booking Calendar</h1>
          <p className="text-lg text-muted-foreground">View bookings and availability for seminar halls</p>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap items-center">
          <Select value={selectedHall} onValueChange={setSelectedHall}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select a hall" />
            </SelectTrigger>
            <SelectContent>
              {halls.map((hall) => (
                <SelectItem key={hall.id} value={hall.id}>
                  {hall.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-64">
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

        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Bookings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}

                  {monthDays.map((day, idx) => {
                    const dayBookings = getBookingsForDate(day)
                    const isToday = isSameDay(day, new Date())

                    return (
                      <div
                        key={idx}
                        className={`
                          min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors
                          ${!isSameMonth(day, currentMonth) ? "opacity-50" : ""}
                          ${isToday ? "border-primary border-2" : ""}
                        `}
                      >
                        <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map((booking) => (
                            <div
                              key={booking.id}
                              className="text-xs p-1 rounded bg-accent/20 truncate"
                              title={booking.purpose}
                            >
                              {format(new Date(booking.start_time), "HH:mm")}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{dayBookings.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookings for {format(currentMonth, "MMMM yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, idx) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{booking.purpose}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.teacher.name} • {format(new Date(booking.booking_date), "MMM d")} •{" "}
                            {format(new Date(booking.start_time), "HH:mm")} -{" "}
                            {format(new Date(booking.end_time), "HH:mm")}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No bookings for this month</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

export default Calendar

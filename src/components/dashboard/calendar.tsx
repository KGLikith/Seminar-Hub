"use client"

import { useState, useMemo, useEffect } from "react"
import { useBookings } from "@/hooks/react-query/useBookings"
import { useHalls } from "@/hooks/react-query/useHalls"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  List,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns"

const ALLOWED_STATUSES = ["approved", "completed"] as const

const isOngoingNow = (start: Date, end: Date) => {
  const now = new Date()
  return now >= start && now <= end
}

const heatmapClass = (count: number) => {
  if (count === 0) return "bg-emerald-50 dark:bg-emerald-950/30"
  if (count <= 2) return "bg-amber-50 dark:bg-amber-950/30"
  return "bg-rose-50 dark:bg-rose-950/30"
}

const statusBadge = (status: string) =>
  status === "approved" ? (
    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
      Approved
    </Badge>
  ) : (
    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
      Completed
    </Badge>
  )

export default function Calendar({ defaultHallId }: { defaultHallId?: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedHall, setSelectedHall] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (defaultHallId) {
      setSelectedHall(defaultHallId)
    }
  }, [defaultHallId])

  const { data: halls = [], isLoading: hallsLoading } = useHalls()

  const { data: rawBookings = [], isLoading: bookingsLoading } =
    useBookings({
      hallId: selectedHall === "all" ? undefined : selectedHall,
      dateFrom: startOfMonth(currentMonth),
      dateTo: endOfMonth(currentMonth),
    })

  const bookings = useMemo(() => {
    return rawBookings
      .filter((b) => ALLOWED_STATUSES.includes(b.status as any))
      .sort((a, b) => {
        const d1 = new Date(b.booking_date).getTime()
        const d2 = new Date(a.booking_date).getTime()
        if (d1 !== d2) return d1 - d2
        return (
          new Date(b.start_time).getTime() -
          new Date(a.start_time).getTime()
        )
      })
  }, [rawBookings])

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  })

  const bookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.booking_date), day))

  if (hallsLoading || bookingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Booking Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Approved & completed bookings
            </p>
          </div>

          <Select value={selectedHall} onValueChange={setSelectedHall}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select hall" />
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
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft />
          </Button>

          <h2 className="text-lg font-medium flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight />
          </Button>
        </div>

        <Card className="mb-10 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((day) => {
                const dayBookings = bookingsForDay(day)

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-40 p-4 rounded-2xl border cursor-pointer transition
                      hover:shadow-lg hover:border-primary/60
                      ${heatmapClass(dayBookings.length)}
                      ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}
                    `}
                  >
                    <div className="text-lg font-bold mb-3">
                      {format(day, "d")}
                    </div>

                    <div className="space-y-2">
                      {dayBookings.slice(0, 3).map((b) => {
                        const live = isOngoingNow(
                          new Date(b.start_time),
                          new Date(b.end_time),
                        )

                        return (
                          <div
                            key={b.id}
                            className="text-sm flex items-center gap-2 truncate"
                          >
                            <Clock className="h-4 w-4" />
                            {format(new Date(b.start_time), "HH:mm")}
                            {live && (
                              <Badge className="bg-red-600 text-white text-xs ml-1">
                                LIVE
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              Schedule — {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {bookings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No bookings for this month
              </p>
            )}

            {bookings.map((b) => {
              const live = isOngoingNow(
                new Date(b.start_time),
                new Date(b.end_time),
              )

              return (
                <div
                  key={b.id}
                  className="flex justify-between items-center border rounded-2xl p-5 hover:shadow-md transition"
                >
                  <div>
                    <p className="text-base font-semibold">{b.purpose}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.hall.name} •{" "}
                      {format(new Date(b.booking_date), "MMM d")} •{" "}
                      {format(new Date(b.start_time), "HH:mm")} –{" "}
                      {format(new Date(b.end_time), "HH:mm")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {statusBadge(b.status)}
                    {live && (
                      <Badge className="bg-red-600 text-white">
                        LIVE
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/bookings/${b.id}`}
                    >
                      View
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "PPP")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {selectedDate &&
              bookingsForDay(selectedDate).map((b) => {
                const live = isOngoingNow(
                  new Date(b.start_time),
                  new Date(b.end_time),
                )

                return (
                  <div
                    key={b.id}
                    className="flex justify-between items-center border rounded-xl p-4"
                  >
                    <div>
                      <p className="font-medium">{b.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        {b.hall.name} •{" "}
                        {format(new Date(b.start_time), "HH:mm")} –{" "}
                        {format(new Date(b.end_time), "HH:mm")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {statusBadge(b.status)}
                      {live && (
                        <Badge className="bg-red-600 text-white">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/dashboard/bookings/${b.id}`
                      }}
                    >
                      View
                    </Button>
                  </div>
                )
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

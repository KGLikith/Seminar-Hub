"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, XCircle, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/react-query/useUser"
import { useAuth } from "@clerk/nextjs"
import { useMyBookings } from "@/hooks/react-query/useBookings"
import { cancelBooking } from "@/actions/booking"
import { Input } from "@/components/ui/input"

const STATUS_CHIPS = ["all", "pending", "approved", "completed", "cancelled", "rejected"] as const
type StatusFilter = (typeof STATUS_CHIPS)[number]

const MyBookings = () => {
  const router = useRouter()
  const { userId } = useAuth()
  const { data: profile } = useProfile(userId ?? undefined)
  const { data: bookings, isLoading } = useMyBookings(profile?.id ?? undefined)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await cancelBooking(bookingId, profile?.user_id || "")
      if (error) throw error
      toast.success("Booking cancelled successfully")
    } catch {
      toast.error("Failed to cancel booking")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      case "pending":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20"
      case "rejected":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "cancelled":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }


  const groupedBookings = useMemo(() => {
    if (!bookings) return {}

    return bookings
      .filter((b) => statusFilter === "all" || b.status === statusFilter)
      .filter((b) =>
        b.hall.name.toLowerCase().includes(search.toLowerCase()),
      )
      .reduce((acc: Record<string, typeof bookings>, booking) => {
        const monthKey = new Date(booking.booking_date).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
        acc[monthKey] = acc[monthKey] || []
        acc[monthKey].push(booking)
        return acc
      }, {})
  }, [bookings, statusFilter, search])

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Bookings</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your booking history
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className="h-8 capitalize"
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hall..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {Object.keys(groupedBookings).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No bookings found
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedBookings).map(([month, list]) => (
          <div key={month} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {month}
            </h2>

            {list.map((booking) => (
              <Card
                key={booking.id}
                className="rounded-lg border-border/60 bg-muted/30 hover:bg-muted/50 transition"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {booking.purpose}
                      </CardTitle>
                      <CardDescription className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.hall.name} • {booking.hall.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(booking.booking_date).toLocaleDateString()} •{" "}
                          {new Date(booking.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </CardDescription>
                    </div>

                    <Badge
                      className={`${getStatusColor(
                        booking.status,
                      )} h-fit px-2.5 py-0.5 text-xs capitalize`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/dashboard/bookings/${booking.id}`,
                        )
                      }
                    >
                      View details
                    </Button>

                    {(booking.status === "pending" ||
                      booking.status === "approved") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel booking?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleCancelBooking(booking.id)
                              }
                              className="bg-rose-600 hover:bg-rose-700"
                            >
                              Cancel booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

export default MyBookings

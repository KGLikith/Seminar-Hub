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
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  MapPin,
  FileText,
  Sparkles,
  XCircle,
  Loader2,
} from "lucide-react"
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
import { useProfile } from "@/hooks/react-query/useUser"
import type { Booking } from "@/generated/client"
import { useAuth } from "@clerk/nextjs"
import { useMyBookings } from "@/hooks/react-query/useBookings"
import { addBookingSummary, cancelBooking } from "@/actions/booking"
import { useQueryClient } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_ORDER = [
  "approved",
  "pending",
  "completed",
  "rejected",
  "cancelled",
] as const

type StatusFilter = "all" | (typeof STATUS_ORDER)[number]

const MyBookings = () => {
  const { userId } = useAuth()
  const { data: profile } = useProfile(userId ?? undefined)
  const { data: bookings, isLoading } = useMyBookings(profile?.id ?? undefined)

  const queryClient = useQueryClient()

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [summaryText, setSummaryText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest")

  const now = new Date()

  /* ---------- helpers ---------- */

  const isSessionOver = (b: Booking) => now >= new Date(b.end_time)
  const isUpcoming = (b: Booking) => now < new Date(b.start_time)

  const canCancel = (b: Booking) =>
    (b.status === "pending" || b.status === "approved") && isUpcoming(b)

  const canAddSummary = (b: Booking) =>
    (b.status === "approved" || b.status === "completed") && isSessionOver(b)

  /* ---------- sorting + filtering ---------- */

  const sortedBookings = useMemo(() => {
    if (!bookings) return []

    let list = [...bookings]

    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter)
    }

    list.sort((a, b) => {
      const statusDiff =
        STATUS_ORDER.indexOf(a.status) -
        STATUS_ORDER.indexOf(b.status)

      if (statusDiff !== 0) return statusDiff

      const dateA = new Date(a.start_time).getTime()
      const dateB = new Date(b.start_time).getTime()

      return dateSort === "newest" ? dateB - dateA : dateA - dateB
    })

    return list
  }, [bookings, statusFilter, dateSort])

  /* ---------- actions ---------- */

  const handleCancelBooking = async (booking: Booking) => {
    if (!profile || !canCancel(booking)) return

    try {
      await cancelBooking(booking.id, profile.id)
      queryClient.invalidateQueries({ queryKey: ["myBookings", profile.id] })
      toast.success("Booking cancelled")
    } catch {
      toast.error("Failed to cancel booking")
    }
  }

  const submitSummary = async () => {
    if (!selectedBooking || !summaryText.trim()) return

    setSubmitting(true)
    try {
      await addBookingSummary(selectedBooking.id, summaryText.trim(), null)
      queryClient.invalidateQueries({ queryKey: ["myBookings", profile?.id] })
      toast.success("Summary saved")
      setSelectedBooking(null)
      setSummaryText("")
    } catch {
      toast.error("Failed to save summary")
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------- UI ---------- */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold">My Bookings</h1>
            <p className="text-sm text-muted-foreground">
              Track bookings and add session summaries
            </p>
          </div>

          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateSort} onValueChange={(v) => setDateSort(v as any)}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {sortedBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No bookings found
              </CardContent>
            </Card>
          ) : (
            sortedBookings.map((booking) => (
              <Card key={booking.id} className="rounded-lg">
                <CardHeader className="pb-3">
                  <div className="flex justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {booking.purpose}
                      </CardTitle>
                      <CardDescription className="text-sm space-y-1">
                        <div className="flex gap-2">
                          <MapPin className="h-4 w-4" />
                          {booking.hall.name} – {booking.hall.location}
                        </div>
                        <div className="flex gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.start_time).toLocaleString()}
                        </div>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {booking.status}
                      </Badge>

                      {canCancel(booking) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <XCircle className="h-4 w-4" />
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
                                onClick={() => handleCancelBooking(booking)}
                              >
                                Cancel booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {booking.session_summary ? (
                    <div className="text-sm text-muted-foreground">
                      {booking.session_summary}
                    </div>
                  ) : canAddSummary(booking) ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setSummaryText("")
                      }}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Add Summary
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Summary dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Session Summary</DialogTitle>
            <DialogDescription className="text-sm">
              Describe what happened during the session
            </DialogDescription>
          </DialogHeader>

          <Textarea
            rows={8}
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            className="text-sm"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitSummary}
              disabled={submitting || !summaryText.trim()}
              size="sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MyBookings

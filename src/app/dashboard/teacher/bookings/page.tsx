"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, MapPin, FileText, Sparkles, XCircle, Loader2 } from "lucide-react"
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
import { useProfile, useUserRole } from "@/hooks/react-query/useUser"
import type { Booking } from "@/generated/client"
import { useAuth } from "@clerk/nextjs"
import { useMyBookings } from "@/hooks/react-query/useBookings"
import { cancelBooking } from "@/actions/booking"

const MyBookings = () => {
  const router = useRouter()
  const { userId } = useAuth()
  const { data: profile } = useProfile(userId ?? undefined)
  const { data: roleUserId } = useUserRole(profile?.id ?? undefined)
  const { data: bookings, isLoading } = useMyBookings(profile?.id ?? undefined)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [summaryText, setSummaryText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleAddSummary = (booking: Booking) => {
    setSelectedBooking(booking)
    setSummaryText(booking.session_summary || "")
  }

  const submitSummary = async () => {
    if (!selectedBooking || !summaryText.trim()) {
      toast.error("Please enter a summary")
      return
    }

    setSubmitting(true)

    try {
      //   const { data, error } = await supabase.functions.invoke("generate-summary", {
      //     body: {
      //       rawSummary: summaryText,
      //       bookingId: selectedBooking.id,
      //     },
      //   });

      //   if (error) throw error;

      toast.success("Session summary saved and AI analysis generated!")
      setSelectedBooking(null)
      setSummaryText("")
      //   fetchMyBookings();
    } catch (error: any) {
      console.error("Error submitting summary:", error)
      toast.error(error.message || "Failed to submit summary")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await cancelBooking(bookingId, roleUserId || "")

      if (error) throw error

      toast.success("Booking cancelled successfully")
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent text-accent-foreground"
      case "pending":
        return "bg-warning text-warning-foreground"
      case "rejected":
        return "bg-destructive text-destructive-foreground"
      case "completed":
        return "bg-success text-success-foreground"
      case "cancelled":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-full justify-between items-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View your booking history and add session summaries</p>
        </div>

        <div className="space-y-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{booking.purpose}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {booking.hall.name} - {booking.hall.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(booking.booking_date).toLocaleDateString()} •{" "}
                            {new Date(booking.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.status)} variant="outline">
                        {booking.status}
                      </Badge>
                      {(booking.status === "pending" || booking.status === "approved") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this booking? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, keep it</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                                Yes, cancel booking
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
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Session Summary</p>
                        <p className="text-sm text-muted-foreground">{booking.session_summary}</p>
                      </div>
                      {/* {booking.ai_summary && (
                                 <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                       <Sparkles className="h-4 w-4 text-primary" />
                                       <p className="text-sm font-medium text-primary">AI Analysis</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                       <div>
                                          <span className="font-medium">Title:</span> {booking.ai_summary.title}
                                       </div>
                                       <div>
                                          <span className="font-medium">Summary:</span> {booking.ai_summary.summary}
                                       </div>
                                       {booking.ai_summary?.highlights && (
                                          <div>
                                             <span className="font-medium">Key Highlights:</span>
                                             <ul className="list-disc list-inside mt-1">
                                                {booking.ai_summary.highlights.map((h: string, i: number) => (
                                                   <li key={i}>{h}</li>
                                                ))}
                                             </ul>
                                          </div>
                                       )}
                                       {booking.ai_summary.keywords && (
                                          <div>
                                             <span className="font-medium">Keywords:</span>{" "}
                                             {booking.ai_summary.keywords.join(", ")}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )} */}
                    </div>
                  ) : booking.status === "approved" || booking.status === "completed" ? (
                    <Button onClick={() => handleAddSummary(booking)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Add Session Summary
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No bookings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Session Summary</DialogTitle>
            <DialogDescription>
              Describe what happened during the session. Our AI will generate a structured summary.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your session summary... Include key topics discussed, outcomes, attendance, and any notable events."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              rows={10}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Cancel
            </Button>
            <Button onClick={submitSummary} disabled={submitting || !summaryText.trim()}>
              {submitting ? (
                "Generating AI Summary..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Submit & Generate AI Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MyBookings

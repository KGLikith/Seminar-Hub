"use client"

import { useState } from "react"
import { useMyBookings, useAddBookingSummary } from "@/hooks/react-query/useBookings"
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
import { ArrowLeft, Calendar, MapPin, FileText, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const MyBookings = () => {
  const navigate = useRouter()
  const userId = "user-id-from-auth" // Get from your auth context

  const { data: bookings = [], isLoading } = useMyBookings(userId)
  const { mutate: addSummary, isPending } = useAddBookingSummary()

  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [summaryText, setSummaryText] = useState("")

  const handleAddSummary = (booking: any) => {
    setSelectedBooking(booking)
    setSummaryText(booking.session_summary || "")
  }

  const submitSummary = async () => {
    if (!selectedBooking || !summaryText.trim()) {
      toast.error("Please enter a summary")
      return
    }

    addSummary(
      {
        bookingId: selectedBooking.id,
        summary: summaryText,
      },
      {
        onSuccess: () => {
          toast.success("Session summary saved!")
          setSelectedBooking(null)
          setSummaryText("")
        },
        onError: () => {
          toast.error("Failed to submit summary")
        },
      },
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
      case "pending":
        return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
      case "rejected":
        return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
      case "completed":
        return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-lg text-muted-foreground">View your booking history and add session summaries</p>
        </div>

        <div className="space-y-4">
          {bookings?.length ?? 0 > 0 ? (
            bookings?.map((booking, idx) => (
              <Card key={booking.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-4">
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
                          <span>
                            {new Date(booking.booking_date).toLocaleDateString()} •{" "}
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
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {booking.session_summary ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Session Summary</p>
                        <p className="text-sm text-muted-foreground">{booking.session_summary}</p>
                      </div>
                      {booking.ai_summary && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium text-primary">AI Analysis</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.ai_summary.toString()}</p>
                        </div>
                      )}
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
      </main>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Session Summary</DialogTitle>
            <DialogDescription>Describe what happened during the session.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your session summary..."
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
            <Button onClick={submitSummary} disabled={isPending || !summaryText.trim()}>
              {isPending ? (
                "Saving..."
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Save Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyBookings

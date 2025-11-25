"use client"

import { useState } from "react"
import { useBookings, useApproveBooking, useRejectBooking } from "@/hooks/react-query/useBookings"
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
import { ArrowLeft, Calendar, MapPin, User, FileText, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const HODApproval = () => {
  const navigate = useRouter()
  const userId = "user-id-from-auth" // Get from your auth context

  const { data: bookings = [], isLoading } = useBookings({ status: "pending" })
  const { mutate: approveBooking, isPending: approving } = useApproveBooking()
  const { mutate: rejectBooking, isPending: rejecting } = useRejectBooking()

  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleAction = (booking: any, type: "approve" | "reject") => {
    setSelectedBooking(booking)
    setActionType(type)
    setRejectionReason("")
  }

  const confirmAction = async () => {
    if (!selectedBooking || !actionType || !userId) return

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    if (actionType === "approve") {
      approveBooking(
        { bookingId: selectedBooking.id, hodId: userId },
        {
          onSuccess: () => {
            toast.success("Booking approved successfully")
            setSelectedBooking(null)
            setActionType(null)
          },
          onError: () => {
            toast.error("Failed to approve booking")
          },
        },
      )
    } else {
      rejectBooking(
        { bookingId: selectedBooking.id, hodId: userId, reason: rejectionReason },
        {
          onSuccess: () => {
            toast.success("Booking rejected successfully")
            setSelectedBooking(null)
            setActionType(null)
          },
          onError: () => {
            toast.error("Failed to reject booking")
          },
        },
      )
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
          <h1 className="text-4xl font-bold mb-2">Pending Approvals</h1>
          <p className="text-lg text-muted-foreground">Review and approve booking requests for your department</p>
        </div>

        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking, idx) => (
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
                          <User className="h-4 w-4" />
                          <span>Requested by {booking.teacher.name}</span>
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
                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <a
                      href={booking.permission_letter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Permission Letter
                    </a>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => handleAction(booking, "approve")} className="flex-1 min-w-32">
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(booking, "reject")}
                      variant="destructive"
                      className="flex-1 min-w-32"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending bookings to review</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog
        open={!!selectedBooking && !!actionType}
        onOpenChange={() => {
          setSelectedBooking(null)
          setActionType(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Booking" : "Reject Booking"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this booking request?"
                : "Please provide a reason for rejecting this booking request."}
            </DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBooking(null)
                setActionType(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={approving || rejecting || (actionType === "reject" && !rejectionReason.trim())}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {approving || rejecting ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HODApproval

"use client"

import { useEffect, useState } from "react"
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
import { Calendar, MapPin, User, FileText, Check, X } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { useApproveBooking, usePendingBookingsForHOD, useRejectBooking } from "@/hooks/react-query/useBookings"
import type { Booking } from "@/generated/client"
import { useRouter } from "next/navigation"

const HODApproval = () => {
  const { userId: clerkId } = useAuth()
  const router = useRouter()

  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? "")

  const { data: bookings } = usePendingBookingsForHOD(profile?.department?.id)

  const { mutate: approveBooking } = useApproveBooking()
  const { mutate: rejectBooking } = useRejectBooking()

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // 🔹 Permission letter preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (profileLoading) return

    if (!clerkId) {
      toast.error("Not signed in")
      router.push("/auth/sign-in")
      return
    }

    if (profile && profile.roles[0]?.role !== "hod") {
      toast.error("Access denied")
      router.push("/dashboard")
    }
  }, [profile, profileLoading, clerkId, router])

  const handleAction = (booking: Booking, type: "approve" | "reject") => {
    setSelectedBooking(booking)
    setActionType(type)
    setRejectionReason("")
  }

  const confirmAction = async () => {
    if (!selectedBooking || !actionType || !profile?.id) return

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    if (actionType === "approve") {
      approveBooking(
        { bookingId: selectedBooking.id, hodId: profile.id },
        {
          onSuccess: () => {
            toast.success("Booking approved successfully")
            setSelectedBooking(null)
            setActionType(null)
          },
          onError: () => toast.error("Failed to approve booking"),
        },
      )
    } else {
      rejectBooking(
        {
          bookingId: selectedBooking.id,
          hodId: profile.id,
          reason: rejectionReason,
        },
        {
          onSuccess: () => {
            toast.success("Booking rejected successfully")
            setSelectedBooking(null)
            setActionType(null)
          },
          onError: () => toast.error("Failed to reject booking"),
        },
      )
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading pending bookings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Pending Approvals</h1>
          <p className="text-lg text-muted-foreground">Review and approve booking requests for your department</p>
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
                            {booking.hall.name} – {booking.hall.location}
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
                            –{" "}
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

                <CardContent className="space-y-4">
                  {/* Permission Letter */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-transparent"
                    onClick={() => setPreviewUrl(booking.permission_letter_url)}
                  >
                    <FileText className="h-4 w-4" />
                    View Permission Letter
                  </Button>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleAction(booking, "approve")}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleAction(booking, "reject")}>
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

      {/* Approve / Reject Dialog */}
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
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
            />
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
            <Button variant={actionType === "approve" ? "default" : "destructive"} onClick={confirmAction}>
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Permission Letter</DialogTitle>
            <DialogDescription>Uploaded document for booking approval</DialogDescription>
          </DialogHeader>

          <div className="flex-1 w-full h-full border rounded-md overflow-hidden">
            {previewUrl?.endsWith(".pdf") ? (
              <iframe src={previewUrl} className="w-full h-full" title="Permission Letter" />
            ) : (
              <img
                src={previewUrl ? previewUrl : ""}
                alt="Permission Letter"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HODApproval

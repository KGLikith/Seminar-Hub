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
import { Calendar, MapPin, User, FileText, Check, X, Loader2 } from "lucide-react"
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-lg">Loading pending bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 text-balance">Pending Approvals</h1>
          <p className="text-lg text-muted-foreground">Review and approve booking requests for your department</p>
        </div>

        <div className="space-y-6">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card
                key={booking.id}
                className="rounded-xl border-border/60 hover:border-border transition-all duration-200 hover:shadow-lg"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-2xl text-balance leading-tight">{booking.purpose}</CardTitle>
                      <CardDescription className="space-y-2 text-base">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-pretty">
                            {booking.hall.name} – {booking.hall.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span>
                            Requested by <span className="font-medium">{booking.teacher.name}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 capitalize font-medium px-3 py-1 shrink-0">
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Permission Letter */}
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-lg border-border/60 hover:bg-accent/50 h-11 gap-2 bg-transparent"
                    onClick={() => setPreviewUrl(booking.permission_letter_url)}
                  >
                    <FileText className="h-4 w-4" />
                    View Permission Letter
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 rounded-lg h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] transition-transform"
                      onClick={() => handleAction(booking, "approve")}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 rounded-lg h-11 gap-2 bg-rose-600 hover:bg-rose-700 hover:scale-[1.02] transition-transform"
                      onClick={() => handleAction(booking, "reject")}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="rounded-xl border-dashed">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground text-lg">No pending bookings to review</p>
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
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {actionType === "approve" ? "Approve Booking" : "Reject Booking"}
            </DialogTitle>
            <DialogDescription className="text-base">
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
              className="resize-none rounded-lg text-base leading-relaxed"
            />
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBooking(null)
                setActionType(null)
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              className={`rounded-lg ${actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl h-[85vh] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Permission Letter</DialogTitle>
            <DialogDescription className="text-base">Uploaded document for booking approval</DialogDescription>
          </DialogHeader>

          <div className="flex-1 w-full h-full border border-border/60 rounded-xl overflow-hidden bg-muted/30">
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

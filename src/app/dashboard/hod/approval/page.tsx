"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  User,
  FileText,
  Download,
  Users,
  Check,
  X,
  Loader2,
  ArrowUpRight,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import {
  useApproveBooking,
  usePendingBookingsForHOD,
  useRejectBooking,
} from "@/hooks/react-query/useBookings"
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const goToBooking = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`)
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Booking Approvals</h1>
          <p className="text-muted-foreground">Review and approve booking requests</p>
        </div>

        {bookings?.length ? (
          bookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-border/60 hover:shadow-md transition py-2 cursor-pointer"
              onClick={() => goToBooking(booking.id)} // 🔹 ADDED
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{booking.purpose}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // 🔹 ADDED
                          router.push(`/dashboard/halls/${booking.hall.id}`)
                        }}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <MapPin className="h-4 w-4" />
                        {booking.hall.name}
                        <ArrowUpRight className="h-4 w-4 ml-1 text-blue-600" />
                      </button>

                      <a
                        href={`mailto:${booking.teacher.email}`}
                        onClick={(e) => e.stopPropagation()} // 🔹 ADDED
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <User className="h-4 w-4" />
                        {booking.teacher.name}
                        <span className="text-xs text-muted-foreground">
                          ({booking.teacher.email})
                        </span>
                      </a>

                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
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
                  </div>

                  <Badge className="capitalize bg-amber-500/10 text-amber-700">
                    {booking.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {booking.expected_participants && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {booking.expected_participants} participants
                    </span>
                  )}

                  {booking.special_requirements && (
                    <span className="italic">{booking.special_requirements}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation() // 🔹 ADDED
                      setPreviewUrl(booking.permission_letter_url)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    View Letter
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation() // 🔹 ADDED
                      window.open(booking.permission_letter_url, "_blank")
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>

                  <div className="flex-1" />

                  <Button
                    size="sm"
                    disabled={isProcessing}
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={(e) => {
                      e.stopPropagation() // 🔹 ADDED
                      setSelectedBooking(booking)
                      setActionType("approve")
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isProcessing}
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation() // 🔹 ADDED
                      setSelectedBooking(booking)
                      setActionType("reject")
                    }}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No pending booking requests
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default HODApproval

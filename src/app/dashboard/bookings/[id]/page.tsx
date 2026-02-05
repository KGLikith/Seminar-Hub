"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetBookingById } from "@/hooks/react-query/useBookings"
import {
  useApproveBooking,
  useRejectBooking,
} from "@/hooks/react-query/useBookings"
import {
  addBookingSummary,
  addBookingMedia,
  deleteBookingMedia,
} from "@/actions/booking"
import { useProfile } from "@/hooks/react-query/useUser"
import { toast } from "sonner"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Loader2,
  CheckCircle,
  Trash2,
  User,
  Clock,
  Download,
  X,
  FileText,
  ArrowUpRight,
} from "lucide-react"
import { BookingTimeline } from "@/components/dashboard/booking/BookingTimeline"
import { getSignedURL } from "@/actions/aws/s3"
import { UserRole } from "@/generated/enums"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(userId ?? "")
  const { data: booking, isLoading, refetch } = useGetBookingById(id)

  const { mutate: approveBooking, isPending: approving } = useApproveBooking()
  const { mutate: rejectBooking, isPending: rejecting } = useRejectBooking()

  const [summary, setSummary] = useState("")
  const [savingSummary, setSavingSummary] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showLetter, setShowLetter] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoadingReport, setIsLoadingReport] = useState(false)

  if (isLoading || profileLoading || !booking || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  /* ---------------- AUTH CHECKS ---------------- */
  const isTeacher = booking.teacher_id === profile.id
  const isStaff = booking.hall.hallTechStaffs?.some(
    (s) => s.tech_staff_id === profile.id
  )

  const isCompleted = booking.status === "completed"
  const isPending = booking.status === "pending"

  const isAuthorizedHod =
    profile.roles.some((r) => r.role === UserRole.hod) &&
    profile.id === booking.hall.department.hod_id

  const canEditSummary = isTeacher && isCompleted
  const canManageMedia = (isTeacher || isStaff) && isCompleted

  /* ---------------- ACTIONS ---------------- */
  async function saveSummary() {
    if (!summary.trim() || !canEditSummary || !booking?.id) return

    setSavingSummary(true)
    try {
      await addBookingSummary(booking.id, summary.trim(), null)
      toast.success("Summary saved")
      setSummary("")
      refetch()
    } catch {
      toast.error("Failed to save summary")
    } finally {
      setSavingSummary(false)
    }
  }

  async function uploadToS3(file: File, signedUrl: string) {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })
    if (!res.ok) throw new Error("Upload failed")
    return signedUrl.split("?")[0]
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!canManageMedia || !booking?.id || !profile?.id) return

    try {
      setUploading(true)
      const files = Array.from(e.target.files ?? [])

      for (const file of files) {
        const signedUrl = await getSignedURL(
          file.type,
          file.name,
          booking.id,
          "booking_image"
        )
        const publicUrl = await uploadToS3(file, signedUrl)
        await addBookingMedia(booking.id, publicUrl, profile?.id as string)
      }

      toast.success("Images uploaded")
      refetch()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function removeMedia(mediaId: string) {
    await deleteBookingMedia(mediaId)
    toast.success("Media removed")
    refetch()
  }

  const downloadReport = async () => {
    setIsLoadingReport(true)
    const res = await fetch(`/api/bookings/${booking.id}/report`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `booking-${booking.id}.pdf`
    a.click()
    setIsLoadingReport(false)
  }

  const handleApprove = () => {
    approveBooking(
      { bookingId: booking.id, hodId: profile.id },
      {
        onSuccess: () => {
          toast.success("Booking approved")
          refetch()
        },
        onError: () => toast.error("Approval failed"),
      }
    )
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason required")
      return
    }

    rejectBooking(
      {
        bookingId: booking.id,
        hodId: profile.id,
        reason: rejectionReason,
      },
      {
        onSuccess: () => {
          toast.success("Booking rejected")
          setShowRejectDialog(false)
          setRejectionReason("")
          refetch()
        },
        onError: () => toast.error("Rejection failed"),
      }
    )
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{booking.purpose}</h1>
            <p className="text-sm text-muted-foreground">Booking details</p>
          </div>

          {isCompleted && (
            <Button variant="outline" size="sm" onClick={downloadReport}>
              {isLoadingReport ? "Generating..." : "Download Report"}
            </Button>
          )}
        </div>

        {/* HOD APPROVAL CARD */}
        {isAuthorizedHod && isPending && (
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-700">
                HOD Approval Required
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => setShowLetter(true)} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Letter
              </Button>

              <Button
                onClick={() =>
                  window.open(booking.permission_letter_url, "_blank")
                }
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <div className="flex-1" />

              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleApprove}
                disabled={approving}
              >
                Approve
              </Button>

              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={rejecting}
              >
                Reject
              </Button>
            </CardContent>
          </Card>
        )}

        {/* BOOKING INFO */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Info
              icon={MapPin}
              label="Hall"
              value={
                <button
                  onClick={() =>
                    router.push(`/dashboard/halls/${booking.hall.id}`)
                  }
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {booking.hall.name} • {booking.hall.location}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              }
            />

            <Info
              icon={User}
              label="Booked By"
              value={
                <a
                  href={`mailto:${booking.teacher.email}`}
                  className="text-primary hover:underline"
                >
                  {booking.teacher.name} ({booking.teacher.email})
                </a>
              }
            />

            <Info
              icon={Calendar}
              label="Date"
              value={new Date(booking.booking_date).toLocaleDateString()}
            />

            <Info
              icon={Clock}
              label="Time"
              value={`${new Date(booking.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} – ${new Date(booking.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
            />

            {booking.expected_participants && (
              <Info
                icon={Users}
                label="Participants"
                value={booking.expected_participants.toString()}
              />
            )}
          </CardContent>
        </Card>

        {/* TIMELINE */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTimeline logs={booking.logs} completed={isCompleted} />
          </CardContent>
        </Card>

        {/* MEDIA */}
        <Card>
          <CardHeader>
            <CardTitle>Session Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {booking.media.map((m) => (
                <div key={m.id} className="relative group">
                  <img
                    src={m.url}
                    className="rounded-lg border h-40 w-full object-cover cursor-zoom-in"
                    onClick={() => setPreviewImage(m.url)}
                  />
                  {canManageMedia && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      onClick={() => removeMedia(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {canManageMedia && (
              <label>
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleUpload}
                />
                <Button size="sm" disabled={uploading}>
                  Upload Images
                </Button>
              </label>
            )}
          </CardContent>
        </Card>

        {/* SUMMARY */}
        <Card>
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.session_summary && !canEditSummary && (
              <div className="p-4 rounded-lg bg-muted border">
                <CheckCircle className="inline h-4 w-4 mr-2" />
                {booking.session_summary}
              </div>
            )}

            {canEditSummary && (
              <>
                <Textarea
                  defaultValue={booking.session_summary ?? ""}
                  onChange={(e) => setSummary(e.target.value)}
                />
                <Button onClick={saveSummary} className="mt-3">
                  Save Summary
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PERMISSION LETTER */}
      {showLetter && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setShowLetter(false)}
        >
          <div
            className="bg-white w-[90%] h-[90%] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {booking.permission_letter_url.endsWith(".pdf") ? (
              <iframe
                src={booking.permission_letter_url}
                className="w-full h-full"
              />
            ) : (
              <img
                src={booking.permission_letter_url}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* REJECT DIALOG */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ icon: Icon, label, value }: any) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 text-primary mt-1" />
      <div>
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

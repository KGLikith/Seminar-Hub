"use client"

import React from "react"
import Image from "next/image"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useState, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useGetBookingById } from "@/hooks/react-query/useBookings"
import {
  useApproveBooking,
  useRejectBooking,
} from "@/hooks/react-query/useBookings"

import {
  addBookingSummary,
  addBookingMedia,
  deleteBookingMedia,
  addAiSummary,
} from "@/actions/booking"

import { useProfile } from "@/hooks/react-query/useUser"
import { getSignedURL } from "@/actions/aws/s3"

import { BookingTimeline } from "@/components/dashboard/booking/BookingTimeline"
import { UserRole } from "@/generated/enums"

import { toast } from "sonner"

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Loader2,
  Trash2,
  User,
  Clock,
  Download,
  X,
  FileText,
  ArrowUpRight,
  Plus,
  Mic,
} from "lucide-react"

export default function BookingDetailPage() {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(userId ?? "")
  const { data: booking, isLoading, refetch } = useGetBookingById(id)

  const { mutate: approveBooking, isPending: approving } = useApproveBooking()
  const { mutate: rejectBooking, isPending: rejecting } = useRejectBooking()

  /* ================= STATE ================= */

  const [summary, setSummary] = useState("")
  const [savingSummary, setSavingSummary] = useState(false)
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null)
  const [deletingMedia, setDeletingMedia] = useState(false)

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

  /* ================= PERMISSIONS ================= */

  const isTeacher = booking.teacher_id === profile.id
  const isStaff = booking.hall.hallTechStaffs?.some(
    (s) => s.tech_staff_id === profile.id
  )

  const isCompleted = booking.status === "completed"
  const isPending = booking.status === "pending"
  const isRejected = booking.status === "rejected"

  const isAuthorizedHod =
    profile.roles.some((r) => r.role === UserRole.hod) &&
    profile.id === booking.hall.department.hod_id

  const canEditSummary = isTeacher && isCompleted
  const canManageMedia =
    (isTeacher || isStaff) &&
    (booking.status === "completed")


  /* ================= ACTIONS ================= */

  async function saveSummary() {
    if (!summary.trim() || !booking?.id) return
    setSavingSummary(true)
    try {
      await addBookingSummary(booking.id, summary.trim())
      refetch()
      toast.success("Summary saved successfully")
      setSummary("")
      setShowSummaryDialog(false)
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
        const url = await uploadToS3(file, signedUrl)
        await addBookingMedia(booking.id, url, profile.id)
      }
      toast.success("Images uploaded")
      refetch()
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function handleDeleteMedia() {
    if (!mediaToDelete) return
    setDeletingMedia(true)
    await deleteBookingMedia(mediaToDelete)
    setMediaToDelete(null)
    setDeletingMedia(false)
    refetch()
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !booking?.id) return

    try {
      setAiLoading(true)
      const form = new FormData()
      form.append("audio", file, file.name.replace(/\..+$/, ".mp3"))

      const res = await fetch(
        "https://n8n.charan.systems/webhook/fcabe50d-08cd-474c-9e98-08ca5d40efab",
        { method: "POST", body: form }
      )

      const data = await res.json()
      if (!data?.output) throw new Error("Invalid AI response")

      await addAiSummary(booking.id, data.output)
      refetch()
      toast.success("AI summary added")
    } finally {
      setAiLoading(false)
      e.target.value = ""
    }
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

  const downloadReport = async () => {
    setIsLoadingReport(true)
    const res = await fetch(`/api/bookings/${booking.id}/report`)
    if(res.status == 400) {
      const data = await res.json()
      toast.error("Failed to generate report")
      setIsLoadingReport(false)
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `booking-${booking.id}.pdf`
    a.click()
    setIsLoadingReport(false)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/5">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-balance">{booking.purpose}</h1>
              <p className="text-sm text-muted-foreground mt-1">Booking Reference ID: {booking.id.slice(0, 8)}</p>
            </div>
          </div>

          {booking.status === "completed" && (
            <Button
              onClick={downloadReport}
              disabled={isLoadingReport}
              className="w-full sm:w-auto"
            >
              {isLoadingReport ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          )}
        </div>

        {isRejected && booking.rejection_reason && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <X className="h-5 w-5" />
                Booking Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-2">
                This booking request was rejected for the following reason:
              </p>
              <div className="rounded-md bg-white border border-red-200 p-3 text-sm text-red-900">
                {booking.rejection_reason}
              </div>
            </CardContent>
          </Card>
        )}

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
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTimeline logs={booking.logs} completed={isCompleted} />
          </CardContent>
        </Card>

        {/* MEDIA */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Session Media</CardTitle>
            {canManageMedia && (
              <>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleUpload}
                />

                <Button
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Images
                    </>
                  )}
                </Button>
              </>
            )}
          </CardHeader>
          <CardContent>
            {booking.media.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No media uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {booking.media.map((m) => (
                  <div key={m.id} className="group relative rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                    <img
                      src={m.url || "/placeholder.svg"}
                      alt="Session media"
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewImage(m.url)}
                    />
                    {canManageMedia && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setMediaToDelete(m.id)}
                        disabled={deletingMedia}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AUDIO UPLOAD & AI SUMMARY SECTION */}
        {canEditSummary && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>AI Audio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload an audio file to generate an AI-powered summary of your session.
                </p>

                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.mpeg,audio/mpeg"
                  hidden
                  disabled={aiLoading}
                  onChange={handleAudioUpload}
                />

                <Button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={aiLoading}
                  className="w-full sm:w-auto"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Audio...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Upload Audio Summary
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI SUMMARY DISPLAY */}
        {booking.ai_summary && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                AI Generated Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {(() => {
                try {
                  const parsed =
                    typeof booking.ai_summary === "string"
                      ? JSON.parse(booking.ai_summary)
                      : booking.ai_summary

                  return parsed.output ?? booking.ai_summary
                } catch {
                  return booking.ai_summary
                }
              })()}
            </CardContent>
          </Card>
        )}

        {/* MANUAL SUMMARY */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Session Summary</CardTitle>
            {canEditSummary && !booking.session_summary && (
              <Button
                size="sm"
                onClick={() => setShowSummaryDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Summary
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {booking.session_summary ? (
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {booking.session_summary}
                  </p>
                </div>
                {canEditSummary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSummary(booking.session_summary || "")
                      setShowSummaryDialog(true)
                    }}
                  >
                    Edit Summary
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No summary added yet</p>
                {canEditSummary && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Click "Add Summary" to create one
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* SUMMARY DIALOG */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Session Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Write a detailed summary of your session here..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={savingSummary}
              className="min-h-48"
            />
            <p className="text-xs text-muted-foreground">
              {summary.length} characters
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSummaryDialog(false)
                setSummary("")
              }}
              disabled={savingSummary}
            >
              Cancel
            </Button>
            <Button
              onClick={saveSummary}
              disabled={savingSummary || !summary.trim()}
            >
              {savingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Summary"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LETTER */}
      {showLetter && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowLetter(false)}
        >
          <div
            className="bg-background w-full max-w-4xl h-[90vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {booking.permission_letter_url.endsWith(".pdf") ? (
              <iframe
                src={booking.permission_letter_url}
                className="w-full h-full"
                title="Permission Letter"
              />
            ) : (
              <img
                src={booking.permission_letter_url || "/placeholder.svg"}
                alt="Permission Letter"
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

      {/* PREVIEW IMAGE DIALOG */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="p-0 max-w-4xl">
          <div className="relative bg-black/90 rounded-lg overflow-hidden">
            <img
              src={previewImage ?? ""}
              alt="Image preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE MEDIA DIALOG */}
      <Dialog open={!!mediaToDelete} onOpenChange={() => setMediaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this media? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMediaToDelete(null)}
              disabled={deletingMedia}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMedia}
              disabled={deletingMedia}
            >
              {deletingMedia ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
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

"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetBookingById } from "@/hooks/react-query/useBookings"
import { addBookingSummary, addBookingMedia, deleteBookingMedia } from "@/actions/booking"
import { useProfile } from "@/hooks/react-query/useUser"
import { toast } from "sonner"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  Upload,
  Trash2,
  User,
  Clock,
  Download,
  X,
} from "lucide-react"
import { BookingTimeline } from "@/components/dashboard/booking/BookingTimeline"
import { getSignedURL } from "@/actions/aws/s3"

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useAuth()
  const { data: profile } = useProfile(userId ?? undefined)
  const { data: booking, isLoading, refetch } = useGetBookingById(id)

  const [summary, setSummary] = useState("")
  const [savingSummary, setSavingSummary] = useState(false)
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const isTeacher = booking.teacher_id === profile?.id
  const isStaff = booking.hall.hallTechStaffs?.some(
    (s) => s.tech_staff_id === profile?.id,
  )

  const isCompleted = booking.status === "completed"
  const canEditSummary = isTeacher && isCompleted
  const canManageMedia = (isTeacher || isStaff) && isCompleted

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
    if (!canManageMedia || !profile?.id || !booking?.id) return

    try {
      setUploading(true)
      const files = Array.from(e.target.files ?? [])
      for (const file of files) {
        const signedUrl = await getSignedURL(
          file.type,
          file.name,
          booking.id,
          "booking_image",
        )
        const publicUrl = await uploadToS3(file, signedUrl)
        await addBookingMedia(booking.id, publicUrl, profile.id)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{booking.purpose}</h1>
            <p className="text-sm text-muted-foreground">Booking details</p>
          </div>

          {isCompleted && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={downloadReport}
            >
              {isLoadingReport ? <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </> : <>
                <Download className="h-4 w-4" />
                Download Report
              </>
              }
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Info icon={MapPin} label="Hall" value={`${booking.hall.name} • ${booking.hall.location}`} />
            <Info icon={User} label="Booked By" value={booking.teacher.name} />
            <Info icon={Calendar} label="Date" value={new Date(booking.booking_date).toLocaleDateString()} />
            <Info
              icon={Clock}
              label="Time"
              value={`${new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            />
            {booking.expected_participants && (
              <Info icon={Users} label="Participants" value={booking.expected_participants.toString()} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTimeline logs={booking.logs} completed={isCompleted} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  id="upload"
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <Button
                  onClick={() => document.getElementById("upload")?.click()}
                  disabled={uploading}
                  className="gap-2 shadow-sm hover:shadow-md transition-all"
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Images
                    </>
                  )}
                </Button>
              </label>
            )}
          </CardContent>
        </Card>

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
                <Button onClick={saveSummary} className="mt-3 gap-2">
                  {savingSummary ? <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </> : <>
                    <Sparkles className="h-4 w-4" />
                    Save / Update Summary
                  </>
                  }
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="relative max-w-5xl w-full">
            <img src={previewImage} className="rounded-xl object-contain max-h-[90vh] w-full" />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = previewImage
                  a.download = "booking-image"
                  a.click()
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setPreviewImage(null)}>
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
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

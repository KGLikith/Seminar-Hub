"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/react-query/useUser"
import { useAuth } from "@clerk/nextjs"
import { useHalls } from "@/hooks/react-query/useHalls"
import { getBookingDetailsForHall } from "@/actions/halls"
import { createBooking } from "@/actions/booking"
import { UserRole } from "@/generated/enums"
import { getSignedURL } from "@/actions/aws/s3"
import TimeSlotSelector from "./TimeSlotSelector"

const BookingForm = () => {
  const router = useRouter()
  const { userId: clerkId, isLoaded } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? undefined)
  const { data: halls = [], isLoading: hallsLoading } = useHalls()

  /* ---------- STATE ---------- */
  const [selectedHall, setSelectedHall] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const [purpose, setPurpose] = useState("")
  const [expectedParticipants, setExpectedParticipants] = useState<number>(0)
  const [specialRequirements, setSpecialRequirements] = useState("")

  const [permissionFile, setPermissionFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [availabilityStatus, setAvailabilityStatus] =
    useState<"checking" | "available" | "unavailable" | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  /* ---------- AUTH GUARDS ---------- */
  useEffect(() => {
    if (isLoaded && !profile?.id) router.push("/auth/sign-in")
    if (profileLoading) return
    if (profile?.roles[0].role === UserRole.tech_staff) {
      toast.error("Only teachers and HODs can request bookings")
      router.push("/dashboard")
    }
  }, [profile, profileLoading, isLoaded])

  /* ---------- AVAILABILITY CHECK ---------- */
  useEffect(() => {
    if (selectedHall && bookingDate && startTime && endTime) {
      checkAvailability()
    } else {
      setAvailabilityStatus(null)
    }
  }, [selectedHall, bookingDate, startTime, endTime])

  const checkAvailability = async () => {
    setAvailabilityStatus("checking")
    const { data } = await getBookingDetailsForHall(
      selectedHall,
      new Date(bookingDate),
      startTime,
      endTime
    )
    setAvailabilityStatus(data?.length ? "unavailable" : "available")
  }

  /* ---------- S3 UPLOAD ---------- */
  async function uploadToS3(file: File, signedUrl: string) {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })
    if (!res.ok) throw new Error("Upload failed")
    return signedUrl.split("?")[0]
  }

  const uploadPermissionLetter = async (file: File) => {
    setUploading(true)
    try {
      const signedUrl = await getSignedURL(file.type, file.name, profile!.id, "booking")
      return await uploadToS3(file, signedUrl)
    } catch {
      toast.error("Permission letter upload failed")
      return null
    } finally {
      setUploading(false)
    }
  }

  const combineDateAndTime = (d: string, t: string) => {
    const date = new Date(d)
    const [h, m] = t.split(":").map(Number)
    date.setHours(h, m, 0, 0)
    return date
  }

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      !profile ||
      !permissionFile ||
      !selectedHall ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !purpose ||
      expectedParticipants <= 0
    ) {
      toast.error("Please fill all required fields")
      return
    }

    setLoading(true)
    const permissionUrl = await uploadPermissionLetter(permissionFile)
    if (!permissionUrl) {
      setLoading(false)
      return
    }

    const { error } = await createBooking({
      hallId: selectedHall,
      teacherId: profile.id,
      bookingDate: new Date(bookingDate),
      startTime: combineDateAndTime(bookingDate, startTime),
      endTime: combineDateAndTime(bookingDate, endTime),
      purpose,
      expectedParticipants,
      specialRequirements,
      permissionLetterUrl: permissionUrl,
    })

    setLoading(false)

    if (error) {
      toast.error("Booking failed")
    } else {
      toast.success("Booking request submitted")
      router.push("/dashboard")
    }
  }

  if (profileLoading || hallsLoading) {
    return <Loader2 className="mx-auto mt-20 animate-spin" />
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Request Seminar Hall Booking</CardTitle>
            <CardDescription>HOD approval required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Hall */}
              <div className="space-y-2">
                <Label>Seminar Hall *</Label>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hall" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Time Slot */}
              <TimeSlotSelector
                value={timeSlot}
                onChange={setTimeSlot}
                onTimeChange={(s, e) => {
                  setStartTime(s)
                  setEndTime(e)
                }}
              />

              {timeSlot === "Custom Time" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              )}

              {availabilityStatus && (
                <div className="flex items-center gap-2">
                  {availabilityStatus === "available" && <CheckCircle className="text-green-600" />}
                  {availabilityStatus === "unavailable" && <XCircle className="text-red-600" />}
                  {availabilityStatus === "checking" && <AlertCircle className="animate-pulse" />}
                  <span>{availabilityStatus}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Expected Participants *</Label>
                <Input
                  type="number"
                  value={expectedParticipants}
                  onChange={e => setExpectedParticipants(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Textarea value={purpose} onChange={e => setPurpose(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Special Requirements</Label>
                <Textarea value={specialRequirements} onChange={e => setSpecialRequirements(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Permission Letter *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setPermissionFile(f)
                    setPreviewUrl(URL.createObjectURL(f))
                  }}
                />
              </div>

              {previewUrl && (
                permissionFile?.type === "application/pdf" ?
                  <iframe src={previewUrl} className="w-full h-64 rounded" /> :
                  <img src={previewUrl} className="max-h-64 mx-auto rounded" />
              )}

              <Button
                type="submit"
                disabled={loading || uploading}
                className="w-full"
              >
                {loading ? "Submitting..." : "Submit Booking"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default BookingForm

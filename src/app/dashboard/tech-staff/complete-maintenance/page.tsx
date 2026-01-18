
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { useProfile } from "@/hooks/react-query/useUser"

// import { UserRole } from "@/generated/enums"
import { closeMaintenanceRequest } from "@/actions/component_equipments/maintance"
import { useGetApprovedRequestsByTechStaff } from "@/hooks/react-query/useTechStaff"

export default function MaintenanceCompletePage() {
  const router = useRouter()
  const { userId } = useAuth()

  const { data: profile, isLoading: profileLoading } =
    useProfile(userId!)

  const {
    data: requests,
    isLoading: requestsLoading,
  } = useGetApprovedRequestsByTechStaff(profile?.id!)

  const [requestId, setRequestId] = useState("")
  const [finalStatus, setFinalStatus] =
    useState<"completed" | "stopped">("completed")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!profileLoading && profile?.roles[0]?.role !== "tech_staff") {
      toast.error("Access denied")
      router.push("/dashboard")
    }
  }, [profileLoading, profile])


  const eligibleRequests = useMemo(() => {
    return (
      requests?.filter(
        (r) => r.status === "approved"
      ) ?? []
    )
  }, [requests])
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!requestId) {
      toast.error("Select a maintenance request")
      return
    }

    if (finalStatus === "stopped" && !notes.trim()) {
      toast.error("Notes are required when stopping maintenance")
      return
    }

    setSubmitting(true)

    const res = await closeMaintenanceRequest({
      requestId,
      techStaffId: profile!.id,
      finalStatus,
      notes,
    })

    setSubmitting(false)

    if (res?.error) {
      toast.error(res.error)
      return
    }

    toast.success("Maintenance request closed")
    router.push("/dashboard")
  }

  /* ===================== LOADING ===================== */

  if (profileLoading || requestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto max-w-xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Maintenance Request</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ================= REQUEST ================= */}
            <div className="space-y-2">
              <Label>Maintenance Request</Label>
              <Select
                value={requestId}
                onValueChange={setRequestId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approved request" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleRequests.length ? (
                    eligibleRequests.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title} — {r.hall.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      No approved requests
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ================= FINAL STATUS ================= */}
            <div className="space-y-2">
              <Label>Final Status</Label>
              <Select
                value={finalStatus}
                onValueChange={(v) =>
                  setFinalStatus(v as "completed" | "stopped")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    Completed Successfully
                  </SelectItem>
                  <SelectItem value="stopped">
                    Stopped / Unable to Complete
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ================= NOTES ================= */}
            <div className="space-y-2">
              <Label>
                Notes
                {finalStatus === "stopped" && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea
                placeholder="Work performed / reason for stopping"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* ================= ACTION ================= */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? "Closing Request…"
                : "Close Maintenance Request"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </main>
  )
}

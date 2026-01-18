"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

import { approveMaintenance, rejectMaintenance } from "@/actions/component_equipments/maintance"

import { useProfile } from "@/hooks/react-query/useUser"
import { useGetMaintenanceRequests } from "@/hooks/react-query/useMaintance"

import { UserRole } from "@/generated/enums"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { toast } from "sonner"
import queryclient from "@/client/queryClient"

export default function HodMaintenanceApprovalPage() {
  const { userId } = useAuth()
  const router = useRouter()

  const { data: profile, isLoading: profileLoading } =
    useProfile(userId ?? "")

  const { data, isLoading } =
    useGetMaintenanceRequests(profile?.id as string)

  useEffect(() => {
    if (!profileLoading && profile?.roles[0]?.role !== UserRole.hod) {
      toast.error("Access denied")
      router.push("/dashboard")
    }
  }, [profileLoading, profile, router])

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading maintenance requests…</p>
      </div>
    )
  }

  if (!data?.requests?.length) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No pending maintenance requests
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Maintenance Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve maintenance requests for your department
        </p>
      </header>

      <div className="space-y-6">
        {data.requests.map((r) => (
          <MaintenanceApprovalCard
            key={r.id}
            request={r}
            hodId={profile!.id}
          />
        ))}
      </div>
    </main>
  )
}


function MaintenanceApprovalCard({
  request,
  hodId,
}: {
  request: any
  hodId: string
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await approveMaintenance(request.id, hodId)
    await queryclient.invalidateQueries({
        queryKey: ["maintenance-requests", hodId],
    })
    setLoading(false)
    toast.success("Maintenance request approved")
  }

  async function handleReject() {
    if (!reason.trim()) {
      toast.error("Rejection reason is required")
      return
    }

    setLoading(true)
    await rejectMaintenance(request.id, hodId, reason)
    await queryclient.invalidateQueries({
        queryKey: ["maintenance-requests", hodId],
    })
    setLoading(false)
    toast.success("Maintenance request rejected")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle>{request.title}</CardTitle>
            <CardDescription className="mt-1">
              {request.hall.name} • Requested by {request.techStaff.name}
            </CardDescription>
          </div>

          <Badge variant="outline" className="capitalize">
            {request.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {request.description}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Meta label="Request Type" value={request.request_type} />
          <Meta
            label="Target"
            value={
              request.equipment
                ? `Equipment: ${request.equipment.name}`
                : request.component
                ? `Component: ${request.component.name}`
                : "General (Hall)"
            }
          />
          <Meta
            label="Created At"
            value={new Date(request.created_at).toLocaleDateString()}
          />
          <Meta label="Status" value={request.status} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleApprove}
            disabled={loading}
          >
            Approve
          </Button>

          <Button
            variant="outline"
            onClick={() => setRejecting(!rejecting)}
          >
            Reject
          </Button>
        </div>

        {/* Reject Box */}
        {rejecting && (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              placeholder="Reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              Confirm Rejection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  )
}

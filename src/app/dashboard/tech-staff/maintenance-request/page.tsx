// dashboard/tech-staff/maintenance/page.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { useProfile } from "@/hooks/react-query/useUser"
import { useGetHallForTechStaff } from "@/hooks/react-query/useTechStaff"
import { useEquipmentByHall, useComponentsByHall } from "@/hooks/react-query/useEquipments"

import {
  MaintenancePriority,
  MaintenanceRequestType,
  MaintenanceTarget,
} from "@/generated/enums"

import { createMaintenanceRequest } from "@/actions/user/tech_staff"

export default function TechStaffMaintenancePage() {
  const { userId } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const hallFromQuery = searchParams.get("hall_id")

  const { data: profile } = useProfile(userId!)
  const { data: halls } = useGetHallForTechStaff(profile?.id!, true)

  const [hallId, setHallId] = useState(hallFromQuery ?? "")
  const [requestType, setRequestType] = useState<MaintenanceRequestType>("repair")
  const [target, setTarget] = useState<MaintenanceTarget>("equipment")

  const [equipmentId, setEquipmentId] = useState<string>("")
  const [componentId, setComponentId] = useState<string>("")

  const { data: equipment } = useEquipmentByHall(hallId)
  const { data: components } = useComponentsByHall(hallId)

  const [priority, setPriority] = useState<MaintenancePriority>("medium")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!hallId || !title || !description) {
      toast.error("Please fill all required fields")
      return
    }

    if (target === "equipment" && !equipmentId) {
      toast.error("Select equipment")
      return
    }

    if (target === "component" && !componentId) {
      toast.error("Select component")
      return
    }

    setLoading(true)

    const res = await createMaintenanceRequest({
      hallId,
      techStaffId: profile!.id,
      requestType,
      target,
      priority,
      title,
      description,
      equipmentId: target === "equipment" ? equipmentId : null,
      componentId: target === "component" ? componentId : null,
    })

    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
      return
    }

    toast.success("Maintenance request submitted")
    router.push("/dashboard")
  }

  return (
    <main className="container max-w-xl py-10 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Maintenance Request</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <Label>Hall</Label>
            <Select value={hallId} onValueChange={setHallId}>
              <SelectTrigger>
                <SelectValue placeholder="Select hall" />
              </SelectTrigger>
              <SelectContent>
                {halls?.map(h => (
                  <SelectItem key={h.hall_id} value={h.hall_id}>
                    {h.hall.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Request Type</Label>
            <Select
              value={requestType}
              onValueChange={v => setRequestType(v as MaintenanceRequestType)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(MaintenanceRequestType).map(t => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Target</Label>
            <Select
              value={target}
              onValueChange={v => {
                setTarget(v as MaintenanceTarget)
                setEquipmentId("")
                setComponentId("")
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="component">Component</SelectItem>
              </SelectContent>
            </Select>

            {target === "equipment" && (
              <>
                <Label>Equipment</Label>
                <Select value={equipmentId} onValueChange={setEquipmentId}>
                  <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                  <SelectContent>
                    {equipment?.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {target === "component" && (
              <>
                <Label>Component</Label>
                <Select value={componentId} onValueChange={setComponentId}>
                  <SelectTrigger><SelectValue placeholder="Select component" /></SelectTrigger>
                  <SelectContent>
                    {components?.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={v => setPriority(v as MaintenancePriority)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(MaintenancePriority).map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <Textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />

            <Button disabled={loading} className="w-full">
              Submit Request
            </Button>

          </form>
        </CardContent>
      </Card>
    </main>
  )
}

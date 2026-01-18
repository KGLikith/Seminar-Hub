// dashboard/tech-staff/maintenance/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import {
  Select, SelectTrigger, SelectValue, SelectItem, SelectContent,
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
  EquipmentType,
  ComponentType,
  UserRole,
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
  const [requestType, setRequestType] =
    useState<MaintenanceRequestType>("repair")

  const [equipmentId, setEquipmentId] = useState<string | null>(null)
  const [componentId, setComponentId] = useState<string | null>(null)
  const [newEquipmentType, setNewEquipmentType] =
    useState<EquipmentType | null>(null)
  const [newComponentType, setNewComponentType] =
    useState<ComponentType | null>(null)

  const { data: equipment } = useEquipmentByHall(hallId)
  const { data: components } = useComponentsByHall(hallId)

  const [priority, setPriority] =
    useState<MaintenancePriority>("medium")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    await createMaintenanceRequest({
      hallId,
      techStaffId: profile!.id,
      requestType,
      priority,
      title,
      description,
      equipmentId: requestType !== "new_installation" ? equipmentId : null,
      componentId: requestType !== "new_installation" ? componentId : null,
      newEquipmentType,
      newComponentType,
    })

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
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {halls?.map(h => (
                  <SelectItem key={h.hall_id} value={h.hall_id}>
                    {h.hall.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Request Type</Label>
            <Select onValueChange={v => setRequestType(v as MaintenanceRequestType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(MaintenanceRequestType).map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {requestType === "new_installation" && (
              <>
                <Label>New Equipment Type</Label>
                <Select onValueChange={v => setNewEquipmentType(v as EquipmentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(EquipmentType).map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>New Component Type</Label>
                <Select onValueChange={v => setNewComponentType(v as ComponentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ComponentType).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {requestType !== "new_installation" && (
              <>
                <Label>Equipment</Label>
                <Select onValueChange={setEquipmentId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {equipment?.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Component</Label>
                <Select onValueChange={setComponentId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {components?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Label>Priority</Label>
            <Select onValueChange={v => setPriority(v as MaintenancePriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(MaintenancePriority).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

            <Button disabled={loading} className="w-full">
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

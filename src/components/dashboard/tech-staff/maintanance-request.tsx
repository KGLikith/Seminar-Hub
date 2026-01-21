"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useComponentsByHall, useEquipmentByHall } from "@/hooks/react-query/useEquipments"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import {
  MaintenancePriority,
  MaintenanceRequestStatus,
  MaintenanceRequestType,
  MaintenanceTarget,
} from "@/generated/enums"
import { createMaintenanceRequest } from "@/actions/user/tech_staff"

interface Props {
  hallId: string
}

export function MaintenanceRequestDialog({ hallId }: Props) {
  const { userId } = useAuth()
  const { data: profile } = useProfile(userId ?? undefined)
  const { data: equipment } = useEquipmentByHall(hallId)
  const { data: components } = useComponentsByHall(hallId)

  const [open, setOpen] = useState(false)

  const [form, setForm] = useState<{
    requestType: MaintenanceRequestType
    target: MaintenanceTarget
    componentId: string
    equipmentId: string
    priority: MaintenancePriority
    description: string
    title: string
  }>({
    requestType: MaintenanceRequestType.repair,
    target: MaintenanceTarget.equipment,
    equipmentId: "",
    componentId: "",
    priority: MaintenancePriority.medium,
    title: "",
    description: "",
  })

  async function submit() {
    if (!profile?.id) return toast.error("Not authenticated")

    if (!form.title || !form.description) {
      return toast.error("Title and description required")
    }

    if (form.target === "equipment" && !form.equipmentId) {
      return toast.error("Select equipment")
    }

    if (form.target === MaintenanceTarget.component && !form.componentId) {
      return toast.error("Select component")
    }

    const res = await createMaintenanceRequest({
      hallId,
      techStaffId: profile.id,
      requestType: form.requestType,
      target: form.target,
      priority: form.priority,
      title: form.title,
      description: form.description,
      equipmentId: form.target === "equipment" ? form.equipmentId : null,
      componentId: form.target === "component" ? form.componentId : null,
    })

    if (res?.error) {
      toast.error(res.error)
      return
    }

    toast.success("Maintenance request submitted")
    setOpen(false)
    setForm({
      requestType: MaintenanceRequestType.repair,
      target: MaintenanceTarget.equipment,
      equipmentId: "",
      componentId: "",
      priority: MaintenancePriority.medium,
      title: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Maintenance
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Maintenance Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Request Type</Label>
            <Select
              value={form.requestType}
              onValueChange={(v) =>
                setForm({ ...form, requestType: v as MaintenanceRequestType })
              }
            >
              <SelectTrigger />
              <SelectContent>
                {Object.values(MaintenanceRequestType).map((v) => (
                  <SelectItem key={v} value={v}>
                    {v.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target</Label>
            <Select
              value={form.target}
              onValueChange={(v) =>
                setForm({ ...form, target: v as MaintenanceTarget })
              }
            >
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="component">Component</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.target === "equipment" && (
            <Select
              value={form.equipmentId}
              onValueChange={(v) => setForm({ ...form, equipmentId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {form.target === "component" && (
            <Select
              value={form.componentId}
              onValueChange={(v) => setForm({ ...form, componentId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select component" />
              </SelectTrigger>
              <SelectContent>
                {components?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div>
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) =>
                setForm({ ...form, priority: v as MaintenancePriority })
              }
            >
              <SelectTrigger />
              <SelectContent>
                {Object.values(MaintenancePriority).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            rows={4}
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <Button onClick={submit} className="w-full">
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

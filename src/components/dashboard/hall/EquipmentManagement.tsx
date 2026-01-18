"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit2, Wrench } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { useEquipmentByHall } from "@/hooks/react-query/useEquipments"

import {
  addEquipmentToHall,
  updateEquipmentCondition,
} from "@/actions/component_equipments"
import { EquipmentCondition, EquipmentType } from "@/generated/enums"
import { Equipment } from "@/generated/client"

interface Props {
  hallId: string
  canManage: boolean
}

export default function EquipmentManagement({ hallId, canManage }: Props) {
  const { userId } = useAuth()
  const { data: profile } = useProfile(userId ?? undefined)
  const { data: equipment = [], refetch } = useEquipmentByHall(hallId)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)

  const [form, setForm] = useState<{
    name: string,
    type: EquipmentType,
    condition: EquipmentCondition,
    serial_number: string
  }>({
    name: "",
    type: EquipmentType.projector,
    condition: EquipmentCondition.active,
    serial_number: "",
  })

  const openDialog = (item?: Equipment) => {
    if (item) {
      setEditing(item)
      setForm({
        name: item.name,
        type: item.type,
        condition: item.condition,
        serial_number: item.serial_number || "",
      })
    } else {
      setEditing(null)
      setForm({
        name: "",
        type: EquipmentType.projector,
        condition: EquipmentCondition.active,
        serial_number: "",
      })
    }
    setOpen(true)
  }

  const save = async () => {
    if (!profile?.id) return toast.error("User not authenticated")

    try {
      if (editing) {
        await updateEquipmentCondition({
          equipmentId: editing.id,
          techStaffId: profile.id,
          newCondition: form.condition,
          name: form.name,
          type: form.type,
          serialNumber: form.serial_number || undefined,
          notes: "Equipment updated",
        })
        toast.success("Equipment updated")
      } else {
        await addEquipmentToHall({
          hallId,
          techStaffId: profile.id,
          name: form.name,
          type: form.type,
          condition: form.condition,
          serialNumber: form.serial_number || undefined,
        })
        toast.success("Equipment added")
      }

      setOpen(false)
      refetch()
    } catch (e: any) {
      console.error(e)
      toast.error("Failed to save equipment")
    }
  }

  const badgeColor = (c: EquipmentCondition) =>
    c === "active"
      ? "bg-emerald-500/10 text-emerald-700"
      : c === "under_repair"
        ? "bg-amber-500/10 text-amber-700"
        : "bg-rose-500/10 text-rose-700"

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment
          </CardTitle>
          <CardDescription>
            {canManage ? "Manage hall equipment" : "View equipment"}
          </CardDescription>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {equipment?.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            No equipment added
          </p>
        ) : (
          equipment?.map((e) => (
            <div
              key={e.id}
              className="flex justify-between items-center border rounded-xl p-4"
            >
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {e.type.replace("_", " ")}
                </p>
                {e.serial_number && (
                  <p className="text-xs mt-1">SN: {e.serial_number}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={badgeColor(e.condition)}>
                  {e.condition.replace("_", " ")}
                </Badge>
                {canManage && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openDialog(e)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Equipment" : "Add Equipment"}
            </DialogTitle>
            <DialogDescription>
              Provide equipment details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as EquipmentType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EquipmentType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Condition</Label>
              <Select
                value={form.condition}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    condition: v as EquipmentCondition,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EquipmentCondition).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Serial Number</Label>
              <Input
                value={form.serial_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serial_number: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

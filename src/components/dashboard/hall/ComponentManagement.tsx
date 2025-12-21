"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Wrench, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { useComponentsByHall } from "@/hooks/react-query/useEquipments"
import { createHallComponent, updateHallComponent } from "@/actions/equipments"
import { ComponentStatus, ComponentType } from "@/generated/enums"
import type { HallComponent } from "@/generated/client"

interface ComponentManagementProps {
  hallId: string
  canManage: boolean
}

export const ComponentManagement = ({ hallId, canManage }: ComponentManagementProps) => {
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId || "")
  const { data: components, isLoading, refetch } = useComponentsByHall(hallId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentComponent, setCurrentComponent] = useState<HallComponent | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    type: ComponentType
    status: ComponentStatus
    location: string | null
    installation_date: Date | null
    notes: string | null
  }>({
    name: "",
    type: ComponentType.projector,
    status: ComponentStatus.operational,
    location: "",
    installation_date: new Date(),
    notes: "",
  })

  const handleOpenDialog = (component?: HallComponent) => {
    if (component) {
      setIsEditing(true)
      setCurrentComponent(component)
      setFormData({
        name: component.name,
        type: component.type,
        status: component.status,
        location: component.location || "",
        installation_date: component.installation_date || new Date(),
        notes: component.notes || "",
      })
    } else {
      setIsEditing(false)
      setCurrentComponent(null)
      setFormData({
        name: "",
        type: ComponentType.projector,
        status: ComponentStatus.operational,
        location: "",
        installation_date: new Date(),
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!profile?.id) return

    if (isEditing && currentComponent) {
      const { error } = await updateHallComponent({
        componentId: currentComponent.id,
        userId: profile.id,
        formData: {
          name: formData.name,
          type: formData.type,
          status: formData.status,
          location: formData.location || null,
          installation_date: formData.installation_date || null,
          notes: formData.notes || null,
        },
      })

      if (error) {
        toast.error("Failed to update component")
        console.error(error)
        return
      }

      toast.success("Component updated successfully")
    } else {
      const { error } = await createHallComponent({
        hallId,
        formData: {
          name: formData.name,
          type: formData.type,
          status: formData.status,
          location: formData.location || null,
          installation_date: formData.installation_date || null,
          notes: formData.notes || null,
        },
      })

      if (error) {
        toast.error("Failed to add component")
        console.error(error)
        return
      }

      toast.success("Component added successfully")
    }

    setIsDialogOpen(false)
    refetch()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      case "maintenance_required":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
      case "under_maintenance":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
      case "non_operational":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Wrench className="h-5 w-5 text-primary" />
          Hall Components
        </CardTitle>
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Component" : "Add New Component"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4"></div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {components?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No components added yet</p>
        ) : (
          <div className="space-y-3">
            {components?.map((component, index) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-base">{component.name}</h4>
                      <Badge variant="outline" className={`${getStatusColor(component.status)} font-medium`}>
                        {component.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Type:</span> {component.type.replace(/_/g, " ").toUpperCase()}
                      </p>
                      {component.location && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Location:</span> {component.location}
                        </p>
                      )}
                      {component.installation_date && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Installed:</span>{" "}
                          {new Date(component.installation_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(component)}
                      className="shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

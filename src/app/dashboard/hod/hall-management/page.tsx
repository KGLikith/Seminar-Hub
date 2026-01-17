"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

import { useProfile } from "@/hooks/react-query/useUser"
import { useDepartmentHalls } from "@/hooks/react-query/useHalls"
import { createHall, deleteHall, updateHall } from "@/actions/halls"

import type { SeminarHall } from "@/generated/client"
import { UserRole } from "@/generated/enums"

const HallManagement = () => {
  const router = useRouter()
  const { userId: clerkId } = useAuth()

  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? undefined)

  const {
    data: halls,
    isLoading: hallsLoading,
    refetch: fetchDepartmentAndHalls,
  } = useDepartmentHalls(profile?.department_id ?? undefined)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHall, setEditingHall] = useState<SeminarHall | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hallToDelete, setHallToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    seating_capacity: "",
    description: "",
  })

  useEffect(() => {
    if (profileLoading) return

    if (profile?.roles[0].role !== UserRole.hod) {
      toast.error("Access denied: HOD only")
      router.push("/dashboard")
    }
  }, [profile, profileLoading, router])

  const handleView = (hallId: string) => {
    router.push(`/dashboard/halls/${hallId}`)
  }

  const handleOpenDialog = (hall?: SeminarHall) => {
    if (hall) {
      setEditingHall(hall)
      setFormData({
        name: hall.name,
        location: hall.location,
        seating_capacity: hall.seating_capacity.toString(),
        description: hall.description || "",
      })
    } else {
      setEditingHall(null)
      setFormData({
        name: "",
        location: "",
        seating_capacity: "",
        description: "",
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const departmentId = profile?.department?.id
    if (!departmentId) return

    const capacity = Number.parseInt(formData.seating_capacity)
    if (isNaN(capacity) || capacity <= 0) {
      toast.error("Please enter a valid seating capacity")
      return
    }

    try {
      if (editingHall) {
        const { error } = await updateHall(editingHall.id, {
          name: formData.name,
          location: formData.location,
          seating_capacity: capacity,
          description: formData.description || null,
        })
        if (error) throw error
        toast.success("Hall updated successfully")
      } else {
        const { error } = await createHall({
          name: formData.name,
          location: formData.location,
          seating_capacity: capacity,
          description: formData.description || null,
          department_id: departmentId,
        })
        if (error) throw error
        toast.success("Hall created successfully")
      }

      setDialogOpen(false)
      fetchDepartmentAndHalls()
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to save hall")
    }
  }

  const handleDelete = (hallId: string) => {
    setHallToDelete(hallId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!hallToDelete) return

    try {
      const { error } = await deleteHall(hallToDelete)
      if (error) throw error
      toast.success("Hall deleted successfully")
      fetchDepartmentAndHalls()
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to delete hall")
    } finally {
      setDeleteDialogOpen(false)
      setHallToDelete(null)
    }
  }

  if (profileLoading || hallsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading halls...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              Hall Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Add, edit, view, or remove seminar halls
            </p>
          </div>

          <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add New Hall
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls?.map((hall) => (
            <Card key={hall.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle>{hall.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {hall.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <div className="text-2xl font-bold">{hall.seating_capacity} seats</div>
                </div>

                {hall.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {hall.description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(hall.id)}
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(hall)}
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(hall.id)}
                    className="flex-1 gap-2 text-destructive border-destructive/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingHall ? "Edit Hall" : "Add New Hall"}</DialogTitle>
            <DialogDescription>
              {editingHall
                ? "Update the hall information"
                : "Enter details for the new hall"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Hall Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label>Seating Capacity</Label>
                <Input
                  type="number"
                  value={formData.seating_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, seating_capacity: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.location || !formData.seating_capacity}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {editingHall ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" />
              Delete Hall
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HallManagement

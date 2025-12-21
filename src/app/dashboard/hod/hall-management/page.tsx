"use client"
import { useEffect, useState } from "react"
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
import { Plus, Edit, Trash2, Building2, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import type { SeminarHall } from "@/generated/client"
import { UserRole } from "@/generated/enums"
import { createHall, deleteHall, updateHall } from "@/actions/halls"
import { useDepartmentHalls } from "@/hooks/react-query/useHalls"

const HallManagement = () => {
  const router = useRouter()
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading: profileLoading, refetch } = useProfile(clerkId ?? undefined)
  const {
    data: halls,
    isLoading: hallsLoading,
    refetch: fetchDepartmentAndHalls,
  } = useDepartmentHalls(profile?.department_id ?? undefined)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHall, setEditingHall] = useState<SeminarHall | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    seating_capacity: "",
    description: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hallToDelete, setHallToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (profileLoading) return
    if (profile?.roles[0].role !== UserRole.hod) {
      toast.error("Access denied: HOD only")
      router.push("/dashboard")
      return
    }
  }, [profile, profileLoading])

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
      console.error("Error saving hall:", error)
      toast.error("Failed to save hall: " + error.message)
    }
  }

  const handleDelete = async (hallId: string) => {
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
      console.error("Error deleting hall:", error)
      toast.error("Failed to delete hall: " + error.message)
    }
    setDeleteDialogOpen(false)
    setHallToDelete(null)
  }

  if (hallsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading halls...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-balance">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              Hall Management
            </h1>
            <p className="text-lg text-muted-foreground">Add, edit, or remove seminar halls</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            size="lg"
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Add New Hall
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {halls?.map((hall, idx) => (
            <Card
              key={hall.id}
              className="shadow-md border-border/50 hover:shadow-xl hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">{hall.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {hall.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="p-3 rounded-lg bg-linear-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">Capacity</span>
                  <span className="text-2xl font-bold text-primary">{hall.seating_capacity}</span>
                  <span className="text-sm text-muted-foreground ml-1">seats</span>
                </div>
                {hall.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 p-3 bg-muted/30 rounded-lg">
                    {hall.description}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(hall)}
                    className="flex-1 gap-2 hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(hall.id)}
                    className="flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {halls?.length === 0 && (
          <Card className="shadow-md border-border/50">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-muted-foreground mb-4">No halls found</p>
              <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Your First Hall
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingHall ? "Edit Hall" : "Add New Hall"}</DialogTitle>
            <DialogDescription>
              {editingHall ? "Update the hall information below" : "Enter the details for the new hall"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Hall Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Auditorium"
                className="h-12 rounded-lg border-border/60 focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold">
                  Location *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A, Floor 3"
                  className="h-12 rounded-lg border-border/60 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-sm font-semibold">
                  Seating Capacity *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.seating_capacity}
                  onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })}
                  placeholder="e.g., 100"
                  className="h-12 rounded-lg border-border/60 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the hall..."
                rows={4}
                className="rounded-lg border-border/60 focus:border-primary resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="gap-2">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.location || !formData.seating_capacity}
              className="gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              {editingHall ? "Update" : "Create"} Hall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Delete Hall
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this hall? This action cannot be undone and will remove all associated
              bookings and equipment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Hall
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HallManagement

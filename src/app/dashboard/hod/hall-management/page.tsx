'use client'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { SeminarHall } from "@/generated/client";
import { UserRole } from "@/generated/enums";
import { createHall, deleteHall, updateHall } from "@/actions/halls";
import { useDepartmentHalls } from "@/hooks/react-query/useHalls";

const HallManagement = () => {
   const router = useRouter();
   const { userId: clerkId } = useAuth();
   const { data: profile, isLoading: profileLoading, refetch } = useProfile(clerkId ?? undefined);
   const { data: halls, isLoading: hallsLoading, refetch: fetchDepartmentAndHalls } = useDepartmentHalls(profile?.department_id ?? undefined);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingHall, setEditingHall] = useState<SeminarHall | null>(null);
   const [formData, setFormData] = useState({
      name: "",
      location: "",
      seating_capacity: "",
      description: "",
   });

   useEffect(() => {
      if (profileLoading) return;
      if (profile?.roles[0].role !== UserRole.hod) {
         toast.error("Access denied: HOD only");
         router.push("/dashboard");
         return;
      }
   }, [profile, profileLoading]);

   const handleOpenDialog = (hall?: SeminarHall) => {
      if (hall) {
         setEditingHall(hall);
         setFormData({
            name: hall.name,
            location: hall.location,
            seating_capacity: hall.seating_capacity.toString(),
            description: hall.description || "",
         });
      } else {
         setEditingHall(null);
         setFormData({
            name: "",
            location: "",
            seating_capacity: "",
            description: "",
         });
      }
      setDialogOpen(true);
   };

   const handleSave = async () => {
      const departmentId = profile?.department?.id;
      if (!departmentId) return;

      const capacity = parseInt(formData.seating_capacity);
      if (isNaN(capacity) || capacity <= 0) {
         toast.error("Please enter a valid seating capacity");
         return;
      }

      try {
         if (editingHall) {
            const { error } = await updateHall(editingHall.id, {
               name: formData.name,
               location: formData.location,
               seating_capacity: capacity,
               description: formData.description || null,
            });

            if (error) throw error;
            toast.success("Hall updated successfully");
         } else {
            const { error } = await createHall({
               name: formData.name,
               location: formData.location,
               seating_capacity: capacity,
               description: formData.description || null,
               department_id: departmentId,
            });

            if (error) throw error;
            toast.success("Hall created successfully");
         }

         setDialogOpen(false);
         fetchDepartmentAndHalls();
      } catch (error: any) {
         console.error("Error saving hall:", error);
         toast.error("Failed to save hall: " + error.message);
      }
   };

   const handleDelete = async (hallId: string) => {
      if (!confirm("Are you sure you want to delete this hall?")) return;

      try {
         const { error } = await deleteHall(hallId);
         if (error) throw error;
         toast.success("Hall deleted successfully");
         refetch();
      } catch (error: any) {
         console.error("Error deleting hall:", error);
         toast.error("Failed to delete hall: " + error.message);
      }
   };

   if (hallsLoading || profileLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Loading halls...</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background">
         {/* <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </header> */}

         <main className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
               <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                     <Building2 className="h-10 w-10 text-primary" />
                     Hall Management
                  </h1>
                  <p className="text-lg text-muted-foreground">
                     Add, edit, or remove seminar halls
                  </p>
               </div>
               <Button onClick={() => handleOpenDialog()} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Hall
               </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {halls?.map((hall) => (
                  <Card key={hall.id}>
                     <CardHeader>
                        <CardTitle>{hall.name}</CardTitle>
                        <CardDescription>{hall.location}</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div className="text-sm">
                           <span className="text-muted-foreground">Capacity:</span>{" "}
                           <span className="font-medium">{hall.seating_capacity} seats</span>
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
                              onClick={() => handleOpenDialog(hall)}
                              className="flex-1"
                           >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                           </Button>
                           <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(hall.id)}
                              className="flex-1"
                           >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>

            {halls?.length === 0 && (
               <Card>
                  <CardContent className="py-12 text-center">
                     <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <p className="text-muted-foreground mb-4">No halls found</p>
                     <Button onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Hall
                     </Button>
                  </CardContent>
               </Card>
            )}
         </main>

         {/* Add/Edit Dialog */}
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>
                     {editingHall ? "Edit Hall" : "Add New Hall"}
                  </DialogTitle>
                  <DialogDescription>
                     {editingHall
                        ? "Update the hall information below"
                        : "Enter the details for the new hall"}
                  </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="name">Hall Name *</Label>
                     <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                           setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Main Auditorium"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="location">Location *</Label>
                     <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                           setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g., Building A, Floor 3"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="capacity">Seating Capacity *</Label>
                     <Input
                        id="capacity"
                        type="number"
                        value={formData.seating_capacity}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              seating_capacity: e.target.value,
                           })
                        }
                        placeholder="e.g., 100"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="description">Description</Label>
                     <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                           setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Additional details about the hall..."
                        rows={3}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                     Cancel
                  </Button>
                  <Button
                     onClick={handleSave}
                     disabled={
                        !formData.name ||
                        !formData.location ||
                        !formData.seating_capacity
                     }
                  >
                     {editingHall ? "Update" : "Create"} Hall
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
};

export default HallManagement;

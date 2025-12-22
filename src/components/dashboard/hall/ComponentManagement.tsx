'use client'
import { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { useComponentsByHall } from "@/hooks/react-query/useEquipments";
import { createHallComponent, updateHallComponent } from "@/actions/equipments";
import { ComponentStatus, ComponentType } from "@/generated/enums";
import { HallComponent } from "@/generated/client";

interface ComponentManagementProps {
   hallId: string;
   canManage: boolean;
}

export const ComponentManagement = ({ hallId, canManage }: ComponentManagementProps) => {
   const { userId: clerkId } = useAuth();
   const { data: profile, isLoading: profileLoading } = useProfile(clerkId || "");
   const { data: components, isLoading, refetch } = useComponentsByHall(hallId);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [currentComponent, setCurrentComponent] = useState<HallComponent | null>(null);
   const [formData, setFormData] = useState<{
      name: string;
      type: ComponentType;
      status: ComponentStatus;
      location: string | null;
      installation_date: Date | null;
      notes: string | null;
   }>({
      name: "",
      type: ComponentType.projector,
      status: ComponentStatus.operational,
      location: "",
      installation_date: new Date(),
      notes: "",
   });

   const handleOpenDialog = (component?: HallComponent) => {
      if (component) {
         setIsEditing(true);
         setCurrentComponent(component);
         setFormData({
            name: component.name,
            type: component.type,
            status: component.status,
            location: component.location || "",
            installation_date: component.installation_date || new Date(),
            notes: component.notes || "",
         });
      } else {
         setIsEditing(false);
         setCurrentComponent(null);
         setFormData({
            name: "",
            type: ComponentType.projector,
            status: ComponentStatus.operational,
            location: "",
            installation_date: new Date(),
            notes: "",
         });
      }
      setIsDialogOpen(true);
   };

   const handleSave = async () => {
      if (!profile?.id) return;

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
            toast.error("Failed to update component");
            console.error(error);
            return;
         }

         toast.success("Component updated successfully");
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
            toast.error("Failed to add component");
            console.error(error);
            return;
         }

         toast.success("Component added successfully");
      }

      setIsDialogOpen(false);
      refetch();
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case "operational":
            return "bg-green-500/10 text-green-600 border-green-500/20";
         case "maintenance_required":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
         case "under_maintenance":
            return "bg-blue-500/10 text-blue-600 border-blue-500/20";
         case "non_operational":
            return "bg-red-500/10 text-red-600 border-red-500/20";
         default:
            return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      }
   };

   return (
      <Card>
         <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
               <Wrench className="h-5 w-5" />
               Hall Components
            </CardTitle>
            {canManage && (
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                     <Button size="sm" onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Component
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                     <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Component" : "Add New Component"}</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-4">
                        <div>
                           <Label htmlFor="name">Component Name</Label>
                           <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="e.g., Main Projector"
                           />
                        </div>
                        <div>
                           <Label htmlFor="type">Type</Label>
                           <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ComponentType })}>
                              <SelectTrigger>
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 {Object.values(ComponentType).map((type) => (
                                    <SelectItem key={type} value={type as ComponentType}>
                                       {(type as string).replace(/_/g, " ").toUpperCase()}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                        <div>
                           <Label htmlFor="status">Status</Label>
                           <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as ComponentStatus })}>
                              <SelectTrigger>
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 {Object.values(ComponentStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                       {status.replace(/_/g, " ").toUpperCase()}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                        <div>
                           <Label htmlFor="location">Location (Optional)</Label>
                           <Input
                              id="location"
                              value={formData.location ?? ""}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="e.g., Front wall, ceiling mounted"
                           />
                        </div>
                        <div>
                           <Label htmlFor="installation_date">Installation Date (Optional)</Label>
                           <Input
                              id="installation_date"
                              type="date"
                              value={formData.installation_date ? formData.installation_date.toISOString().split("T")[0] : ""}
                              onChange={(e) => setFormData({ ...formData, installation_date: e.target.value ? new Date(e.target.value) : null })}
                           />
                        </div>
                        <div>
                           <Label htmlFor="notes">Notes (Optional)</Label>
                           <Textarea
                              id="notes"
                              value={formData.notes ?? ""}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              placeholder="Additional notes..."
                           />
                        </div>
                        <div className="flex gap-2">
                           <Button onClick={handleSave} className="flex-1">
                              {isEditing ? "Update" : "Add"} Component
                           </Button>
                           <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                           </Button>
                        </div>
                     </div>
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
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                     >
                        <div className="flex items-start justify-between">
                           <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                 <h4 className="font-medium">{component.name}</h4>
                                 <Badge variant="outline" className={getStatusColor(component.status)}>
                                    {component.status.replace(/_/g, " ")}
                                 </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                 Type: {component.type.replace(/_/g, " ").toUpperCase()}
                              </p>
                              {component.location && (
                                 <p className="text-sm text-muted-foreground">Location: {component.location}</p>
                              )}
                              {component.installation_date && (
                                 <p className="text-sm text-muted-foreground">
                                    Installed: {new Date(component.installation_date).toLocaleDateString()}
                                 </p>
                              )}
                           </div>
                           {canManage && (
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(component)}>
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
   );
};
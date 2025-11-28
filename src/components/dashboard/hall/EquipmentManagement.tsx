import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Wrench } from "lucide-react";
import { useEquipmentByHall } from "@/hooks/react-query/useEquipments";
import {  Equipment, EquipmentCondition, EquipmentType } from "@/generated/client";
import { toast } from "sonner";
import { addEquipmentToHall, updateEquipmentCondition } from "@/actions/equipments";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";

interface EquipmentManagementProps {
   hallId: string;
   canManage: boolean;
}

const EquipmentManagement = ({ hallId, canManage }: EquipmentManagementProps) => {
   const { data: equipment, refetch } = useEquipmentByHall(hallId);
   const { userId } = useAuth();
   const { data: profile, isLoading } = useProfile(userId ?? undefined);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
   const [formData, setFormData] = useState<{
      name: string;
      type: EquipmentType;
      condition: EquipmentCondition;
      serial_number: string;
   }>({
      name: "",
      type: "projector",
      condition: "active",
      serial_number: "",
   });

   const handleOpenDialog = (equip?: Equipment) => {
      if (equip) {
         setEditingEquipment(equip);
         setFormData({
            name: equip.name,
            type: equip.type,
            condition: equip.condition,
            serial_number: equip.serial_number || "",
         });
      } else {
         setEditingEquipment(null);
         setFormData({
            name: "",
            type: "projector",
            condition: "active",
            serial_number: "",
         });
      }
      setDialogOpen(true);
   };

   const handleSave = async () => {
      try {
         if (!userId || !profile?.id) {
            toast.error("User not authenticated");
            return;
         }

         if (editingEquipment) {
            // Log the change
            const { error } = await updateEquipmentCondition({
               equipmentId: editingEquipment.id,
               newCondition: formData.condition as any,
               techStaffId: profile.id,
               name: formData.name,
               type: formData.type,
               serialNumber: formData.serial_number || undefined,
               notes: `Updated equipment: ${formData.name}`,
            })

            if (error) throw error;
            toast.success("Equipment updated successfully");
         } else {
            // Add new equipment
            const { error } = await addEquipmentToHall({
               hallId,
               name: formData.name,
               type: formData.type,
               serialNumber: formData.serial_number || undefined,
               condition: formData.condition,
               techStaffId: profile.id,
            })

            if (error) throw error;
            toast.success("Equipment added successfully");
         }

         setDialogOpen(false);
         refetch();
      } catch (error: any) {
         console.error("Error saving equipment:", error);
         toast.error("Failed to save equipment: " + error.message);
      }
   };

   const getConditionColor = (condition: string) => {
      switch (condition) {
         case "active":
            return "bg-success text-success-foreground";
         case "not_working":
            return "bg-destructive text-destructive-foreground";
         case "under_repair":
            return "bg-warning text-warning-foreground";
         default:
            return "bg-muted text-muted-foreground";
      }
   };

   return (
      <Card>
         <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="flex items-center gap-2">
                     <Wrench className="h-5 w-5" />
                     Equipment Management
                  </CardTitle>
                  <CardDescription>
                     {canManage
                        ? "Manage equipment for this hall"
                        : "View equipment for this hall"}
                  </CardDescription>
               </div>
               {canManage && (
                  <Button onClick={() => handleOpenDialog()} size="sm">
                     <Plus className="h-4 w-4 mr-2" />
                     Add Equipment
                  </Button>
               )}
            </div>
         </CardHeader>
         <CardContent>
            <div className="space-y-3">
               {equipment && equipment.length > 0 ? (
                  equipment.map((item) => (
                     <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                     >
                        <div className="flex-1">
                           <p className="font-medium">{item.name}</p>
                           <p className="text-sm text-muted-foreground">{item.type}</p>
                           {item.serial_number && (
                              <p className="text-xs text-muted-foreground mt-1">
                                 SN: {item.serial_number}
                              </p>
                           )}
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge
                              className={getConditionColor(item.condition)}
                              variant="outline"
                           >
                              {item.condition.replace("_", " ")}
                           </Badge>
                           {canManage && (
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleOpenDialog(item)}
                              >
                                 <Edit className="h-4 w-4" />
                              </Button>
                           )}
                        </div>
                     </div>
                  ))
               ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                     No equipment listed
                  </p>
               )}
            </div>
         </CardContent>

         {/* Add/Edit Dialog */}
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>
                     {editingEquipment ? "Edit Equipment" : "Add New Equipment"}
                  </DialogTitle>
                  <DialogDescription>
                     {editingEquipment
                        ? "Update equipment information"
                        : "Add new equipment to this hall"}
                  </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="eq-name">Equipment Name *</Label>
                     <Input
                        id="eq-name"
                        value={formData.name}
                        onChange={(e) =>
                           setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Projector"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="eq-type">Type *</Label>
                     <Select
                        value={formData.type}
                        onValueChange={(val) => setFormData({ ...formData, type: val as EquipmentType })}
                     >
                        <SelectTrigger id="eq-type">
                           <SelectValue placeholder="Select equipment type" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="projector">Projector</SelectItem>
                           <SelectItem value="whiteboard">Whiteboard</SelectItem>
                           <SelectItem value="speaker">Speaker</SelectItem>
                           <SelectItem value="microphone">Microphone</SelectItem>
                           <SelectItem value="lighting">Lighting</SelectItem>
                           <SelectItem value="ac">AC</SelectItem>
                           <SelectItem value="door_lock">Door Lock</SelectItem>
                           <SelectItem value="wifi_router">Wi-Fi Router</SelectItem>
                           <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="eq-condition">Condition *</Label>
                     <Select
                        value={formData.condition}
                        onValueChange={(value) =>
                           setFormData({ ...formData, condition: value as EquipmentCondition })
                        }
                     >
                        <SelectTrigger id="eq-condition">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="active">Active</SelectItem>
                           <SelectItem value="not_working">Not Working</SelectItem>
                           <SelectItem value="under_repair">Under Repair</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="eq-serial">Serial Number</Label>
                     <Input
                        id="eq-serial"
                        value={formData.serial_number}
                        onChange={(e) =>
                           setFormData({ ...formData, serial_number: e.target.value })
                        }
                        placeholder="Optional"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                     Cancel
                  </Button>
                  <Button
                     onClick={handleSave}
                     disabled={!formData.name || !formData.type}
                  >
                     {editingEquipment ? "Update" : "Add"} Equipment
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </Card>
   );
};

export default EquipmentManagement;

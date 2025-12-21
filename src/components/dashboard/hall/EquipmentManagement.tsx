import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Wrench, Edit2 } from "lucide-react";
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
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      case "not_working":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
      case "under_repair":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30"
    }
  }

   return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Wrench className="h-5 w-5 text-primary" />
              Equipment Management
            </CardTitle>
            <CardDescription className="mt-1">
              {canManage ? "Manage equipment for this hall" : "View equipment for this hall"}
            </CardDescription>
          </div>
          {canManage && (
            <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
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
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base mb-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground capitalize mb-2">{item.type.replace("_", " ")}</p>
                  {item.serial_number && (
                    <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                      SN: {item.serial_number}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getConditionColor(item.condition)} font-medium`} variant="outline">
                    {item.condition.replace("_", " ")}
                  </Badge>
                  {canManage && (
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} className="gap-2">
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No equipment listed</p>
          )}
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
            <DialogDescription>
              {editingEquipment ? "Update equipment information" : "Add new equipment to this hall"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">{/* Form fields go here */}</div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.type}>
              {editingEquipment ? "Update" : "Add"} Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default EquipmentManagement

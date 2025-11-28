import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useComponentsByHall, useEquipmentByHall } from "@/hooks/react-query/useEquipments";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { MaintenanceRequestStatus } from "@/generated/enums";
import { createMaintanaceRequest } from "@/actions/user/tech_staff";

interface MaintenanceRequestDialogProps {
  hallId: string;
}

export const MaintenanceRequestDialog = ({ hallId }: MaintenanceRequestDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userId: clerkId } = useAuth();
  const { data: profile } = useProfile(clerkId || "");
  const { data: equipment, refetch: refetchEquipment } = useEquipmentByHall(hallId);
  const { data: components, refetch: refetchComponents } = useComponentsByHall(hallId);
  const [formData, setFormData] = useState<{
    request_type: string;
    component_id: string;
    equipment_id: string;
    title: string;
    description: string;
    priority: string;
  }>({
    request_type: "repair",
    component_id: "",
    equipment_id: "",
    title: "",
    description: "",
    priority: "medium",
  });

  const handleSubmit = async () => {
    if(!profile?.id) return;
    if (!profile) {
      toast.error("You must be logged in");
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const requestData: any = {
      hall_id: hallId,
      tech_staff_id: profile.id,
      request_type: formData.request_type,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: MaintenanceRequestStatus.pending,
    };

    if (formData.request_type !== "new_equipment" && formData.component_id) {
      requestData.component_id = formData.component_id;
    }

    if (formData.request_type === "repair" && formData.equipment_id) {
      requestData.equipment_id = formData.equipment_id;
    }

    const { error } = await createMaintanaceRequest(requestData);

    if (error) {
      toast.error("Failed to submit maintenance request");
      console.error(error);
      return;
    }

    toast.success("Maintenance request submitted successfully");
    setIsOpen(false);
    setFormData({
      request_type: "repair",
      component_id: "",
      equipment_id: "",
      title: "",
      description: "",
      priority: "medium",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Maintenance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Maintenance Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="request_type">Request Type</Label>
            <Select
              value={formData.request_type}
              onValueChange={(value) => setFormData({ ...formData, request_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">Equipment Repair</SelectItem>
                <SelectItem value="component_maintenance">Component Maintenance</SelectItem>
                <SelectItem value="new_equipment">Request New Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.request_type === "component_maintenance" && (
            <div>
              <Label htmlFor="component_id">Select Component</Label>
              <Select
                value={formData.component_id}
                onValueChange={(value) => setFormData({ ...formData, component_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a component" />
                </SelectTrigger>
                <SelectContent>
                  {components?.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.request_type === "repair" && (
            <div>
              <Label htmlFor="equipment_id">Select Equipment</Label>
              <Select
                value={formData.equipment_id}
                onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment?.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for the request"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue or request..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Submit Request
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
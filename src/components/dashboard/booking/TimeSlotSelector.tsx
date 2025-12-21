import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeSlot {
  label: string;
  startTime: string;
  endTime: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { label: "9:00 AM - 11:00 AM", startTime: "09:00", endTime: "11:00" },
  { label: "11:30 AM - 1:30 PM", startTime: "11:30", endTime: "13:30" },
  { label: "2:30 PM - 4:30 PM", startTime: "14:30", endTime: "16:30" },
  { label: "Custom Time", startTime: "", endTime: "" },
];

interface TimeSlotSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onTimeChange: (startTime: string, endTime: string) => void;
}

const TimeSlotSelector = ({ value, onChange, onTimeChange }: TimeSlotSelectorProps) => {
  const handleSlotChange = (slotLabel: string) => {
    onChange(slotLabel);
    const slot = TIME_SLOTS.find((s) => s.label === slotLabel);
    if (slot && slot.startTime && slot.endTime) {
      onTimeChange(slot.startTime, slot.endTime);
    } else {
      onTimeChange("", "");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="time-slot">Time Slot *</Label>
      <Select value={value} onValueChange={handleSlotChange}>
        <SelectTrigger id="time-slot">
          <SelectValue placeholder="Select a time slot" />
        </SelectTrigger>
        <SelectContent>
          {TIME_SLOTS.map((slot) => (
            <SelectItem key={slot.label} value={slot.label}>
              {slot.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSlotSelector;

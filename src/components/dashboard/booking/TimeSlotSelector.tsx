import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimeSlot {
  label: string
  startTime: string
  endTime: string
}

const TIME_SLOTS: TimeSlot[] = [
  { label: "9:00 AM - 11:00 AM", startTime: "09:00", endTime: "11:00" },
  { label: "11:30 AM - 1:30 PM", startTime: "11:30", endTime: "13:30" },
  { label: "2:30 PM - 4:30 PM", startTime: "14:30", endTime: "16:30" },
  { label: "Custom Time", startTime: "", endTime: "" },
]

interface TimeSlotSelectorProps {
  value: string
  onChange: (value: string) => void
  onTimeChange: (startTime: string, endTime: string) => void
  bookingDate: string
}

const TimeSlotSelector = ({
  value,
  onChange,
  onTimeChange,
  bookingDate,
}: TimeSlotSelectorProps) => {
  const now = new Date()
  const isToday =
    bookingDate === new Date().toISOString().split("T")[0]

  const filteredSlots = TIME_SLOTS.filter((slot) => {
    if (slot.label === "Custom Time") return true
    if (!isToday) return true

    const [h, m] = slot.startTime.split(":").map(Number)
    const slotStart = new Date()
    slotStart.setHours(h, m, 0, 0)

    return slotStart > now
  })

  const handleSlotChange = (slotLabel: string) => {
    onChange(slotLabel)
    const slot = TIME_SLOTS.find((s) => s.label === slotLabel)
    if (slot?.startTime && slot?.endTime) {
      onTimeChange(slot.startTime, slot.endTime)
    } else {
      onTimeChange("", "")
    }
  }

  return (
    <div className="space-y-2">
      <Label>Time Slot *</Label>
      <Select value={value} onValueChange={handleSlotChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a time slot" />
        </SelectTrigger>
        <SelectContent>
          {filteredSlots.map((slot) => (
            <SelectItem key={slot.label} value={slot.label}>
              {slot.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default TimeSlotSelector

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BookingForm from "./BookingForm"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  hallId?: string
  hallName?: string
  onSuccess?: () => void
}

export default function HallBookingDialog({ open, onOpenChange, hallId, hallName, onSuccess }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

        <BookingForm hallId={hallId} hallName={hallName} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}

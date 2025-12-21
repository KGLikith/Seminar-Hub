"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BookingForm from "./BookingForm"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function HallBookingDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* <DialogHeader>
          <DialogTitle>Book Seminar Hall</DialogTitle>
        </DialogHeader> */}

        <BookingForm />
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { X } from "lucide-react"

export default function ImagePreviewModal({
  src,
  onClose,
}: {
  src: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>

      <img
        src={src}
        className="max-h-[90%] max-w-[90%] rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

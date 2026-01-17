-- CreateTable
CREATE TABLE "BookingMedia" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingMedia_booking_id_idx" ON "BookingMedia"("booking_id");

-- AddForeignKey
ALTER TABLE "BookingMedia" ADD CONSTRAINT "BookingMedia_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMedia" ADD CONSTRAINT "BookingMedia_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "HallImage" (
    "id" TEXT NOT NULL,
    "hall_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HallImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HallImage_hall_id_idx" ON "HallImage"("hall_id");

-- AddForeignKey
ALTER TABLE "HallImage" ADD CONSTRAINT "HallImage_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

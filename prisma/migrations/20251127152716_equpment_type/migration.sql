/*
  Warnings:

  - You are about to drop the `ComponentMaintenanceLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HallComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeminarHall` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Equipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "component_type" AS ENUM ('projector', 'screen', 'audio_system', 'microphone', 'whiteboard', 'smartboard', 'ac', 'lighting', 'camera', 'other');

-- CreateEnum
CREATE TYPE "equipment_type" AS ENUM ('speaker', 'microphone', 'mixer', 'amplifier', 'laptop', 'pointer', 'cable', 'adapter', 'router', 'tablet', 'camera', 'stand', 'projector', 'other');

-- CreateEnum
CREATE TYPE "component_status" AS ENUM ('operational', 'maintenance_required', 'under_maintenance', 'non_operational');

-- CreateEnum
CREATE TYPE "maintenance_request_status" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_hall_id_fkey";

-- DropForeignKey
ALTER TABLE "ComponentMaintenanceLog" DROP CONSTRAINT "ComponentMaintenanceLog_component_id_fkey";

-- DropForeignKey
ALTER TABLE "ComponentMaintenanceLog" DROP CONSTRAINT "ComponentMaintenanceLog_performed_by_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_hall_id_fkey";

-- DropForeignKey
ALTER TABLE "HallComponent" DROP CONSTRAINT "HallComponent_hall_id_fkey";

-- DropForeignKey
ALTER TABLE "HallTechStaff" DROP CONSTRAINT "HallTechStaff_hall_id_fkey";

-- DropForeignKey
ALTER TABLE "SeminarHall" DROP CONSTRAINT "SeminarHall_department_id_fkey";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "type",
ADD COLUMN     "type" "equipment_type" NOT NULL;

-- DropTable
DROP TABLE "ComponentMaintenanceLog";

-- DropTable
DROP TABLE "HallComponent";

-- DropTable
DROP TABLE "SeminarHall";

-- DropEnum
DROP TYPE "ComponentStatus";

-- DropEnum
DROP TYPE "ComponentType";

-- CreateTable
CREATE TABLE "seminar_halls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seating_capacity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "status" "HallStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "seminar_halls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_halls" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hall_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_halls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hall_components" (
    "id" TEXT NOT NULL,
    "hall_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "component_type" NOT NULL,
    "status" "component_status" NOT NULL DEFAULT 'operational',
    "location" TEXT,
    "installation_date" DATE,
    "last_maintenance" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hall_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_maintenance_logs" (
    "id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous_status" "component_status" NOT NULL,
    "new_status" "component_status" NOT NULL,
    "notes" TEXT,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "component_maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "hall_id" TEXT NOT NULL,
    "tech_staff_id" TEXT NOT NULL,
    "component_id" TEXT,
    "equipment_id" TEXT,
    "request_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" "maintenance_request_status" NOT NULL DEFAULT 'pending',
    "hod_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_halls_user_id_idx" ON "favorite_halls"("user_id");

-- CreateIndex
CREATE INDEX "favorite_halls_hall_id_idx" ON "favorite_halls"("hall_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_halls_user_id_hall_id_key" ON "favorite_halls"("user_id", "hall_id");

-- CreateIndex
CREATE INDEX "hall_components_hall_id_idx" ON "hall_components"("hall_id");

-- CreateIndex
CREATE INDEX "hall_components_status_idx" ON "hall_components"("status");

-- CreateIndex
CREATE INDEX "component_maintenance_logs_component_id_idx" ON "component_maintenance_logs"("component_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_hall_id_idx" ON "maintenance_requests"("hall_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_tech_staff_id_idx" ON "maintenance_requests"("tech_staff_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests"("status");

-- AddForeignKey
ALTER TABLE "seminar_halls" ADD CONSTRAINT "seminar_halls_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_halls" ADD CONSTRAINT "favorite_halls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_halls" ADD CONSTRAINT "favorite_halls_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallTechStaff" ADD CONSTRAINT "HallTechStaff_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_components" ADD CONSTRAINT "hall_components_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_maintenance_logs" ADD CONSTRAINT "component_maintenance_logs_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "hall_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_maintenance_logs" ADD CONSTRAINT "component_maintenance_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "seminar_halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "hall_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_tech_staff_id_fkey" FOREIGN KEY ("tech_staff_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

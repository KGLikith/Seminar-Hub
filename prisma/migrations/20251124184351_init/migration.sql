-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('teacher', 'hod', 'tech_staff');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('active', 'not_working', 'under_repair');

-- CreateEnum
CREATE TYPE "HallStatus" AS ENUM ('available', 'booked', 'ongoing', 'maintenance');

-- CreateEnum
CREATE TYPE "ComponentStatus" AS ENUM ('operational', 'faulty', 'maintenance');

-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('projector', 'whiteboard', 'speaker', 'microphone', 'lighting', 'ac', 'door_lock', 'wifi_router', 'other');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT,
    "user_id" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeminarHall" (
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

    CONSTRAINT "SeminarHall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallTechStaff" (
    "id" TEXT NOT NULL,
    "hall_id" TEXT NOT NULL,
    "tech_staff_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HallTechStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ComponentType" NOT NULL,
    "serial_number" TEXT,
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'active',
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hall_id" TEXT NOT NULL,
    "last_updated_by" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentLog" (
    "id" TEXT NOT NULL,
    "previous_condition" "EquipmentCondition" NOT NULL,
    "new_condition" "EquipmentCondition" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipment_id" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "EquipmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "permission_letter_url" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "session_summary" TEXT,
    "ai_summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expected_participants" INTEGER,
    "special_requirements" TEXT,
    "hall_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "hod_id" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous_status" "BookingStatus",
    "new_status" "BookingStatus",
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "booking_id" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,

    CONSTRAINT "BookingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "related_booking_id" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ComponentType" NOT NULL,
    "status" "ComponentStatus" NOT NULL DEFAULT 'operational',
    "location" TEXT,
    "installation_date" TIMESTAMP(3),
    "last_maintenance" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hall_id" TEXT NOT NULL,

    CONSTRAINT "HallComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentMaintenanceLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous_status" "ComponentStatus" NOT NULL,
    "new_status" "ComponentStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "component_id" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,

    CONSTRAINT "ComponentMaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "recipient_email" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error_message" TEXT,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_clerkId_key" ON "Profile"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_profile_id_role_key" ON "UserRoleAssignment"("profile_id", "role");

-- CreateIndex
CREATE INDEX "SeminarHall_department_id_idx" ON "SeminarHall"("department_id");

-- CreateIndex
CREATE INDEX "HallTechStaff_hall_id_idx" ON "HallTechStaff"("hall_id");

-- CreateIndex
CREATE INDEX "HallTechStaff_tech_staff_id_idx" ON "HallTechStaff"("tech_staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "HallTechStaff_hall_id_tech_staff_id_key" ON "HallTechStaff"("hall_id", "tech_staff_id");

-- CreateIndex
CREATE INDEX "Equipment_hall_id_idx" ON "Equipment"("hall_id");

-- CreateIndex
CREATE INDEX "EquipmentLog_equipment_id_idx" ON "EquipmentLog"("equipment_id");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_hod_id_idx" ON "Booking"("hod_id");

-- CreateIndex
CREATE INDEX "BookingLog_booking_id_idx" ON "BookingLog"("booking_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "HallComponent_hall_id_idx" ON "HallComponent"("hall_id");

-- CreateIndex
CREATE INDEX "HallComponent_status_idx" ON "HallComponent"("status");

-- CreateIndex
CREATE INDEX "ComponentMaintenanceLog_component_id_idx" ON "ComponentMaintenanceLog"("component_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeminarHall" ADD CONSTRAINT "SeminarHall_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallTechStaff" ADD CONSTRAINT "HallTechStaff_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "SeminarHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallTechStaff" ADD CONSTRAINT "HallTechStaff_tech_staff_id_fkey" FOREIGN KEY ("tech_staff_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "SeminarHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLog" ADD CONSTRAINT "EquipmentLog_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLog" ADD CONSTRAINT "EquipmentLog_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "SeminarHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLog" ADD CONSTRAINT "BookingLog_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLog" ADD CONSTRAINT "BookingLog_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_related_booking_id_fkey" FOREIGN KEY ("related_booking_id") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallComponent" ADD CONSTRAINT "HallComponent_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "SeminarHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentMaintenanceLog" ADD CONSTRAINT "ComponentMaintenanceLog_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "HallComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentMaintenanceLog" ADD CONSTRAINT "ComponentMaintenanceLog_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

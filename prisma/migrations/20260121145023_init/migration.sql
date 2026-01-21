/*
  Warnings:

  - Added the required column `target` to the `maintenance_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "maintenance_target" AS ENUM ('hall', 'equipment', 'component');

-- AlterTable
ALTER TABLE "maintenance_requests" ADD COLUMN     "requested_component_type" "component_type",
ADD COLUMN     "requested_equipment_type" "equipment_type",
ADD COLUMN     "target" "maintenance_target" NOT NULL;

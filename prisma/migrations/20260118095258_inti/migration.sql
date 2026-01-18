/*
  Warnings:

  - You are about to drop the column `new_condition` on the `EquipmentLog` table. All the data in the column will be lost.
  - You are about to drop the column `previous_condition` on the `EquipmentLog` table. All the data in the column will be lost.
  - You are about to drop the column `new_status` on the `component_maintenance_logs` table. All the data in the column will be lost.
  - You are about to drop the column `previous_status` on the `component_maintenance_logs` table. All the data in the column will be lost.
  - The `priority` column on the `maintenance_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `action` to the `EquipmentLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `component_maintenance_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_type` on the `maintenance_requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "maintenance_request_type" AS ENUM ('new_installation', 'repair', 'replacement', 'inspection', 'calibration', 'preventive', 'general_issue');

-- CreateEnum
CREATE TYPE "maintenance_priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "maintenance_action" AS ENUM ('created', 'inspected', 'repaired', 'replaced', 'calibrated', 'cleaned', 'tested', 'marked_non_operational', 'marked_operational', 'completed');

-- AlterTable
ALTER TABLE "EquipmentLog" DROP COLUMN "new_condition",
DROP COLUMN "previous_condition",
ADD COLUMN     "action" "maintenance_action" NOT NULL,
ADD COLUMN     "condition_after" "EquipmentCondition";

-- AlterTable
ALTER TABLE "component_maintenance_logs" DROP COLUMN "new_status",
DROP COLUMN "previous_status",
ADD COLUMN     "status_after" "component_status",
DROP COLUMN "action",
ADD COLUMN     "action" "maintenance_action" NOT NULL;

-- AlterTable
ALTER TABLE "maintenance_requests" DROP COLUMN "request_type",
ADD COLUMN     "request_type" "maintenance_request_type" NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "maintenance_priority" NOT NULL DEFAULT 'medium';

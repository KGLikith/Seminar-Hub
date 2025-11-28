/*
  Warnings:

  - A unique constraint covering the columns `[hod_id]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DepartmentName" AS ENUM ('Computer_Science', 'Electrical_Engineering', 'Mechanical_Engineering', 'Civil_Engineering', 'Chemistry', 'Physics', 'IEM');

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "hod_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Department_hod_id_key" ON "Department"("hod_id");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

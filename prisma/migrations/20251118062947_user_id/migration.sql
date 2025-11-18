-- DropForeignKey
ALTER TABLE "EquipmentLog" DROP CONSTRAINT "EquipmentLog_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "HallTechStaff" DROP CONSTRAINT "HallTechStaff_tech_staff_id_fkey";

-- AddForeignKey
ALTER TABLE "HallTechStaff" ADD CONSTRAINT "HallTechStaff_tech_staff_id_fkey" FOREIGN KEY ("tech_staff_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLog" ADD CONSTRAINT "EquipmentLog_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

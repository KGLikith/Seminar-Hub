import { SeminarHall } from "@/generated/client";

export interface HallWithDepartment extends SeminarHall {
  department: {
    id: string;
    name: string;
  } | null;
}
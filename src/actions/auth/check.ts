"use server";

import { pool } from "@/client/pool";
import { DepartmentName } from "@/schemas/department";


export async function checkDepartmentHod(department: DepartmentName) {
    const result = await pool.query(
        `
    SELECT hod_id
    FROM departments
    WHERE name = $1
    LIMIT 1
    `,
        [department]
    );

    const hodId = result.rows[0]?.hod_id;

    console.log(
        "Department HOD check for:",
        department,
        "HOD ID:",
        hodId
    );

    if (hodId) {
        return {
            ok: false,
            message: "This department already has a HOD",
        };
    }

    return { ok: true };
}

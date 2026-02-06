import { Pool } from "pg";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Seeding database (RAW SQL)...");

  /* ===================== DEPARTMENTS ===================== */
  const departmentNames = [
    { name: "Computer Science", description: "CSE department" },
    { name: "Electronics", description: "ECE department" },
    { name: "Mechanical", description: "ME department" },
    { name: "Civil", description: "Civil Engineering" },
    { name: "Information Science", description: "ISE department" },
    { name: "Electrical", description: "EEE department" },
  ];

  const departments: any[] = [];

  for (const dept of departmentNames) {
    const { rows } = await db.query(
      `
      INSERT INTO departments (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
      `,
      [dept.name, dept.description]
    );

    if (rows.length === 0) {
      const existing = await db.query(
        "SELECT * FROM departments WHERE name = $1",
        [dept.name]
      );
      departments.push(existing.rows[0]);
    } else {
      departments.push(rows[0]);
    }
  }

  console.log("✔ Departments created:", departments.length);

  const halls: any[] = [];

  const hallInserts = [
    {
      name: "Main Auditorium",
      capacity: 500,
      location: "Building A, Ground Floor",
      description: "Large auditorium with AV setup",
      dept: departments[0].id,
    },
    {
      name: "Tech Conference Room",
      capacity: 120,
      location: "Building B, 2nd Floor",
      description: "Smart room with projector & conferencing",
      dept: departments[0].id,
    },
    {
      name: "ECE Seminar Hall",
      capacity: 90,
      location: "Building C, 1st Floor",
      description: "Seminar hall with audio systems & projector",
      dept: departments[1].id,
    },
    {
      name: "Mechanical Workshop Hall",
      capacity: 70,
      location: "Workshop Block",
      description: "Hall for demos and sessions",
      dept: departments[2].id,
    },
  ];

  for (const hall of hallInserts) {
    const { rows } = await db.query(
      `
      INSERT INTO seminar_halls
        (name, seating_capacity, location, description, department_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        hall.name,
        hall.capacity,
        hall.location,
        hall.description,
        hall.dept,
      ]
    );
    halls.push(rows[0]);
  }

  console.log("✔ Seminar halls created:", halls.length);

  const equipmentInserts = [
    ["Portable Projector", "projector", "PROJ-CSE-001", halls[0].id],
    ["Sound System", "speaker", "AUD-MAIN-002", halls[0].id],
    ["Conference Mic Set", "microphone", "MIC-CONF-003", halls[1].id],
    ["LED Screen", "other", "LED-ECE-004", halls[2].id],
    ["Portable AC Unit", "other", "AC-MECH-005", halls[3].id],
  ];

  for (const eq of equipmentInserts) {
    await db.query(
      `
      INSERT INTO equipment (name, type, serial_number, condition, hall_id)
      VALUES ($1, $2::equipment_type, $3, 'active', $4)
      `,
      eq
    );
  }

  console.log("✔ Equipment created:", equipmentInserts.length);

  const componentInserts = [
    ["Ceiling Projector", "projector", "operational", "Ceiling Center", halls[0].id, "Updated 2024"],
    ["Stage Lighting System", "lighting", "operational", "Stage Front", halls[0].id, null],
    ["WiFi Router", "other", "operational", "Ceiling Corner", halls[1].id, null],
    ["AC Unit", "ac", "operational", "Back Wall", halls[2].id, "Cooling stable"],
    ["Surround Speakers", "audio_system", "operational", "Side Walls", halls[3].id, null],
  ];

  for (const c of componentInserts) {
    await db.query(
      `
      INSERT INTO hall_components
        (name, type, status, location, hall_id, notes)
      VALUES ($1, $2::component_type, $3::component_status, $4, $5, $6)
      `,
      c
    );
  }

  console.log("✔ Components created:", componentInserts.length);

  console.log("🎉 Database seeded successfully using RAW SQL!");
}

main()
  .then(() => db.end())
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    db.end();
    process.exit(1);
  });

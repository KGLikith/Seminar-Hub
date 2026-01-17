import { ComponentType, EquipmentType, PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const departmentNames = [
    { name: "Computer Science", description: "CSE department" },
    { name: "Electronics", description: "ECE department" },
    { name: "Mechanical", description: "ME department" },
    { name: "Civil", description: "Civil Engineering" },
    { name: "Information Science", description: "ISE department" },
    { name: "Electrical", description: "EEE department" },
  ];

  const departments = await Promise.all(
    departmentNames.map((dept) =>
      prisma.department.upsert({
        where: { name: dept.name },
        update: {}, // nothing to update
        create: dept,
      })
    )
  );


  console.log("✔ Departments created:", departments.length);

  const halls = await Promise.all([
    prisma.seminarHall.create({
      data: {
        name: "Main Auditorium",
        seating_capacity: 500,
        location: "Building A, Ground Floor",
        description: "Large auditorium with AV setup",
        department_id: departments[0].id,
        image_url: "/placeholder.svg",
      },
    }),
    prisma.seminarHall.create({
      data: {
        name: "Tech Conference Room",
        seating_capacity: 120,
        location: "Building B, 2nd Floor",
        description: "Smart room with projector & conferencing",
        department_id: departments[0].id,
        image_url: "/placeholder.svg",
      },
    }),
    prisma.seminarHall.create({
      data: {
        name: "ECE Seminar Hall",
        seating_capacity: 90,
        location: "Building C, 1st Floor",
        description: "Seminar hall with audio systems & projector",
        department_id: departments[1].id,
        image_url: "/placeholder.svg",
      },
    }),
    prisma.seminarHall.create({
      data: {
        name: "Mechanical Workshop Hall",
        seating_capacity: 70,
        location: "Workshop Block",
        description: "Hall for demos and sessions",
        department_id: departments[2].id,
        image_url: "/placeholder.svg",
      },
    }),
  ]);

  console.log("✔ Seminar halls created:", halls.length);

  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        name: "Portable Projector",
        type: EquipmentType.projector ?? EquipmentType.other, // fallback if missing
        serial_number: "PROJ-CSE-001",
        condition: "active",
        hall_id: halls[0].id,
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Sound System",
        type: EquipmentType.speaker,
        serial_number: "AUD-MAIN-002",
        condition: "active",
        hall_id: halls[0].id,
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Conference Mic Set",
        type: EquipmentType.microphone,
        serial_number: "MIC-CONF-003",
        condition: "active",
        hall_id: halls[1].id,
      },
    }),
    prisma.equipment.create({
      data: {
        name: "LED Screen",
        type: EquipmentType.other,
        serial_number: "LED-ECE-004",
        condition: "active",
        hall_id: halls[2].id,
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Portable AC Unit",
        type: EquipmentType.other,
        serial_number: "AC-MECH-005",
        condition: "active",
        hall_id: halls[3].id,
      },
    }),
  ]);

  console.log("✔ Equipment created:", equipment.length);

  const components = await Promise.all([
    prisma.hallComponent.create({
      data: {
        name: "Ceiling Projector",
        type: ComponentType.projector,
        status: "operational",
        location: "Ceiling Center",
        hall_id: halls[0].id,
        notes: "Updated 2024",
      },
    }),
    prisma.hallComponent.create({
      data: {
        name: "Stage Lighting System",
        type: ComponentType.lighting,
        status: "operational",
        location: "Stage Front",
        hall_id: halls[0].id,
      },
    }),
    prisma.hallComponent.create({
      data: {
        name: "WiFi Router",
        type: ComponentType.other, // Not part of component enum → mapped safely
        status: "operational",
        location: "Ceiling Corner",
        hall_id: halls[1].id,
      },
    }),
    prisma.hallComponent.create({
      data: {
        name: "AC Unit",
        type: ComponentType.ac,
        status: "operational",
        location: "Back Wall",
        hall_id: halls[2].id,
        notes: "Cooling stable",
      },
    }),
    prisma.hallComponent.create({
      data: {
        name: "Surround Speakers",
        type: ComponentType.audio_system,
        status: "operational",
        location: "Side Walls",
        hall_id: halls[3].id,
      },
    }),
  ]);

  console.log("✔ Components created:", components.length);

  console.log("🎉 Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

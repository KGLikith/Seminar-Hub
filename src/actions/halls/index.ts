"use server";
import { HallStatus } from "@/generated/enums";
import prisma from "@/lib/db";

export async function getHalls() {
  return await prisma.seminarHall.findMany({
    include: {
      department: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getHallById(id: string) {
  return await prisma.seminarHall.findUnique({
    where: { id },
    include: {
      department: true,
      equipment: true,
      components: true,
      bookings: {
        where: { status: "approved" },
        orderBy: { booking_date: "asc" },
      },
      hallTechStaffs: {
        include: { tech_staff: true },
      },
    },
  });
}

export const getHallsByProfileId = async (profileId: string) => {
  return await prisma.seminarHall.findFirst({
    where: {
      hallTechStaffs: {
        some: {
          id: profileId,
        },
      },
    },
  });
};

export const getHallsForDepartment = async (departmentId: string) => {
    const data = await prisma.seminarHall.findMany({
      where: { department_id: departmentId },
      orderBy: { name: "asc" },
    });
    return data;
};

export async function updateHallStatus(hallId: string, status: HallStatus) {
  return await prisma.seminarHall.update({
    where: { id: hallId },
    data: { status },
  });
}

const combineDateAndTime = (d: string, t: string) => {
    const date = new Date(d)
    const [h, m] = t.split(":").map(Number)
    date.setHours(h, m, 0, 0)
    return date
  }

export const getBookingDetailsForHall = async (
  hallId: string,
  date: Date,
  startTime: string,
  endTime: string
) => {
  try {
    const start = combineDateAndTime(date.toISOString().split("T")[0], startTime)
    const end = combineDateAndTime(date.toISOString().split("T")[0], endTime)

    console.log(start, end, new Date(date));
    const bookings = await prisma.booking.findMany({
      where: {
        hall_id: hallId,
        booking_date: new Date(date),
        status: { in: ["approved", "pending"] },

        AND: [{ start_time: { lte: start } }, { end_time: { gte: end } }],
      },
      include: {
        teacher: {
          select: { name: true },
        },
      },
    });

    return { data: bookings, error: null };
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return { data: null, error };
  }
};

export async function getAnalytics() {
  try {
    const hallUsageRaw = await prisma.booking.groupBy({
      by: ["hall_id"],
      _count: { id: true },
    });

    const halls = await prisma.seminarHall.findMany({
      select: { id: true, name: true },
    });

    const hallUsage = halls.map((hall) => {
      const match = hallUsageRaw.find((h) => h.hall_id === hall.id);
      return {
        hall_id: hall.id,
        hall_name: hall.name,
        total_bookings: match?._count.id ?? 0,
        approved_bookings: 0,
      };
    });

    const hallApprovedRaw = await prisma.booking.groupBy({
      by: ["hall_id"],
      where: { status: "approved" },
      _count: { id: true },
    });

    hallApprovedRaw.forEach((a) => {
      const index = hallUsage.findIndex((h) => h.hall_id === a.hall_id);
      if (index !== -1) hallUsage[index].approved_bookings = a._count.id;
    });

    hallUsage.forEach((h) => (h.approved_bookings ??= 0));

    const bookings = await prisma.booking.findMany({
      where: { status: { in: ["approved", "completed"] } },
      select: { start_time: true },
    });

    const hourCounts: Record<number, number> = {};

    bookings.forEach((b) => {
      const hour = new Date(b.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        booking_count: count,
      }))
      .sort((a, b) => b.booking_count - a.booking_count)
      .slice(0, 5);

    const pastSixMonths = new Date();
    pastSixMonths.setMonth(pastSixMonths.getMonth() - 6);

    const monthly = await prisma.booking.findMany({
      where: {
        created_at: { gte: pastSixMonths },
      },
      select: { created_at: true },
    });

    const monthCounts: Record<string, number> = {};

    monthly.forEach((b) => {
      const month = new Date(b.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const monthlyStats = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      booking_count: count,
    }));

    return {
      hallUsage,
      peakHours,
      monthlyStats,
    };
  } catch (error) {
    console.error("Analytics Error:", error);
    throw new Error("Failed to load analytics");
  }
}

export async function getAnalyticsForHOD(departmentId: string) {
  if (!departmentId) throw new Error("Department ID required")

  const [totalHalls, totalTeachers, totalTechStaff] = await Promise.all([
    prisma.seminarHall.count({ where: { department_id: departmentId } }),
    prisma.profile.count({
      where: {
        department_id: departmentId,
        roles: { some: { role: "teacher" } },
      },
    }),
    prisma.profile.count({
      where: {
        department_id: departmentId,
        roles: { some: { role: "tech_staff" } },
      },
    }),
  ])

  const bookings = await prisma.booking.findMany({
    where: { hall: { department_id: departmentId } },
    select: {
      status: true,
      booking_date: true,
      start_time: true,
      end_time: true,
      hall_id: true,
      teacher: { select: { name: true } },
    },
  })

  const totalBookings = bookings.length

  const statusDistribution: Record<string, number> = {}
  bookings.forEach(b => {
    statusDistribution[b.status] = (statusDistribution[b.status] || 0) + 1
  })

  const hallMap = new Map<string, string>()
  const halls = await prisma.seminarHall.findMany({
    where: { department_id: departmentId },
    select: { id: true, name: true },
  })
  halls.forEach(h => hallMap.set(h.id, h.name))

  const hallUsageMap: Record<string, number> = {}
  bookings.forEach(b => {
    hallUsageMap[b.hall_id] = (hallUsageMap[b.hall_id] || 0) + 1
  })

  const hallUsage = Object.entries(hallUsageMap).map(([hallId, count]) => ({
    hall_id: hallId,
    hall_name: hallMap.get(hallId) ?? "Unknown",
    total_bookings: count,
  }))

  const hourMap: Record<number, number> = {}
  bookings.forEach(b => {
    const hour = new Date(b.start_time).getHours()
    hourMap[hour] = (hourMap[hour] || 0) + 1
  })

  const peakHours = Object.entries(hourMap).map(([hour, count]) => ({
    hour: Number(hour),
    booking_count: count,
  }))

  const monthMap: Record<string, number> = {}
  bookings.forEach(b => {
    const month = b.booking_date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    })
    monthMap[month] = (monthMap[month] || 0) + 1
  })

  const monthlyStats = Object.entries(monthMap).map(([month, count]) => ({
    month,
    booking_count: count,
  }))

  const teacherMap: Record<string, number> = {}
  bookings.forEach(b => {
    teacherMap[b.teacher.name] = (teacherMap[b.teacher.name] || 0) + 1
  })

  const activeTeachers = Object.entries(teacherMap)
    .map(([teacher_name, booking_count]) => ({
      teacher_name,
      booking_count,
    }))
    .sort((a, b) => b.booking_count - a.booking_count)
    .slice(0, 5)

  return {
    totalHalls,
    totalTeachers,
    totalTechStaff,
    totalBookings,
    hallUsage,
    peakHours,
    monthlyStats,
    statusDistribution,
    activeTeachers,
  }
}

export async function getHallAnalyticsForHOD(
  hallId: string,
  departmentId: string
) {
  if (!hallId || !departmentId) throw new Error("Invalid request")

  const hall = await prisma.seminarHall.findFirst({
    where: { id: hallId, department_id: departmentId },
    include: {
      department: {
        include: {
          hod_profile: { select: { name: true } },
        },
      },
      hallTechStaffs: {
        include: {
          tech_staff: { select: { name: true } },
        },
      },
    },
  })

  if (!hall) throw new Error("Unauthorized")

  const bookings = await prisma.booking.findMany({
    where: { hall_id: hallId },
    orderBy: { booking_date: "desc" },
    include: {
      teacher: { select: { name: true } },
    },
  })

  const byStatus: Record<string, number> = {}
  bookings.forEach(b => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1
  })

  const monthMap: Record<string, number> = {}
  bookings.forEach(b => {
    const month = b.booking_date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    })
    monthMap[month] = (monthMap[month] || 0) + 1
  })

  const monthlyTrend = Object.entries(monthMap).map(([month, count]) => ({
    month,
    count,
  }))

  const peakHourMap: Record<number, number> = {}
  bookings.forEach(b => {
    const hour = new Date(b.start_time).getHours()
    peakHourMap[hour] = (peakHourMap[hour] || 0) + 1
  })

  const peakHours = Object.entries(peakHourMap).map(([hour, usage]) => ({
    hour: `${hour}:00`,
    usage,
  }))

  const durations = bookings.map(
    b => (b.end_time.getTime() - b.start_time.getTime()) / 60000
  )

  const avgSessionDuration =
    durations.reduce((a, b) => a + b, 0) / (durations.length || 1)

  const equipmentUsage: Record<string, number> = {}
  bookings.forEach(b => {
    if (b.special_requirements) {
      equipmentUsage[b.special_requirements] =
        (equipmentUsage[b.special_requirements] || 0) + 1
    }
  })

  return {
    hall: {
      id: hall.id,
      name: hall.name,
      location: hall.location,
      seating_capacity: hall.seating_capacity,
      status: hall.status,
    },
    hod: hall.department.hod_profile,
    techStaff: hall.hallTechStaffs.map(h => h.tech_staff),
    stats: {
      byStatus,
      monthlyTrend,
      peakHours,
      equipmentUsage,
      avgSessionDuration: Math.round(avgSessionDuration),
      longestSession: Math.max(...durations, 0),
      shortestSession: Math.min(...durations, 0),
    },
    bookings,
  }
}


export async function updateHall(
  hallId: string,
  data: {
    name: string;
    location: string;
    seating_capacity: number;
    description: string | null;
  }
) {
  try{
    const res = await prisma.seminarHall.update({
      where: { id: hallId },
      data: {
        name: data.name,
        location: data.location,
        seating_capacity: data.seating_capacity,
        description: data.description,
      },
    });
    return { data: res, error: null };
  }catch(err){
    console.log("Error updating hall:", err);
    return { error: "Failed to update hall" };
  }
}

export async function createHall(
  data: {
    name: string;
    location: string;
    seating_capacity: number;
    description: string | null;
    department_id: string;
  }
) {
  try{
    const res = await prisma.seminarHall.create({
      data: {
        name: data.name,
        location: data.location,
        seating_capacity: data.seating_capacity,
        description: data.description,
        department_id: data.department_id,
        status: HallStatus.available,
      },
    });
    return { data: res, error: null };
  }catch(err){
    console.log("Error creating hall:", err);
    return { error: "Failed to create hall" };
  }
}

export async function deleteHall(hallId: string) {
  try{
    await prisma.seminarHall.delete({
      where: { id: hallId },
    });
    return { error: null };
  }catch(err){
    console.log("Error deleting hall:", err);
    return { error: "Failed to delete hall" };
  }
}
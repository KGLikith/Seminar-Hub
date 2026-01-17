"use client"

import { useSearchParams } from "next/navigation"
import Calendar from "@/components/dashboard/calendar"

export default function Page() {
  const searchParams = useSearchParams()
  const seminarHall = searchParams.get("seminar_hall")

  return <Calendar defaultHallId={seminarHall ?? undefined} />
}

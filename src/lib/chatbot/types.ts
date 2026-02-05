export type UserRole = "teacher" | "hod" | "tech_staff"

export type ChatContext = {
  message: string
  profileId?: string
  roles: UserRole[]
  now: Date
}

export type Intent =
  | "availability"
  | "my_bookings"
  | "hod_pending_bookings"
  | "unknown"

export type ParsedEntities = {
  hallName?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

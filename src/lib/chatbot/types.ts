export type UserRole = "teacher" | "hod" | "tech_staff"

export type ChatContext = {
  message: string
  profileId: string
  roles: UserRole[]
  now: Date
}

"use client"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, Building2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useGetUsersFromDepartment, useProfile } from "@/hooks/react-query/useUser"
import { UserRole } from "@/generated/enums"
import { useDepartmentHalls } from "@/hooks/react-query/useHalls"
import { useGetTechStaffAssignments } from "@/hooks/react-query/useTechStaff"
import { assignHallToStaff } from "@/actions/user/tech_staff"

const DepartmentManagement = () => {
  const router = useRouter()
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? undefined)
  const {
    data: halls,
    isLoading: hallsLoading,
    refetch: HallsRefetch,
  } = useDepartmentHalls(profile?.department_id ?? undefined)
  const { data: users, isLoading: usersLoading } = useGetUsersFromDepartment(profile?.department_id ?? undefined)
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    refetch: assignmentsRefetch,
  } = useGetTechStaffAssignments(profile?.department_id ?? undefined)

  useEffect(() => {
    if (profileLoading) return
    if (!profile?.id && profile?.roles[0].role !== UserRole.hod) {
      router.push("/dashboard")
      return
    }
  }, [profile, profileLoading])

  const handleAssignHall = async (techStaffId: string, hallId: string) => {
    try {
      // Remove existing assignment for this tech staff
      const res = await assignHallToStaff(techStaffId, hallId)

      if (!res.success) throw new Error(res.message)

      toast.success("Tech staff assigned successfully")
      HallsRefetch()
      assignmentsRefetch()
    } catch (error) {
      console.error("Error assigning hall:", error)
      toast.error("Failed to assign hall")
    }
  }

  const getAssignedHall = (techStaffId: string) => {
    const assignment = assignments?.find((a) => a.tech_staff_id === techStaffId)
    return assignment?.hall_id
  }

  const teachers = users?.filter((u) => u.roles[0]?.role === UserRole.teacher) ?? []
  const techStaff = users?.filter((u) => u.roles[0]?.role === UserRole.tech_staff) ?? []

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Department Management</h1>
          <p className="text-muted-foreground">Manage teachers and tech staff in your department</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teachers ({teachers.length})
              </CardTitle>
              <CardDescription>Faculty members in your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                    <Badge variant="secondary">Teacher</Badge>
                  </div>
                ))}
                {teachers.length === 0 && <p className="text-center text-muted-foreground py-8">No teachers found</p>}
              </div>
            </CardContent>
          </Card>

          {/* Tech Staff Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Technical Staff ({techStaff.length})
              </CardTitle>
              <CardDescription>Assign tech staff to manage seminar halls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {techStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                    <Select
                      value={getAssignedHall(staff.id) || ""}
                      onValueChange={(hallId) => handleAssignHall(staff.id, hallId)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Assign hall..." />
                      </SelectTrigger>
                      <SelectContent>
                        {halls?.map((hall) => (
                          <SelectItem key={hall.id} value={hall.id}>
                            {hall.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {techStaff.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No tech staff found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default DepartmentManagement

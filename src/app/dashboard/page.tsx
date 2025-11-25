"use client";

import { Building2, Calendar, FileText, Clock, Bell, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile, useUserRole } from "@/hooks/react-query/useUser";
import { useHalls } from "@/hooks/react-query/useHalls";
import { usePendingBookingsForHOD } from "@/hooks/react-query/useBookings";
import { UserRole } from "@/generated/enums";

export default function Dashboard() {
  const router = useRouter();
  const { userId } = useAuth();

  const { data: profile, isLoading: profileLoading } = useProfile(userId ?? undefined);
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: role, isLoading: roleLoading } = useUserRole(profile?.id ?? undefined);
  const { data: pendingBookings = [], isLoading: pendingBookingsLoading } = usePendingBookingsForHOD(profile?.department_id ?? undefined);

  if (profileLoading || roleLoading || pendingBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";
      case "booked":
        return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100";
      case "ongoing":
        return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100";
      case "maintenance":
        return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100";
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">

      <main className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-1">Welcome back, {profile?.name} 👋</h2>
          <p className="text-muted-foreground">
            Manage all seminar hall bookings and actions from one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <Button
            className="h-24 shadow-sm hover:shadow-md transition-all flex flex-col items-start justify-center p-5"
            onClick={() => router.push("/halls")}
          >
            <Building2 className="h-5 w-5 mb-2" /> Browse All Halls
          </Button>

          {role == UserRole.hod || role == UserRole.teacher ? (
            <Button
              variant="default"
              className="h-24 shadow-sm hover:shadow-md transition-all flex flex-col items-start justify-center p-5"
              onClick={() => router.push("/book")}
            >
              <Calendar className="h-5 w-5 mb-2" /> Request Booking
            </Button>) : null}

        </div>

        {role === UserRole.hod && (
          <>
            <Button onClick={() => router.push("/hod-approval")} variant="secondary">
              <Bell className="h-4 w-4 mr-2" />
              Pending Approvals
              {pendingBookings?.length ? pendingBookings.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingBookings.length}
                </Badge>
              ) : null}
            </Button>
            <Button onClick={() => router.push("/analytics")} variant="outline">
              Analytics 
            </Button>
            <Button onClick={() => router.push("/hall-management")} variant="outline">
              Manage Halls
            </Button>
          </>
        )}

        <h3 className="text-2xl font-bold mb-6">Available Halls</h3>

        {hallsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.slice(0, 6).map((hall: any, idx: number) => (
              <Card
                key={hall.id}
                className="shadow-md hover:shadow-xl transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => router.push(`/halls/${hall.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{hall.name}</CardTitle>
                    <Badge className={getStatusColor(hall.status)}>{hall.status}</Badge>
                  </div>
                  <CardDescription>{hall.department?.name}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Capacity:</span>{" "}
                      <span className="font-medium">{hall.seating_capacity}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      <span className="font-medium">{hall.location}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

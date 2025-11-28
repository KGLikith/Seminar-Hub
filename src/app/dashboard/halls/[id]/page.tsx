'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useProfile, useUserRole } from "@/hooks/react-query/useUser";
import { useAuth } from "@clerk/nextjs";
import { useHall } from "@/hooks/react-query/useHalls";
import { useBookingLogs, useBookings } from "@/hooks/react-query/useBookings";
import { useGetTechStaffForHall } from "@/hooks/react-query/useTechStaff";
import HallViewer3D from "@/components/dashboard/hall/HallViewer3D";
import HallImageGallery from "@/components/dashboard/hall/HallImageGallery";
import EquipmentManagement from "@/components/dashboard/hall/EquipmentManagement";
import { useState } from "react";
import HallBookingDialog from "@/components/dashboard/booking/HallBookingDialog";
import { ComponentManagement } from "@/components/dashboard/hall/ComponentManagement";

const HallDetail = () => {
  // const today = new Date().toISOString().split("T")[0];

  const { id } = useParams();
  const [date, setDate] = useState<Date>(new Date());
  const router = useRouter();
  const { userId: clerkId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ? clerkId : "");
  const { data: hall, isLoading: hallLoading } = useHall(id as string);
  const { data: upcomingBookings, isLoading: bookingsLoading, refetch } = useBookings({
    hallId: id as string,
    dateFrom: date,
    status: ["approved"],
    limit: 5,
  })
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const { data: techStaff, isLoading: techStaffLoading } = useGetTechStaffForHall(profile?.id, id as string);
  const { data: bookingLogs, isLoading: logsLoading } = useBookingLogs(id as string);

  const handleBookNow = (hallId: string, hallName: string) => {
    setBookingDialogOpen(true);
  };


  const handleBookingSuccess = () => {
    refetch();
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success text-success-foreground";
      case "booked":
        return "bg-warning text-warning-foreground";
      case "ongoing":
        return "bg-accent text-accent-foreground";
      case "maintenance":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (profileLoading || hallLoading || techStaffLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading hall details...</p>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Hall not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{hall.name}</h1>
              <p className="text-lg text-muted-foreground">{hall.department?.name}</p>
            </div>
            <Badge className={getStatusColor(hall.status)} variant="outline">
              {hall.status}
            </Badge>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Button onClick={(e) => {
            e.preventDefault();
            handleBookNow(hall.id, hall.name);
          }} size="lg">
            <Calendar className="h-4 w-4 mr-2" />
            Book This Hall
          </Button>
        </motion.div>

        {id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <HallViewer3D hallName={hall.name} capacity={hall.seating_capacity} />
          </motion.div>
        )}

        {id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6"
          >
            <HallImageGallery hallId={id as string} canManage={techStaff ? true : false} />
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Hall Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seating Capacity</p>
                    <p className="font-medium">{hall.seating_capacity} seats</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{hall.location}</p>
                  </div>
                </div>
                {hall.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{hall.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {id && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <EquipmentManagement hallId={id as string} canManage={techStaff ? true : false} />
            </motion.div>
          )}
          {id && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-6"
            >
              <ComponentManagement
                hallId={id as string}
                canManage={techStaff ? true : false}
              />
            </motion.div>
          )}

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Bookings
              </CardTitle>
              <CardDescription>
                Scheduled events for this hall
              </CardDescription>
            </CardHeader>
            {!bookingsLoading ? <CardContent>
              <div className="space-y-3">
                {upcomingBookings && upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{booking.purpose}</p>
                        <p className="text-sm text-muted-foreground">
                          by {booking.teacher.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(booking.booking_date).toLocaleDateString()} •{" "}
                          {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>

                      </div>
                      <Badge variant={booking.status === "approved" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                )}
              </div>
            </CardContent> :
              <>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Loading upcoming bookings...</p>
                </CardContent>
              </>
            }
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription>
                Recent booking activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookingLogs && bookingLogs.length > 0 ? (
                  bookingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          {log.new_status && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="secondary" className="text-xs">
                                {log.previous_status} → {log.new_status}
                              </Badge>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {log.performer?.name || "System"} •{" "}
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No activity logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <HallBookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        hallId={id as string}
        hallName={hall.name}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default HallDetail;

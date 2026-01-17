'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Search, ArrowLeft, Users, MapPin, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHalls } from "@/hooks/react-query/useHalls";
import type { HallWithDepartment } from "@/schemas/hall.schema";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { UserRole } from "@/generated/enums";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import HallBookingDialog from "../booking/HallBookingDialog";

const HallComponent = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);
  const { data: halls = [], isLoading: loading, refetch } = useHalls();
  const [filteredHalls, setFilteredHalls] = useState<HallWithDepartment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHall, setSelectedHall] = useState<{ id: string; name: string } | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const role = profile?.roles[0].role;

  const canBook = role === UserRole.teacher || role === UserRole.hod;

  useEffect(() => {
    if (!halls) return;

    const filtered = searchTerm
      ? halls.filter((hall) =>
        hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.department.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : halls;

    setFilteredHalls((prev) => {
      const same =
        prev.length === filtered.length &&
        prev.every((p, i) => p.id === filtered[i].id);

      return same ? prev : filtered;
    });
  }, [searchTerm, halls]);


  const handleBookNow = (hallId: string, hallName: string) => {
    setSelectedHall({ id: hallId, name: hallName });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading halls...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seminar Halls</h1>
          <p className="text-muted-foreground">
            Browse all available seminar halls and their current status
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall, index) => (
            <motion.div
              key={hall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <CardHeader className="relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {hall.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {hall.department?.name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(hall.status)}>
                      {hall.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative flex-1 flex flex-col">
                  <div className="space-y-3 text-sm mb-4 flex-1">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Capacity
                      </span>
                      <span className="font-semibold">{hall.seating_capacity} seats</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </span>
                      <span className="font-medium">{hall.location}</span>
                    </div>
                    {hall.description && (
                      <p className="text-muted-foreground mt-3 line-clamp-2 text-xs">
                        {hall.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {canBook && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(hall.id, hall.name);
                        }}
                        className="flex-1 group-hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/halls/${hall.id}`)}
                      className={canBook ? "flex-1 cursor-pointer" : "w-full cursor-pointer"}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredHalls.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No halls found matching your search"
                  : "No seminar halls available"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      
      {selectedHall && (
        <HallBookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          hallId={selectedHall.id}
          hallName={selectedHall.name}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
export default HallComponent;

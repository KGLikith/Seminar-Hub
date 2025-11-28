'use client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Calendar, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { UserRole } from "@/generated/enums";
import { useAnalytics } from "@/hooks/react-query/useHalls";

const Analytics = () => {
  const router = useRouter();
  const { userId: clerkId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(clerkId ?? undefined);
  const { data: analyticsData, isLoading } = useAnalytics();

  useEffect(() => {
    if(profileLoading) return;
    if (profile?.roles[0].role !== UserRole.hod) {
      toast.error("Access denied: HOD only");
      router.push("/dashboard");
      return;
    }
  }, [profile]);

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header> */}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            View booking statistics and trends
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Most Used Halls
              </CardTitle>
              <CardDescription>Halls with highest booking count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.hallUsage.slice(0, 5).map((hall, index) => (
                  <div key={hall.hall_name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        #{index + 1} {hall.hall_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {hall.total_bookings} bookings
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(hall.total_bookings / (analyticsData?.hallUsage[0]?.total_bookings || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {analyticsData?.hallUsage.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No booking data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Peak Booking Hours
              </CardTitle>
              <CardDescription>Most popular time slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.peakHours.map((peak, index) => (
                  <div key={peak.hour} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        #{index + 1} {peak.hour}:00 - {peak.hour + 1}:00
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {peak.booking_count} bookings
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{
                          width: `${(peak.booking_count / (analyticsData?.peakHours[0]?.booking_count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {analyticsData?.peakHours.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No booking data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Booking Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Monthly Booking Trends
            </CardTitle>
            <CardDescription>Last 6 months booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.monthlyStats.map((stat) => (
                <div key={stat.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.month}</span>
                    <span className="text-sm text-muted-foreground">
                      {stat.booking_count} bookings
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(stat.booking_count / Math.max(...analyticsData?.monthlyStats.map((s) => s.booking_count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {analyticsData?.monthlyStats.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No booking data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;

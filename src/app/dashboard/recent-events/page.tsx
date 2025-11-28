'use client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { useBookings } from "@/hooks/react-query/useBookings";

const RecentEvents = () => {
    const router = useRouter();
    const { userId, isLoaded } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(userId ?? undefined);
    const { data: events, isLoading: eventsLoading } = useBookings({ status: ["completed", "approved"], limit: 20 });

    useEffect(() => {
        if (!isLoaded) return;
        if (!userId) {
            toast.error("User not authenticated");
            router.push("/auth/sign-in");
            return;
        }
    }, [userId, isLoaded]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-success text-success-foreground";
            case "approved":
                return "bg-accent text-accent-foreground";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    if (profileLoading || eventsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading recent events...</p>
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
                    <h1 className="text-4xl font-bold mb-2">Recent Events</h1>
                    <p className="text-lg text-muted-foreground">
                        View past and upcoming seminars and workshops
                    </p>
                </div>

                <div className="space-y-4">
                    {events && events.length > 0 ? (
                        events.map((event) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="mb-2">{event.purpose}</CardTitle>
                                            <CardDescription className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>
                                                        {event.hall.name} - {event.hall.location}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span>Organized by {event.teacher?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {new Date(event.booking_date).toLocaleDateString()} •{" "}
                                                        {new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                                        {new Date(event.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} </p>
                                                </div>
                                            </CardDescription>
                                        </div>
                                        <Badge className={getStatusColor(event.status)} variant="outline">
                                            {event.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                {event.session_summary && (
                                    <CardContent>
                                        <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium mb-1">Session Summary</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.session_summary}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No recent events found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecentEvents;

'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Upload, CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useProfile, useUserRole } from "@/hooks/react-query/useUser";
import { useAuth } from "@clerk/nextjs";
import { useHalls } from "@/hooks/react-query/useHalls";
import { getBookingDetailsForHall } from "@/actions/halls";
import { createBooking } from "@/actions/booking";
import { UserRole } from "@/generated/enums";

const BookingForm = () => {
    const router = useRouter();
    const { userId, isLoaded } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(userId ?? undefined);
    const { data: role } = useUserRole(profile?.id ?? undefined);
    const { data: halls = [], isLoading: hallsLoading } = useHalls();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedHall, setSelectedHall] = useState("");
    const [permissionFile, setPermissionFile] = useState<File | null>(null);
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [availabilityStatus, setAvailabilityStatus] = useState<"checking" | "available" | "unavailable" | null>(null);
    const [conflictingBooking, setConflictingBooking] = useState<any>(null);

    useEffect(() => {
        if (isLoaded && !userId) {
            toast.error("You must be signed in to request a booking.");
            router.push("/auth/sign-in");
        }
        if (role !== UserRole.teacher && role !== UserRole.hod) {
            toast.error("Only teachers and HODs can request bookings.");
            router.push("/dashboard");
        }
    }, [userId, role])

    useEffect(() => {
        if (selectedHall && bookingDate && startTime && endTime) {
            checkAvailability();
        } else {
            setAvailabilityStatus(null);
            setConflictingBooking(null);
        }
    }, [selectedHall, bookingDate, startTime, endTime]);

    const checkAvailability = async () => {
        if (!selectedHall || !bookingDate || !startTime || !endTime) return;

        setAvailabilityStatus("checking");

        const { data, error } = await getBookingDetailsForHall(
            selectedHall,
            new Date(bookingDate),
            startTime,
            endTime
        );

        if (error) {
            console.error("Error checking availability:", error);
            setAvailabilityStatus(null);
            return;
        }

        if (data && data.length > 0) {
            setAvailabilityStatus("unavailable");
            setConflictingBooking(data[0]);
        } else {
            setAvailabilityStatus("available");
            setConflictingBooking(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            // Check file type
            if (!file.type.match(/^(application\/pdf|image\/(jpeg|jpg|png))$/)) {
                toast.error("Only PDF, JPG, and PNG files are allowed");
                return;
            }
            setPermissionFile(file);
        }
    };

    const uploadPermissionLetter = async (file: File): Promise<string | null> => {
        setUploading(true);
        // const fileExt = file.name.split(".").pop();
        // const fileName = `${userId}-${Date.now()}.${fileExt}`;
        // const filePath = `permission-letters/${fileName}`;

        // const { error: uploadError } = await supabase.storage
        //     .from("bookings")
        //     .upload(filePath, file);

        // setUploading(false);

        // if (uploadError) {
        //     console.error("Upload error:", uploadError);
        //     toast.error("Failed to upload permission letter");
        //     return null;
        // }

        // const { data } = supabase.storage.from("bookings").getPublicUrl(filePath);
        return "ehllo";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!permissionFile) {
            toast.error("Please upload a permission letter");
            return;
        }

        if (!userId) {
            toast.error("User not authenticated");
            return;
        }

        if (availabilityStatus === "unavailable") {
            toast.error("This time slot is already booked. Please choose another time.");
            return;
        }

        setLoading(true);

        if (startTime >= endTime) {
            toast.error("End time must be after start time");
            setLoading(false);
            return;
        }

        const permissionUrl = await uploadPermissionLetter(permissionFile);

        if (!permissionUrl) {
            setLoading(false);
            return;
        }

        const formElement = e.target as HTMLFormElement;
        const expectedParticipants = parseInt((formElement.elements.namedItem("expected_participants") as HTMLInputElement).value);
        const specialRequirements = (formElement.elements.namedItem("special_requirements") as HTMLTextAreaElement).value;

        const props = {
            hallId: selectedHall,
            teacherId: userId,
            bookingDate: new Date(bookingDate),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            purpose: (document.getElementById("purpose") as HTMLTextAreaElement).value,
            permissionLetterUrl: permissionUrl,
            expectedParticipants: expectedParticipants,
            specialRequirements: specialRequirements,
        }

        const { error } = await createBooking(props)

        if (error) {
            console.error("Booking error:", error);
            toast.error("Failed to create booking request: " + error);
        } else {
            toast.success("Booking request submitted successfully!");
            router.push("/dashboard");
        }

        setLoading(false);
    };

    if (isLoaded && (profileLoading || hallsLoading)) {
        return <div className="flex justify-center items-center w-full">
            <Loader className="animate-spin" />
        </div>
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

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Request Seminar Hall Booking
                        </CardTitle>
                        <CardDescription>
                            Fill in the details below to request a booking. HOD approval is required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="hall">Seminar Hall *</Label>
                                <Select name="hall" value={selectedHall} onValueChange={setSelectedHall} required>
                                    <SelectTrigger id="hall">
                                        <SelectValue placeholder="Select a seminar hall" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {halls.map((hall) => (
                                            <SelectItem key={hall.id} value={hall.id}>
                                                {hall.name} - {hall.department?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="booking_date">Date *</Label>
                                    <Input
                                        id="booking_date"
                                        name="booking_date"
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        name="start_time"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time *</Label>
                                    <Input
                                        id="end_time"
                                        name="end_time"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Availability Status */}
                            {availabilityStatus && (
                                <div
                                    className={`p-4 rounded-lg border flex items-center gap-3 ${availabilityStatus === "checking"
                                        ? "bg-muted"
                                        : availabilityStatus === "available"
                                            ? "bg-success/10 border-success"
                                            : "bg-destructive/10 border-destructive"
                                        }`}
                                >
                                    {availabilityStatus === "checking" ? (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-sm">Checking availability...</span>
                                        </>
                                    ) : availabilityStatus === "available" ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-success" />
                                            <span className="text-sm font-medium">Time slot is available!</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-destructive" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Time slot unavailable</p>
                                                {conflictingBooking && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Conflicting booking: {conflictingBooking.profiles?.name} ({conflictingBooking.start_time} - {conflictingBooking.end_time})
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="expected_participants">Expected Participants *</Label>
                                <Input
                                    id="expected_participants"
                                    name="expected_participants"
                                    type="number"
                                    placeholder="e.g., 100"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose of Event *</Label>
                                <Textarea
                                    id="purpose"
                                    name="purpose"
                                    placeholder="Describe the seminar, workshop, or event..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="special_requirements">Special Requirements</Label>
                                <Textarea
                                    id="special_requirements"
                                    name="special_requirements"
                                    placeholder="Any special equipment, seating arrangements, etc. (optional)"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="permission_letter">
                                    Permission Letter * (PDF, JPG, or PNG - Max 5MB)
                                </Label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <Input
                                        id="permission_letter"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        required
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="permission_letter"
                                        className="cursor-pointer text-sm text-muted-foreground"
                                    >
                                        {permissionFile ? (
                                            <span className="text-primary font-medium">
                                                {permissionFile.name}
                                            </span>
                                        ) : (
                                            "Click to upload or drag and drop"
                                        )}
                                    </Label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={loading || uploading || !selectedHall || availabilityStatus === "unavailable" || availabilityStatus === "checking"}
                                    className="flex-1"
                                >
                                    {loading || uploading ? "Submitting..." : "Submit Booking Request"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/dashboard")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default BookingForm;

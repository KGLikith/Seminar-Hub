import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import TimeSlotSelector from "../TimeSlotSelector";
import { getBookingDetailsForHall } from "@/actions/halls";
import { createBooking } from "@/actions/booking";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";

interface HallBookingDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   hallId: string;
   hallName: string;
   onSuccess: () => void;
}

const HallBookingDialog = ({ open, onOpenChange, hallId, hallName, onSuccess }: HallBookingDialogProps) => {
   const router = useRouter();
   const { userId } = useAuth();
   const { data: profile, isLoading: profileLoading } = useProfile(userId ?? undefined);
   const [loading, setLoading] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [permissionFile, setPermissionFile] = useState<File | null>(null);
   const [bookingDate, setBookingDate] = useState("");
   const [timeSlot, setTimeSlot] = useState("");
   const [startTime, setStartTime] = useState("");
   const [endTime, setEndTime] = useState("");
   const [expectedParticipants, setExpectedParticipants] = useState<number | undefined>(undefined);
   const [purpose, setPurpose] = useState("");
   const [specialRequirements, setSpecialRequirements] = useState("");
   const [availabilityStatus, setAvailabilityStatus] = useState<"checking" | "available" | "unavailable" | null>(null);
   const [conflictingBooking, setConflictingBooking] = useState<any>(null);

   useEffect(() => {
      if (hallId && bookingDate && startTime && endTime) {
         checkAvailability();
      } else {
         setAvailabilityStatus(null);
         setConflictingBooking(null);
      }
   }, [hallId, bookingDate, startTime, endTime]);

   const checkAvailability = async () => {
      if (!hallId || !bookingDate || !startTime || !endTime) return;

      setAvailabilityStatus("checking");

      const { data, error } = await getBookingDetailsForHall(
         hallId,
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
         if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
         }
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
      //    .from("bookings")
      //    .upload(filePath, file);

      setUploading(false);

      // if (uploadError) {
      //    console.error("Upload error:", uploadError);
      //    toast.error("Failed to upload permission letter");
      //    return null;
      // }

      // const { data } = supabase.storage.from("bookings").getPublicUrl(filePath);
      return "https://example.com/path/to/uploaded/permission-letter";
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!permissionFile) {
         toast.error("Please upload a permission letter");
         return;
      }

      if (!userId || !profile?.id) {
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

      const props = {
         hallId: hallId,
         teacherId: profile?.id,
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
         setLoading(false);
      } else {
         toast.success("Booking request submitted successfully!");
         onSuccess();
         onOpenChange(false);
         setBookingDate("");
         setTimeSlot("");
         setStartTime("");
         setEndTime("");
         setExpectedParticipants(undefined);
         setPurpose("");
         setSpecialRequirements("");
         setPermissionFile(null);
      }

      setLoading(false);
   };

   const handleTimeChange = (start: string, end: string) => {
      setStartTime(start);
      setEndTime(end);
   };

   return (
      <Dialog open={open} onOpenChange={() => {
         onOpenChange(!open);
         setBookingDate("");
         setTimeSlot("");
         setStartTime("");
         setEndTime("");
         setExpectedParticipants(0);
         setPurpose("");
         setSpecialRequirements("");
         setPermissionFile(null);
      }}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hidden">
            <DialogHeader>
               <DialogTitle className="text-2xl">Book {hallName}</DialogTitle>
               <DialogDescription>
                  Fill in the details below to request a booking. HOD approval is required.
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="booking_date">Date *</Label>
                     <Input
                        id="booking_date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                     />
                  </div>

                  <TimeSlotSelector
                     value={timeSlot}
                     onChange={setTimeSlot}
                     onTimeChange={handleTimeChange}
                  />

                  {timeSlot === "Custom Time" && (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="start_time">Start Time *</Label>
                           <Input
                              id="start_time"
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
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  )}
               </div>

               {availabilityStatus && (
                  <div
                     className={`p-3 rounded-lg border flex items-center gap-3 animate-fade-in ${availabilityStatus === "checking"
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
                     type="number"
                     placeholder="e.g., 100"
                     min="1"
                     value={expectedParticipants ?? 0}
                     onChange={(e) => setExpectedParticipants(Number(e.target.value))}
                     required
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Event *</Label>
                  <Textarea
                     id="purpose"
                     placeholder="Describe the seminar, workshop, or event..."
                     rows={3}
                     value={purpose}
                     onChange={(e) => setPurpose(e.target.value)}
                     required
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="special_requirements">Special Requirements</Label>
                  <Textarea
                     id="special_requirements"
                     placeholder="Any special equipment, seating arrangements, etc. (optional)"
                     rows={2}
                     value={specialRequirements}
                     onChange={(e) => setSpecialRequirements(e.target.value)}
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="permission_letter">
                     Permission Letter * (PDF, JPG, or PNG - Max 5MB)
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                     <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
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
                        className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors"
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

               <div className="flex gap-3 pt-4">
                  <Button
                     type="submit"
                     disabled={loading || uploading || !hallId || availabilityStatus === "unavailable" || availabilityStatus === "checking"}
                     className="flex-1"
                  >
                     {loading || uploading ? "Submitting..." : "Submit Booking Request"}
                  </Button>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => onOpenChange(false)}
                  >
                     Cancel
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default HallBookingDialog;

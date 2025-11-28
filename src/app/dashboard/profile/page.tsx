'use client'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Building2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { useHallFromTechProfileId } from "@/hooks/react-query/useHalls";
import { updateProfile } from "@/actions/user";

const Profile = () => {
   const router = useRouter();
   const { userId: clerkId } = useAuth();
   const { data: profile, isLoading, refetch } = useProfile(clerkId ?? undefined);
   const { data: assignedHall, isLoading: hallsLoading } = useHallFromTechProfileId(profile ? profile.roles[0].role === "tech_staff" ? profile.id : undefined : undefined);
   const [uploading, setUploading] = useState(false);

   const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0 || !profile?.id) {
         return;
      }

      const file = event.target.files[0];
      setUploading(true);

      // try {
      //    const fileExt = file.name.split(".").pop();
      //    const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      //    const filePath = `avatars/${fileName}`;

      //    const { error: uploadError } = await supabase.storage
      //       .from("bookings")
      //       .upload(filePath, file, { upsert: true });

      //    if (uploadError) throw uploadError;

      //    const { data: { publicUrl } } = supabase.storage
      //       .from("bookings")
      //       .getPublicUrl(filePath);

      //    const { error: updateError } = await supabase
      //       .from("profiles")
      //       .update({ avatar_url: publicUrl })
      //       .eq("id", userId);

      //    if (updateError) throw updateError;

      //    toast.success("Avatar updated successfully");
      // } catch (error) {
      //    console.error("Error uploading avatar:", error);
      //    toast.error("Failed to upload avatar");
      // } finally {
      //    setUploading(false);
      // }
   };

   const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!profile?.id) return;

      const formData = new FormData(e.currentTarget);
      const updates = {
         name: formData.get("name") as string,
         phone: formData.get("phone") as string,
      };

      const { error } = await updateProfile(profile.id, updates);

      if (error) {
         toast.error("Failed to update profile");
         console.error(error);
      } else {
         toast.success("Profile updated successfully");
         refetch();
      }
   };

   if (isLoading || hallsLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Loading profile...</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background">

         <main className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
               <h1 className="text-4xl font-bold mb-2">My Profile</h1>
               <p className="text-lg text-muted-foreground">Manage your account information</p>
            </div>

            <div className="grid gap-6">
               <Card>
                  <CardHeader>
                     <CardTitle>Profile Picture</CardTitle>
                     <CardDescription>Update your profile picture</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-6">
                     <div className="relative">
                        {profile?.avatar_url ? (
                           <img
                              src={profile.avatar_url}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                           />
                        ) : (
                           <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
                              <UserIcon className="h-12 w-12 text-muted-foreground" />
                           </div>
                        )}
                     </div>
                     <div>
                        <Input
                           type="file"
                           accept="image/*"
                           onChange={handleAvatarUpload}
                           disabled={uploading}
                           className="mb-2"
                        />
                        <p className="text-sm text-muted-foreground">
                           {uploading ? "Uploading..." : "JPG, PNG or GIF (max. 5MB)"}
                        </p>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Basic Information</CardTitle>
                     <CardDescription>Your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                           <Label htmlFor="name">Full Name</Label>
                           <Input
                              id="name"
                              name="name"
                              defaultValue={profile?.name}
                              required
                           />
                        </div>
                        <div>
                           <Label htmlFor="email">Email</Label>
                           <Input
                              id="email"
                              name="email"
                              type="email"
                              defaultValue={profile?.email}
                              disabled
                              className="bg-muted"
                           />
                           <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                           <Label htmlFor="phone">Phone Number</Label>
                           <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              defaultValue={profile?.phone || ""}
                           />
                        </div>
                        <Button type="submit">Save Changes</Button>
                     </form>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Department & Role</CardTitle>
                     <CardDescription>Your organizational details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <Label>Role</Label>
                        <div className="mt-1">
                           <Badge variant="secondary" className="capitalize">
                              {profile?.roles[0]?.role.replace("_", " ")}
                           </Badge>
                        </div>
                     </div>
                     {profile?.department && (
                        <>
                           <div>
                              <Label>Department</Label>
                              <div className="flex items-center gap-2 mt-1">
                                 <Building2 className="h-4 w-4 text-muted-foreground" />
                                 <p className="text-sm">{profile.department.name}</p>
                              </div>
                           </div>
                           {profile.department?.hod_profile && (
                              <div>
                                 <Label>Head of Department</Label>
                                 <div className="flex items-center gap-2 mt-1">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{profile.department.hod_profile.name}</p>
                                 </div>
                              </div>
                           )}
                        </>
                     )}
                  </CardContent>
               </Card>

               {/* Tech Staff - Assigned Hall */}
               {profile?.roles[0]?.role === "tech_staff" && assignedHall && (
                  <Card>
                     <CardHeader>
                        <CardTitle>Assigned Seminar Hall</CardTitle>
                        <CardDescription>The hall you're responsible for</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div>
                           <Label>Hall Name</Label>
                           <p className="text-sm mt-1">{assignedHall.name}</p>
                        </div>
                        <div>
                           <Label>Location</Label>
                           <p className="text-sm mt-1">{assignedHall.location}</p>
                        </div>
                        <div>
                           <Label>Capacity</Label>
                           <p className="text-sm mt-1">{assignedHall.seating_capacity} seats</p>
                        </div>
                        <Button onClick={() => router.push(`/dashboard/halls/${assignedHall.id}`)}>
                           Manage Equipment
                        </Button>
                     </CardContent>
                  </Card>
               )}
            </div>
         </main>
      </div>
   );
};

export default Profile;

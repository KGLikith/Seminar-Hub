"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Building2, UserIcon, Loader2, AlertCircle, CheckCircle, Wrench, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { useHallFromTechProfileId } from "@/hooks/react-query/useHalls"
import { deleteProfileImage, updateProfile, uploadProfileImage } from "@/actions/user"
import { getHallImageUploadUrl } from "@/actions/halls/image"
import { getSignedURL } from "@/actions/aws/s3"
import queryclient from "@/client/queryClient"

const Profile = () => {
  const router = useRouter()
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading, refetch } = useProfile(clerkId ?? undefined)
  const { data: assignedHall, isLoading: hallsLoading } = useHallFromTechProfileId(
    profile ? (profile.roles[0].role === "tech_staff" ? profile.id : undefined) : undefined,
  )
  const [uploading, setUploading] = useState(false)

  async function uploadToS3(file: File, signedUrl: string) {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })
    if (!res.ok) throw new Error("Upload failed")
    return signedUrl.split("?")[0]
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile?.id) return;
    try {
      setUploading(true)
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return

      for (const file of files) {
        const signedUrl = await getSignedURL(file.type, file.name, profile.id, "profile_image")
        const publicUrl = await uploadToS3(file, signedUrl)
        await uploadProfileImage(profile.id, publicUrl)
      }

      await queryclient.invalidateQueries({
        queryKey: ["profile", clerkId],
      })

      toast.success("Profile updated")
      refetch()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const confirmDelete = async () => {
    if (!profile?.id) return;
    await deleteProfileImage(profile.id)

    await queryclient.invalidateQueries({
      queryKey: ["profile", clerkId],
    })
    toast.success("Image deleted")
    refetch()
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile?.id) return

    const formData = new FormData(e.currentTarget)
    const updates = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
    }

    const { error } = await updateProfile(profile.id, updates)

    if (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } else {
      toast.success("Profile updated successfully")
      refetch()
    }
  }

  if (isLoading || hallsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-2 text-balance">My Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-md border-border/50 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-linear-to-br from-primary/5 to-secondary/5">
              <CardTitle className="text-xl">Profile Picture</CardTitle>
              <CardDescription>Update or remove your profile picture</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-28 h-28 rounded-2xl object-cover border-4 border-primary shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary shadow-lg">
                      <UserIcon className="h-14 w-14 text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-3 text-center sm:text-left">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                    id="avatar-upload"
                  />

                  <div className="flex flex-wrap gap-3">
                    <label htmlFor="avatar-upload">
                      <Button
                        variant="outline"
                        className="gap-2"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Change Photo
                            </>
                          )}
                        </span>
                      </Button>
                    </label>

                    {profile?.avatar_url && (
                      <Button
                        variant="destructive"
                        className="gap-2"
                        disabled={uploading}
                        onClick={confirmDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Photo
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="shadow-md border-border/50">
            <CardHeader className="border-b border-border/50 bg-linear-to-br from-primary/5 to-secondary/5">
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile?.name}
                    required
                    className="h-12 rounded-lg border-border/60 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={profile?.email}
                    disabled
                    className="h-12 rounded-lg bg-muted/50 border-muted"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone || ""}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 rounded-lg border-border/60 focus:border-primary"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md border-border/50">
            <CardHeader className="border-b border-border/50 bg-linear-to-br from-primary/5 to-secondary/5">
              <CardTitle className="text-xl">Department & Role</CardTitle>
              <CardDescription>Your organizational details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-linear-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Role</Label>
                <Badge variant="default" className="text-base px-4 py-1.5 font-semibold capitalize">
                  {profile?.roles[0]?.role.replace("_", " ")}
                </Badge>
              </div>
              {profile?.department && (
                <>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Department</Label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-base font-medium">{profile.department.name}</p>
                    </div>
                  </div>
                  {profile.department?.hod_profile && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <Label className="text-sm font-semibold text-muted-foreground mb-2 block">
                        Head of Department
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-medium">{profile.department.hod_profile.name}</p>
                          <p className="text-sm text-muted-foreground">{profile.department.hod_profile.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {profile?.roles[0]?.role === "tech_staff" && assignedHall && (
            <Card className="shadow-md border-border/50 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Assigned Seminar Hall
                </CardTitle>
                <CardDescription>The hall you're responsible for managing</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-border/50">
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Hall Name</Label>
                    <p className="text-base font-bold">{assignedHall.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-border/50">
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Location</Label>
                    <p className="text-base font-medium">{assignedHall.location}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-border/50">
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Capacity</Label>
                    <p className="text-base font-bold">{assignedHall.seating_capacity} seats</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/halls/${assignedHall.id}`)}
                  size="lg"
                  className="w-full gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Wrench className="h-4 w-4" />
                  Manage Equipment & Components
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default Profile

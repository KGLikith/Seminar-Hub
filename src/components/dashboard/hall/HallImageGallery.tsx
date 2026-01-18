"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, Maximize2, Star, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { deleteHallImage, getHallImageUploadUrl, removeCover, saveHallImage, setHallCoverImage } from "@/actions/halls/image"
import { useHallImages } from "@/hooks/react-query/useHalls"

interface Props {
  hallId: string
  canManage: boolean
  coverImage?: string | null
}

export default function HallImageGallery({ hallId, canManage, coverImage }: Props) {
  const { data: images = [], refetch, isLoading } = useHallImages(hallId)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageToDelete, setImageToDelete] = useState<{ id: string; image_url: string } | null>(null)
  const [showRemoveCoverDialog, setShowRemoveCoverDialog] = useState(false)

  async function uploadToS3(file: File, signedUrl: string) {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })
    if (!res.ok) throw new Error("Upload failed")
    return signedUrl.split("?")[0]
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return

      for (const file of files) {
        const signedUrl = await getHallImageUploadUrl(file.type, file.name, hallId)
        const publicUrl = await uploadToS3(file, signedUrl)
        await saveHallImage(hallId, publicUrl)
      }

      toast.success("Images uploaded")
      refetch()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const confirmDelete = async () => {
    if (!imageToDelete) return
    await deleteHallImage(hallId, imageToDelete.id, imageToDelete.image_url)
    toast.success("Image deleted")
    setImageToDelete(null)
    refetch()
  }

  const handleRemoveCoverImage = async () => {
    try {
      await removeCover(hallId)
      toast.success("Cover image removed successfully")
      setShowRemoveCoverDialog(false)
      refetch()
    } catch (e: any) {
      toast.error("Failed to remove cover image")
    }
  }

  if (isLoading) return <p>Loading images...</p>

  return (
    <>
      <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Hall Images</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {images.length} image{images.length !== 1 ? "s" : ""} uploaded
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-2">
              {coverImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRemoveCoverDialog(true)}
                  className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Remove Cover
                </Button>
              )}
              <input
                id="upload"
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button
                onClick={() => document.getElementById("upload")?.click()}
                disabled={uploading}
                className="gap-2 shadow-sm hover:shadow-md transition-all"
                size="sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Images
                  </>
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 p-8 mb-4">
                <ImageIcon className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No images uploaded yet</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm text-balance">
                Upload images to showcase this hall. You can set one as the cover image.
              </p>
              {canManage && (
                <Button
                  onClick={() => document.getElementById("upload")?.click()}
                  disabled={uploading}
                  variant="default"
                  className="gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <Upload className="h-4 w-4" />
                  Upload Your First Image
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-square ring-1 ring-border/50 hover:ring-primary/50"
                  >
                    <img
                      src={img.image_url || "/placeholder.svg"}
                      alt="Hall image"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {coverImage === img.image_url && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="flex items-center gap-1.5 bg-linear-to-r from-amber-500 via-amber-600 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-white" />
                          Cover
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-3">
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 backdrop-blur-md bg-white/95 hover:bg-white shadow-lg border-0 h-9"
                          onClick={() => setSelectedImage(img.image_url)}
                        >
                          <Maximize2 className="h-4 w-4 mr-1.5" />
                          View
                        </Button>

                        {canManage && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              className={`backdrop-blur-md shadow-lg border-0 h-9 px-3 transition-all ${
                                coverImage === img.image_url
                                  ? "bg-amber-500/95 hover:bg-amber-600/95 text-white"
                                  : "bg-white/95 hover:bg-white"
                              }`}
                              onClick={() => setHallCoverImage(hallId, img.image_url)}
                            >
                              <Star className={`h-4 w-4 ${coverImage === img.image_url ? "fill-white" : ""}`} />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              className="backdrop-blur-md shadow-lg border-0 h-9 px-3 bg-red-500/95 hover:bg-red-600/95"
                              onClick={() => setImageToDelete(img)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent>
          <img src={selectedImage! || "/placeholder.svg"} className="w-full" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
        <DialogContent>
          <p>Delete this image permanently?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImageToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemoveCoverDialog} onOpenChange={setShowRemoveCoverDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Cover Image?</DialogTitle>
            <DialogDescription className="pt-2">
              This will remove the current cover image designation. The image will remain in the gallery.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRemoveCoverDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveCoverImage}>
              Remove Cover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

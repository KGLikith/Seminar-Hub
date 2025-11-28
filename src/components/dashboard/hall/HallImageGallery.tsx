import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, X, Eye, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface HallImageGalleryProps {
  hallId: string;
  canManage: boolean;
}

const HallImageGallery = ({ hallId, canManage }: HallImageGalleryProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [hallId]);

  const fetchImages = async () => {
    try {
    //   const { data, error } = await supabase.storage
    //     .from("hall-images")
    //     .list(hallId, {
    //       limit: 100,
    //       offset: 0,
    //       sortBy: { column: "created_at", order: "desc" },
    //     });

    //   if (error) throw error;

    //   if (data) {
        // const imageUrls = data
        //   .filter((file) => file.name !== ".emptyFolderPlaceholder")
        //   .map((file) => {
        //     const { data: { publicUrl } } = supabase.storage
        //       .from("hall-images")
        //       .getPublicUrl(`${hallId}/${file.name}`);
        //     return publicUrl;
        //   });
        // setImages(imageUrls);
    //   }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${hallId}/${fileName}`;

        // const { error } = await supabase.storage
        //   .from("hall-images")
        //   .upload(filePath, file, {
        //     cacheControl: "3600",
        //     upsert: false,
        //   });

        // if (error) throw error;
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} image(s) uploaded successfully`);
      fetchImages();
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images: " + error.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const fileName = imageUrl.split("/").pop();
      if (!fileName) return;

    //   const { error } = await supabase.storage
    //     .from("hall-images")
    //     .remove([`${hallId}/${fileName}`]);

    //   if (error) throw error;
      toast.success("Image deleted successfully");
      fetchImages();
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image: " + error.message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading images...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Hall Images
              </CardTitle>
              <CardDescription>
                {canManage
                  ? "Upload and manage images for this hall"
                  : "View images of this hall"}
              </CardDescription>
            </div>
            {canManage && (
              <div>
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={uploading}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Images"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((imageUrl, index) => (
                  <motion.div
                    key={imageUrl}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all duration-300"
                  >
                    <motion.img
                      src={imageUrl}
                      alt={`Hall image ${index + 1}`}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity"
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(imageUrl)}
                        className="opacity-90 hover:opacity-100"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(imageUrl)}
                          className="opacity-90 hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No images uploaded yet</p>
              {canManage && (
                <Button
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Image
                </Button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Full-screen image dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-auto rounded-lg"
              />
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HallImageGallery;

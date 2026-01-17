'use server'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });

const IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"]
const PDF_TYPES = ["application/pdf"]

export const getSignedURL = async (
  mediaType: string,
  mediaName: string,
  id: string,
  type: "booking" | "hall_image" | "booking_image"
) => {
  const allowed =
    type === "hall_image" ? IMAGE_TYPES: [...IMAGE_TYPES, ...PDF_TYPES]

  if (!allowed.includes(mediaType)) {
    console.error("Invalid media type:", mediaType, "for type:", type);
    throw new Error("Invalid media type");
  }

  const extension = mediaType.split("/")[1];

  const key = `uploads/${type}/${id}/${mediaName}-${Date.now()}.${extension}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
    ContentType: mediaType,
  });

  const signedUrl = await getSignedUrl(s3Client, putObjectCommand);

  return signedUrl;
};


export const deleteMedia = async (mediaUrl: string) => {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const key = decodeURIComponent(mediaUrl);
  const clean = key.startsWith("/") ? key.slice(1) : key;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: clean,
  });

  const del = await s3Client.send(command);
  return !!del.DeleteMarker || del.$metadata.httpStatusCode === 204;
};



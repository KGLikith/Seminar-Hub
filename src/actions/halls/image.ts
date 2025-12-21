"use server";

import prisma from "@/lib/db";
import { deleteMedia, getSignedURL } from "../aws/s3";


export async function getHallImages(hallId: string) {
  return prisma.hallImage.findMany({
    where: { hall_id: hallId },
    orderBy: { created_at: "desc" },
    select: { id: true, image_url: true },
  });
}

export async function getHallImageUploadUrl(
  fileType: string,
  fileName: string,
  hallId: string,
) {
  const signedUrl = await getSignedURL(
    fileType,
    fileName,
    hallId,
    "hall_image"
  );

  return signedUrl;
}

export async function saveHallImage(hallId: string, imageUrl: string) {
  await prisma.hallImage.create({
    data: {
      hall_id: hallId,
      image_url: imageUrl,
    },
  });
}

export async function deleteHallImage(
  hallId: string,
  imageId: string,
  imageUrl: string
) {
  await deleteMedia(imageUrl);
  await prisma.hallImage.delete({ where: { id: imageId } });

  const hall = await prisma.seminarHall.findUnique({ where: { id: hallId } });
  if (hall?.image_url === imageUrl) {
    const next = await prisma.hallImage.findFirst({
      where: { hall_id: hallId },
      orderBy: { created_at: "desc" },
    });

    await prisma.seminarHall.update({
      where: { id: hallId },
      data: { image_url: next?.image_url ?? null },
    });
  }
}

export async function setHallCoverImage(
  hallId: string,
  imageUrl: string
) {
  await prisma.seminarHall.update({
    where: { id: hallId },
    data: { image_url: imageUrl },
  });
}

export async function removeCover(hallId: string) {
  await prisma.seminarHall.update({
    where: { id: hallId },
    data: { image_url: null },
  });
}
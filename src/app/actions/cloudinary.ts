"use server";

import { requireAuth } from"@/lib/require-auth";
import { destroyCloudinaryImage as deleteImage } from"@/lib/cloudinary-server";

export async function deleteCloudinaryImage(url: string) {
 try {
 if (!url.startsWith("https://res.cloudinary.com/")) {
 return { success: false, error:"Invalid Cloudinary URL" };
 }

 await requireAuth();

 return await deleteImage(url);
 } catch (error) {
 console.error("Error deleting Cloudinary image:", error);
 if (error instanceof Error && error.message ==="No autorizado") {
 return { success: false, error:"No autorizado" };
 }
 return { success: false, error:"Server error" };
 }
}

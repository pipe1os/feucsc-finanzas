"use server";

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";
import { deleteCloudinaryImage as deleteImage } from "@/lib/cloudinary-server";

async function requireAuth() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAuthorizedEmail(user.email))) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function deleteCloudinaryImage(url: string) {
  try {
    if (!url || !url.startsWith("https://res.cloudinary.com/")) {
      return { success: false, error: "Invalid Cloudinary URL" };
    }

    await requireAuth();

    return await deleteImage(url);
  } catch (error) {
    console.error("Error deleting Cloudinary image:", error);
    return { success: false, error: "Server error" };
  }
}

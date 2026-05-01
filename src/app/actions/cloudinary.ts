"use server";

import crypto from "crypto";
import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";

async function requireAuth() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAuthorizedEmail(user.email)) {
    throw new Error("No autorizado");
  }
  return user;
}


// Extracts public_id from Cloudinary URL
function extractPublicId(url: string) {
  // e.g. https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/my_folder/my_image.jpg
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  
  const path = parts[1];
  const segments = path.split("/");
  if (segments[0].match(/^v\d+$/)) {
    segments.shift(); // remove version
  }
  const publicIdWithExt = segments.join("/");
  const lastDot = publicIdWithExt.lastIndexOf(".");
  if (lastDot !== -1) {
    return publicIdWithExt.substring(0, lastDot);
  }
  return publicIdWithExt;
}

export async function deleteCloudinaryImage(url: string) {
  try {
    await requireAuth();
    if (!url || !url.startsWith("https://res.cloudinary.com/")) {
      return { success: false, error: "Invalid Cloudinary URL" };
    }

    const publicId = extractPublicId(url);
    if (!publicId) return { success: false, error: "Invalid Cloudinary URL" };

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary credentials missing");
      return { success: false, error: "Server misconfiguration" };
    }

    const timestamp = Math.floor(new Date().getTime() / 1000).toString();

    // Create signature
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Failed to delete from Cloudinary:", errData);
      return { success: false, error: "Failed to delete" };
    }

    const result = await response.json();
    return { success: result.result === "ok" };
  } catch (error) {
    console.error("Error deleting Cloudinary image:", error);
    return { success: false, error: "Server error" };
  }
}

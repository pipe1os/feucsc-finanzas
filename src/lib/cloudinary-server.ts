import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export function extractPublicId(url: string) {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;

  const path = parts[1];
  const segments = path.split("/");
  if (segments[0].match(/^v\d+$/)) {
    segments.shift();
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
    const publicId = extractPublicId(url);
    if (!publicId) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(new Date().getTime() / 1000).toString();
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash("sha256")
        .update(stringToSign)
        .digest("hex");

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        console.error("Cloudinary delete failed:", await response.json());
      }
    } else {
      console.error("Cloudinary credentials missing for delete");
    }
  } catch (cloudErr) {
    console.error("Error cleaning up Cloudinary image:", cloudErr);
  }
}

export default cloudinary;

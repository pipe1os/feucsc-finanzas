import { v2 as cloudinary } from"cloudinary";

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY!,
 api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function extractPublicId(url: string) {
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

export async function destroyCloudinaryImage(url: string) {
 try {
 const publicId = extractPublicId(url);
 if (!publicId) {
 return { success: false, error:"Invalid Cloudinary URL" };
 }

 const result = await cloudinary.uploader.destroy(publicId);

 if (result.result !=="ok" && result.result !=="not found") {
 console.error("Cloudinary delete failed:", result);
 return { success: false, error:"Failed to delete" };
 }

 return { success: true };
 } catch (cloudErr) {
 console.error("Error cleaning up Cloudinary image:", cloudErr);
 return { success: false, error:"Server error" };
 }
}

export default cloudinary;

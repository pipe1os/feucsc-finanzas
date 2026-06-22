import { describe, it, expect, vi, beforeEach } from "vitest";
import { destroyCloudinaryImage } from "@/lib/cloudinary-server";
import { v2 as cloudinary } from "cloudinary";

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: vi.fn(),
    },
  },
}));

describe("destroyCloudinaryImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract publicId correctly and delete the image", async () => {
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: "ok" });
    
    const url = "https://res.cloudinary.com/demo/image/upload/v1234567890/test-comprobantes/mi-foto.jpg";
    const result = await destroyCloudinaryImage(url);
    
    expect(result).toEqual({ success: true });
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("test-comprobantes/mi-foto");
  });

  it("should return false if url is invalid", async () => {
    const url = "https://example.com/not-cloudinary.jpg";
    const result = await destroyCloudinaryImage(url);
    
    expect(result).toEqual({ success: false, error: "Invalid Cloudinary URL" });
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });

  it("should handle cloudinary error responses", async () => {
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: "error", error: { message: "Not found" } });
    
    const url = "https://res.cloudinary.com/demo/image/upload/v1234567890/test/fail.jpg";
    const result = await destroyCloudinaryImage(url);
    
    expect(result).toEqual({ success: false, error: "Failed to delete" });
  });

  it("should catch exceptions", async () => {
    vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(new Error("Network error"));
    
    const url = "https://res.cloudinary.com/demo/image/upload/test/crash.jpg";
    const result = await destroyCloudinaryImage(url);
    
    expect(result).toEqual({ success: false, error: "Server error" });
  });
});

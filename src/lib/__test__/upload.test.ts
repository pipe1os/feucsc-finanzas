import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase-auth", () => ({
  createAuthClient: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  isAuthorizedEmail: vi.fn(),
}));

vi.mock("@/lib/cloudinary-server", () => ({
  default: {
    uploader: {
      upload: vi.fn(),
    },
  },
}));

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary-server";
import { uploadComprobanteAction } from "@/app/actions/upload";

function makeFile(bytes: number[], type = "image/jpeg", size?: number): File {
  const arr = new Uint8Array(bytes);
  const blob = new Blob([arr], { type });
  const file = new File([blob], "test.jpg", { type });
  if (size) Object.defineProperty(file, "size", { value: size });
  return file;
}

const JPEG_BYTES = [0xff, 0xd8, 0xff, 0x00];

beforeEach(() => {
  vi.mocked(createAuthClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { email: "admin@feucsc.cl" } },
      }),
    },
  } as any);

  vi.mocked(isAuthorizedEmail).mockResolvedValue(true);

  vi.mocked(cloudinary.uploader.upload).mockResolvedValue({
    secure_url: "https://res.cloudinary.com/test/comprobantes/test.jpg",
  } as any);
});

describe("uploadComprobanteAction", () => {
  it("error si no hay archivo en el FormData", async () => {
    const formData = new FormData();
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "No se proporcionó ningún archivo",
    );
  });

  it("error si el archivo supera 5MB", async () => {
    const file = makeFile(JPEG_BYTES, "image/jpeg", 6 * 1024 * 1024);
    const formData = new FormData();
    formData.append("file", file);
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "El archivo excede el límite de 5 MB",
    );
  });

  it("lanza error si el MIME no es imagen", async () => {
    const file = new File(["contenido"], "doc.pdf", {
      type: "application/pdf",
    });
    const formData = new FormData();
    formData.append("file", file);
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "Solo se permiten archivos de imagen",
    );
  });

  it("lanza error si los magic bytes no corresponden a una imagen", async () => {
    const file = makeFile([0x00, 0x00, 0x00, 0x00], "image/jpeg");
    const formData = new FormData();
    formData.append("file", file);
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "Solo se permiten archivos de imagen válidos",
    );
  });

  it("lanza error si el usuario no está autenticado", async () => {
    vi.mocked(createAuthClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const file = makeFile(JPEG_BYTES);
    const formData = new FormData();
    formData.append("file", file);
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "No autorizado",
    );
  });

  it("error si el usuario no está en la lista de admins", async () => {
    vi.mocked(isAuthorizedEmail).mockResolvedValue(false);

    const file = makeFile(JPEG_BYTES);
    const formData = new FormData();
    formData.append("file", file);
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "No autorizado",
    );
  });

  it("retorna la URL si todo es válido", async () => {
    const file = makeFile(JPEG_BYTES);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadComprobanteAction(formData);
    expect(result).toBe(
      "https://res.cloudinary.com/test/comprobantes/test.jpg",
    );
  });

  it(" error si Cloudinary no retorna secure_url", async () => {
    vi.mocked(cloudinary.uploader.upload).mockResolvedValue({} as any);

    const file = makeFile(JPEG_BYTES);
    const formData = new FormData();
    formData.append("file", file);
    await expect(uploadComprobanteAction(formData)).rejects.toThrow(
      "Cloudinary no devolvió una URL válida",
    );
  });
});

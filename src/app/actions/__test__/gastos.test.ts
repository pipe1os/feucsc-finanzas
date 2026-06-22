import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createGasto,
  updateGasto,
  deleteGasto,
  createCategoria,
  deleteCategoria,
} from "@/app/actions/gastos";
import { supabaseServer } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { destroyCloudinaryImage } from "@/lib/cloudinary-server";

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: {
    client: {
      from: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase-auth", () => ({
  createAuthClient: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  isAuthorizedEmail: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/cloudinary-server", () => ({
  destroyCloudinaryImage: vi.fn(),
}));

describe("gastos server actions", () => {
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockSelect = vi.fn();
  
  const mockEqUpdate = vi.fn();
  const mockEqDelete = vi.fn();
  const mockEqSelect = vi.fn();
  const mockSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase chaining mocks
    vi.mocked(supabaseServer.client.from).mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      select: mockSelect,
    } as unknown as ReturnType<typeof supabaseServer.client.from>);

    mockUpdate.mockReturnValue({ eq: mockEqUpdate });
    mockDelete.mockReturnValue({ eq: mockEqDelete });
    mockSelect.mockReturnValue({ eq: mockEqSelect });
    mockEqSelect.mockReturnValue({ single: mockSingle });

    // Default: Insert succeeds
    mockInsert.mockResolvedValue({ error: null });
    // Default: Update succeeds
    mockEqUpdate.mockResolvedValue({ error: null });
    // Default: Delete succeeds
    mockEqDelete.mockResolvedValue({ error: null });
    
    mockSingle.mockResolvedValue({ data: { comprobante_url: null } });

    // Setup Auth mocks
    vi.mocked(createAuthClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { email: "admin@feucsc.cl" } },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createAuthClient>>);
    vi.mocked(isAuthorizedEmail).mockResolvedValue(true);
  });

  describe("createGasto", () => {
    it("should successfully create a gasto and revalidate", async () => {
      const formData = new FormData();
      formData.append("fecha", "2026-06-22");
      formData.append("descripcion", "Pizza");
      formData.append("categoria", "Comida");
      formData.append("monto", "10000");

      await createGasto(formData);

      expect(mockInsert).toHaveBeenCalledWith({
        fecha: "2026-06-22",
        descripcion: "Pizza",
        categoria: "Comida",
        monto: 10000,
        comprobante_url: null,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/gastos");
    });

    it("should fail validation if fields are missing", async () => {
      const formData = new FormData();
      await expect(createGasto(formData)).rejects.toThrow("Fecha es requerida");
    });
    
    it("should fail validation if URL is invalid", async () => {
      const formData = new FormData();
      formData.append("fecha", "2026-06-22");
      formData.append("descripcion", "Pizza");
      formData.append("categoria", "Comida");
      formData.append("monto", "10000");
      formData.append("comprobante_url", "https://not-cloudinary.com/img.jpg");
      await expect(createGasto(formData)).rejects.toThrow("URL de comprobante inválida");
    });

    it("should fail if unauthenticated", async () => {
      vi.mocked(isAuthorizedEmail).mockResolvedValue(false);
      const formData = new FormData();
      formData.append("fecha", "2026-06-22");
      formData.append("descripcion", "Pizza");
      formData.append("categoria", "Comida");
      formData.append("monto", "10000");
      
      await expect(createGasto(formData)).rejects.toThrow("No autorizado");
    });
  });

  describe("updateGasto", () => {
    it("should update a gasto correctly", async () => {
      const formData = new FormData();
      formData.append("id", "00000000-0000-0000-0000-000000000000");
      formData.append("fecha", "2026-06-22");
      formData.append("descripcion", "PizzaEdit");
      formData.append("categoria", "Comida");
      formData.append("monto", "15000");

      await updateGasto(formData);

      expect(mockUpdate).toHaveBeenCalledWith({
        fecha: "2026-06-22",
        descripcion: "PizzaEdit",
        categoria: "Comida",
        monto: 15000,
        comprobante_url: null,
      });
      expect(mockEqUpdate).toHaveBeenCalledWith("id", "00000000-0000-0000-0000-000000000000");
    });
  });

  describe("deleteGasto", () => {
    it("should delete gasto and remove image from Cloudinary if applicable", async () => {
      mockSingle.mockResolvedValue({ 
        data: { comprobante_url: "https://res.cloudinary.com/demo/image/upload/test.jpg" } 
      });

      await deleteGasto("00000000-0000-0000-0000-000000000000");

      expect(destroyCloudinaryImage).toHaveBeenCalledWith("https://res.cloudinary.com/demo/image/upload/test.jpg");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEqDelete).toHaveBeenCalledWith("id", "00000000-0000-0000-0000-000000000000");
    });

    it("should delete gasto without calling cloudinary if no image", async () => {
      mockSingle.mockResolvedValue({ data: null });

      await deleteGasto("00000000-0000-0000-0000-000000000000");

      expect(destroyCloudinaryImage).not.toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe("createCategoria", () => {
    it("should insert a category", async () => {
      await createCategoria("Testing", "#FFFFFF");

      expect(mockInsert).toHaveBeenCalledWith({
        nombre: "Testing",
        color: "#FFFFFF",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/gastos");
    });
  });

  describe("deleteCategoria", () => {
    it("should reassign gastos to N/A and delete category", async () => {
      await deleteCategoria("Testing");

      // Verify update
      expect(mockUpdate).toHaveBeenCalledWith({ categoria: "N/A" });
      expect(mockEqUpdate).toHaveBeenCalledWith("categoria", "Testing");

      // Verify delete
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEqDelete).toHaveBeenCalledWith("nombre", "Testing");
    });
  });
});

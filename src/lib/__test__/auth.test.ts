import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { isAuthorizedEmail } from "@/lib/auth";

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

beforeEach(() => {
  vi.mocked(createClient).mockReturnValue({
    from: mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  } as unknown as ReturnType<typeof createClient>);
});

describe("isAuthorizedEmail", () => {
  it("retorna false si el email es null", async () => {
    expect(await isAuthorizedEmail(null)).toBe(false);
  });

  it("retorna false si el email es undefined", async () => {
    expect(await isAuthorizedEmail(undefined)).toBe(false);
  });

  it("retorna false si el email es string vacío", async () => {
    expect(await isAuthorizedEmail("")).toBe(false);
  });

  it("retorna false si Supabase retorna error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("not found") });
    expect(await isAuthorizedEmail("alguien@test.com")).toBe(false);
  });

  it("retorna false si no hay data", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    expect(await isAuthorizedEmail("alguien@test.com")).toBe(false);
  });

  it("retorna true si el email existe en la tabla admins", async () => {
    mockSingle.mockResolvedValue({
      data: { email: "farce@ing.ucsc.cl" },
      error: null,
    });
    expect(await isAuthorizedEmail("farce@ing.ucsc.cl")).toBe(true);
  });
});

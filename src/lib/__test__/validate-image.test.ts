import { describe, it, expect } from "vitest";
import { isValidImage } from "@/lib/validate-image";

describe("isValidImage", () => {
  it("rechaza un array vacío", () => {
    expect(isValidImage(new Uint8Array([]))).toBe(false);
  });

  it("rechaza bytes que no corresponden a ningún formato", () => {
    expect(isValidImage(new Uint8Array([0x00, 0x00, 0x00, 0x00]))).toBe(false);
  });

  it("acepta un JPEG válido", () => {
    expect(isValidImage(new Uint8Array([0xff, 0xd8, 0xff, 0x00]))).toBe(true);
  });

  it("acepta un PNG válido", () => {
    expect(isValidImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
  });

  it("acepta un GIF válido", () => {
    expect(isValidImage(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBe(true);
  });

  it("acepta un WebP válido", () => {
    const bytes = new Uint8Array(12);
    bytes[0] = 0x52;
    bytes[1] = 0x49;
    bytes[2] = 0x46;
    bytes[3] = 0x46;
    bytes[8] = 0x57;
    bytes[9] = 0x45;
    bytes[10] = 0x42;
    bytes[11] = 0x50;
    expect(isValidImage(bytes)).toBe(true);
  });

  it("rechaza un WebP con menos de 12 bytes", () => {
    const bytes = new Uint8Array(8);
    bytes[0] = 0x52;
    bytes[1] = 0x49;
    bytes[2] = 0x46;
    bytes[3] = 0x46;
    expect(isValidImage(bytes)).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import {
  validateFileSize,
  validateMagicBytes,
  validateFileExtension,
  validateFile,
} from "../validate-hwp";

function createMockFile(
  bytes: Uint8Array,
  name: string,
  sizeOverride?: number
): File {
  const file = new File([bytes as BlobPart], name, { type: "application/octet-stream" });
  if (sizeOverride !== undefined) {
    Object.defineProperty(file, "size", { value: sizeOverride });
  }
  return file;
}

const OLE2_MAGIC = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ZIP_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

describe("validateFileSize", () => {
  it("returns valid for file under 100MB", () => {
    const file = createMockFile(new Uint8Array(1), "test.hwp", 1024);
    expect(validateFileSize(file)).toEqual({ valid: true });
  });

  it("returns invalid for file over 100MB", () => {
    const file = createMockFile(new Uint8Array(1), "test.hwp", 100 * 1024 * 1024 + 1);
    expect(validateFileSize(file)).toEqual({
      valid: false,
      error: "파일 크기가 100MB를 초과합니다",
    });
  });

  it("returns valid for file exactly 100MB", () => {
    const file = createMockFile(new Uint8Array(1), "test.hwp", 100 * 1024 * 1024);
    expect(validateFileSize(file)).toEqual({ valid: true });
  });
});

describe("validateMagicBytes", () => {
  it("returns valid for OLE2 magic bytes (HWP)", async () => {
    const file = createMockFile(OLE2_MAGIC, "test.hwp");
    expect(await validateMagicBytes(file)).toEqual({ valid: true });
  });

  it("returns valid for ZIP magic bytes (HWPX)", async () => {
    const file = createMockFile(ZIP_MAGIC, "test.hwpx");
    expect(await validateMagicBytes(file)).toEqual({ valid: true });
  });

  it("returns invalid for PDF magic bytes", async () => {
    const file = createMockFile(PDF_MAGIC, "test.hwp");
    expect(await validateMagicBytes(file)).toEqual({
      valid: false,
      error: "유효한 HWP/HWPX 파일이 아닙니다",
    });
  });

  it("returns invalid for empty/short file", async () => {
    const file = createMockFile(new Uint8Array(0), "test.hwp");
    expect(await validateMagicBytes(file)).toEqual({
      valid: false,
      error: "유효한 HWP/HWPX 파일이 아닙니다",
    });
  });
});

describe("validateFileExtension", () => {
  it("returns valid for .hwp", () => {
    const file = createMockFile(new Uint8Array(1), "document.hwp");
    expect(validateFileExtension(file)).toEqual({ valid: true });
  });

  it("returns valid for .hwpx", () => {
    const file = createMockFile(new Uint8Array(1), "document.hwpx");
    expect(validateFileExtension(file)).toEqual({ valid: true });
  });

  it("returns valid for .HWP (case insensitive)", () => {
    const file = createMockFile(new Uint8Array(1), "document.HWP");
    expect(validateFileExtension(file)).toEqual({ valid: true });
  });

  it("returns invalid for .doc", () => {
    const file = createMockFile(new Uint8Array(1), "document.doc");
    expect(validateFileExtension(file)).toEqual({
      valid: false,
      error: "HWP 또는 HWPX 파일만 업로드 가능합니다",
    });
  });
});

describe("validateFile", () => {
  it("returns valid for valid HWP file", async () => {
    const file = createMockFile(OLE2_MAGIC, "document.hwp", 1024);
    expect(await validateFile(file)).toEqual({ valid: true });
  });

  it("returns first error for invalid extension", async () => {
    const file = createMockFile(OLE2_MAGIC, "document.doc", 1024);
    const result = await validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("HWP 또는 HWPX 파일만 업로드 가능합니다");
  });

  it("checks extension first, then size, then magic bytes", async () => {
    // File with wrong extension AND over size - should get extension error
    const file = createMockFile(PDF_MAGIC, "doc.pdf", 200 * 1024 * 1024);
    const result = await validateFile(file);
    expect(result.error).toBe("HWP 또는 HWPX 파일만 업로드 가능합니다");

    // File with correct extension but over size - should get size error
    const file2 = createMockFile(OLE2_MAGIC, "doc.hwp", 200 * 1024 * 1024);
    const result2 = await validateFile(file2);
    expect(result2.error).toBe("파일 크기가 100MB를 초과합니다");
  });
});

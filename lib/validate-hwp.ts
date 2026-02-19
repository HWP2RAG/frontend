export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const XML_MAGIC = [0x3c, 0x3f, 0x78, 0x6d, 0x6c]; // <?xml — HWPML

export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "파일 크기가 100MB를 초과합니다" };
  }
  return { valid: true };
}

export async function validateMagicBytes(file: File): Promise<ValidationResult> {
  const headerSize = Math.max(OLE2_MAGIC.length, ZIP_MAGIC.length, 3 + XML_MAGIC.length); // 3 = UTF-8 BOM
  const slice = file.slice(0, headerSize);
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(slice);
  });
  const bytes = new Uint8Array(buffer);

  if (bytes.length === 0) {
    return { valid: false, error: "유효한 HWP/HWPX 파일이 아닙니다" };
  }

  const isOLE2 =
    bytes.length >= OLE2_MAGIC.length &&
    OLE2_MAGIC.every((b, i) => bytes[i] === b);

  const isZIP =
    bytes.length >= ZIP_MAGIC.length &&
    ZIP_MAGIC.every((b, i) => bytes[i] === b);

  // HWPML may start with UTF-8 BOM (EF BB BF) before <?xml
  const xmlOffset =
    bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0;
  const isXML =
    bytes.length >= xmlOffset + XML_MAGIC.length &&
    XML_MAGIC.every((b, i) => bytes[xmlOffset + i] === b);

  if (isOLE2 || isZIP || isXML) {
    return { valid: true };
  }

  return { valid: false, error: "유효한 HWP/HWPX 파일이 아닙니다" };
}

export function validateFileExtension(file: File): ValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "hwp" || ext === "hwpx" || ext === "hwpml") {
    return { valid: true };
  }
  return { valid: false, error: "HWP 또는 HWPX 파일만 업로드 가능합니다" };
}

export async function validateFile(file: File): Promise<ValidationResult> {
  const extResult = validateFileExtension(file);
  if (!extResult.valid) return extResult;

  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) return sizeResult;

  const magicResult = await validateMagicBytes(file);
  if (!magicResult.valid) return magicResult;

  return { valid: true };
}

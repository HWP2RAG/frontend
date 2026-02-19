import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadChunked } from "@/lib/upload-chunked";

describe("uploadChunked", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls init, chunk, and complete for a small file (1 chunk)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const file = new File(["hello world"], "test.hwp", {
      type: "application/octet-stream",
    });
    const onProgress = vi.fn();

    const result = await uploadChunked(file, { onProgress });

    // init call
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy.mock.calls[0][0]).toContain("/api/upload/init");

    // chunk call
    expect(fetchSpy.mock.calls[1][0]).toContain("/api/upload/upload-abc-123/chunk");

    // complete call
    expect(fetchSpy.mock.calls[2][0]).toContain("/api/upload/upload-abc-123/complete");

    expect(onProgress).toHaveBeenCalledWith(100);
    expect(result.uploadId).toBe("upload-abc-123");
    expect(result.status).toBe("uploaded");
    expect(result.conversionId).toBe("conv-001");
  });

  it("uploads multiple chunks for a larger file", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    // Create a file just over 5MB to require 2 chunks
    const size = 5 * 1024 * 1024 + 100;
    const buf = new ArrayBuffer(size);
    const file = new File([buf], "big.hwp", {
      type: "application/octet-stream",
    });
    const onProgress = vi.fn();

    await uploadChunked(file, { onProgress });

    // init + 2 chunks + complete = 4 calls
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(fetchSpy.mock.calls[1][0]).toContain("/chunk");
    expect(fetchSpy.mock.calls[2][0]).toContain("/chunk");

    // Progress reported after each chunk
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("supports abort signal", async () => {
    const controller = new AbortController();
    controller.abort();
    const file = new File(["data"], "test.hwp");

    await expect(
      uploadChunked(file, { signal: controller.signal })
    ).rejects.toThrow();
  });

  it("sends outputFormat in init request body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const file = new File(["hello"], "test.hwp", {
      type: "application/octet-stream",
    });

    await uploadChunked(file, { outputFormat: "json" });

    // Verify init request contains outputFormat
    const initCall = fetchSpy.mock.calls[0];
    const initOptions = initCall[1] as RequestInit;
    const body = JSON.parse(initOptions.body as string);
    expect(body.outputFormat).toBe("json");
  });

  it("defaults outputFormat to markdown", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const file = new File(["hello"], "test.hwp", {
      type: "application/octet-stream",
    });

    await uploadChunked(file);

    const initCall = fetchSpy.mock.calls[0];
    const initOptions = initCall[1] as RequestInit;
    const body = JSON.parse(initOptions.body as string);
    expect(body.outputFormat).toBe("markdown");
  });
});

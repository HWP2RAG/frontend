import { describe, it, expect, beforeEach } from "vitest";
import { useUploadStore } from "../upload-store";

function createMockFile(name: string): File {
  return new File([new Uint8Array(8)], name, { type: "application/octet-stream" });
}

describe("useUploadStore", () => {
  beforeEach(() => {
    useUploadStore.getState().reset();
  });

  describe("addFiles", () => {
    it("adds files with status pending, progress 0, and generated id", () => {
      const file = createMockFile("test.hwp");
      useUploadStore.getState().addFiles([file]);
      const files = useUploadStore.getState().files;
      expect(files).toHaveLength(1);
      expect(files[0].file).toBe(file);
      expect(files[0].status).toBe("pending");
      expect(files[0].progress).toBe(0);
      expect(files[0].id).toBeDefined();
      expect(typeof files[0].id).toBe("string");
    });

    it("blocks adding when already at 3 files", () => {
      const files = [createMockFile("a.hwp"), createMockFile("b.hwp"), createMockFile("c.hwp")];
      useUploadStore.getState().addFiles(files);
      expect(useUploadStore.getState().files).toHaveLength(3);

      useUploadStore.getState().addFiles([createMockFile("d.hwp")]);
      expect(useUploadStore.getState().files).toHaveLength(3);
      expect(useUploadStore.getState().lastError).toBe("최대 3개의 파일만 업로드할 수 있습니다");
    });

    it("blocks adding if total would exceed 3", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp"), createMockFile("b.hwp")]);
      expect(useUploadStore.getState().files).toHaveLength(2);

      useUploadStore.getState().addFiles([createMockFile("c.hwp"), createMockFile("d.hwp")]);
      expect(useUploadStore.getState().files).toHaveLength(2);
      expect(useUploadStore.getState().lastError).toBe("최대 3개의 파일만 업로드할 수 있습니다");
    });

    it("generates unique ids for each file", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp"), createMockFile("b.hwp")]);
      const files = useUploadStore.getState().files;
      expect(files[0].id).not.toBe(files[1].id);
    });
  });

  describe("removeFile", () => {
    it("removes file by id", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp")]);
      const id = useUploadStore.getState().files[0].id;
      useUploadStore.getState().removeFile(id);
      expect(useUploadStore.getState().files).toHaveLength(0);
    });

    it("no-ops for non-existent id", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp")]);
      useUploadStore.getState().removeFile("non-existent");
      expect(useUploadStore.getState().files).toHaveLength(1);
    });
  });

  describe("updateProgress", () => {
    it("updates progress for a specific file", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp")]);
      const id = useUploadStore.getState().files[0].id;
      useUploadStore.getState().updateProgress(id, 50);
      expect(useUploadStore.getState().files[0].progress).toBe(50);
    });

    it("clamps progress between 0 and 100", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp")]);
      const id = useUploadStore.getState().files[0].id;
      useUploadStore.getState().updateProgress(id, 150);
      expect(useUploadStore.getState().files[0].progress).toBe(100);
      useUploadStore.getState().updateProgress(id, -10);
      expect(useUploadStore.getState().files[0].progress).toBe(0);
    });
  });

  describe("setFileStatus", () => {
    it("sets status for a file", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp")]);
      const id = useUploadStore.getState().files[0].id;
      useUploadStore.getState().setFileStatus(id, "uploading");
      expect(useUploadStore.getState().files[0].status).toBe("uploading");
    });

    it("sets status to error with error message", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp")]);
      const id = useUploadStore.getState().files[0].id;
      useUploadStore.getState().setFileStatus(id, "error", "Upload failed");
      const file = useUploadStore.getState().files[0];
      expect(file.status).toBe("error");
      expect(file.error).toBe("Upload failed");
    });
  });

  describe("reset", () => {
    it("clears all files back to empty array", () => {
      useUploadStore.getState().addFiles([createMockFile("a.hwp"), createMockFile("b.hwp")]);
      expect(useUploadStore.getState().files).toHaveLength(2);
      useUploadStore.getState().reset();
      expect(useUploadStore.getState().files).toHaveLength(0);
    });
  });
});

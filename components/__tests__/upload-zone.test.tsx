import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadZone } from "@/components/upload-zone";
import { useUploadStore } from "@/stores/upload-store";

describe("UploadZone", () => {
  beforeEach(() => {
    useUploadStore.getState().reset();
  });

  it("renders large drop zone when no files", () => {
    render(<UploadZone />);
    expect(
      screen.getByText("HWP 파일을 드래그하거나 클릭하여 선택하세요")
    ).toBeTruthy();
  });

  it("shows compact state when files exist", () => {
    useUploadStore
      .getState()
      .addFiles([new File(["data"], "test.hwp")]);

    render(<UploadZone />);
    expect(screen.getByText("+ 파일 추가")).toBeTruthy();
  });

  it("adds files via input change", () => {
    render(<UploadZone />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;

    const file = new File(["data"], "test.hwp");
    fireEvent.change(input, { target: { files: [file] } });

    expect(useUploadStore.getState().files).toHaveLength(1);
    expect(useUploadStore.getState().files[0].file.name).toBe("test.hwp");
  });

  it("shows upload button when pending files exist", () => {
    useUploadStore
      .getState()
      .addFiles([new File(["data"], "test.hwp")]);

    render(<UploadZone />);
    expect(screen.getByText("변환하기")).toBeTruthy();
  });

  it("hides upload button when no pending files", () => {
    render(<UploadZone />);
    expect(screen.queryByText("변환하기")).toBeNull();
  });
});

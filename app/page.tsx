import { UploadZone } from "@/components/upload-zone";
import { FileList } from "@/components/file-list";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-8 flex-1">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            HWP 문서를 <span className="text-primary">RAG</span>에 최적화
          </h1>
          <p className="text-muted">
            HWP 파일을 업로드하면 RAG 파이프라인에 적합한 형태로 변환해 드립니다
          </p>
        </div>
        <UploadZone />
        <FileList />
      </div>
    </main>
  );
}

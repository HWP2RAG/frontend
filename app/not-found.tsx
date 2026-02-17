import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center p-8 flex-1 gap-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h2>
      <p className="text-muted max-w-md">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Button asChild className="mt-2 bg-primary hover:bg-primary-dark text-white">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </main>
  );
}

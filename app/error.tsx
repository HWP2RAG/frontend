"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center p-8 flex-1 gap-4 text-center">
      <h1 className="text-4xl font-bold text-red-500">오류 발생</h1>
      <p className="text-muted max-w-md">
        예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button onClick={reset} className="mt-2 bg-primary hover:bg-primary-dark text-white">
        다시 시도
      </Button>
    </main>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ResultLoading() {
  return (
    <main className="flex flex-col p-8 flex-1">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-80" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}

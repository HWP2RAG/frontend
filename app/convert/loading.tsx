import { Skeleton } from "@/components/ui/skeleton";

export default function ConvertLoading() {
  return (
    <main className="flex flex-col items-center justify-center p-8 flex-1">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </main>
  );
}

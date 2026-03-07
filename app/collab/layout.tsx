"use client";

import { LoginButton } from "@/components/login-button";

export default function CollabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="shrink-0 border-b px-4 py-2 flex items-center justify-between bg-card">
        <span className="text-sm font-medium text-muted-foreground">
          HWPX 협업
        </span>
        <LoginButton />
      </header>
      {children}
    </div>
  );
}

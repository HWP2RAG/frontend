"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/docs/getting-started", label: "시작하기" },
  { href: "/docs/api", label: "API Reference" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] gap-8 px-4 py-8">
      <aside className="hidden md:block w-56 shrink-0">
        <nav className="sticky top-20 space-y-1">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">문서</p>
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm hover:bg-accent",
                pathname === link.href && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

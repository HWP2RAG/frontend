"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginButton } from "@/components/login-button";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/convert", label: "변환하기" },
  // MVP hidden — unhide when ready:
  // { href: "/pricing", label: "가격" },
  // { href: "/docs/getting-started", label: "API Docs" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-bold shadow-sm">
            H
          </div>
          <span className="text-lg font-bold tracking-tight">
            HWPto<span className="text-primary">RAG</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "text-muted hover:text-foreground hover:bg-primary-50 transition-colors",
                pathname === item.href &&
                  "bg-primary-50 text-primary font-medium"
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <div className="ml-2 border-l border-border pl-2 flex items-center gap-2">
            <LoginButton />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </Button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border px-4 py-2 space-y-1 bg-surface">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-primary-50 hover:text-primary transition-colors",
                pathname === item.href &&
                  "bg-primary-50 text-primary font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="px-3 py-2">
            <LoginButton />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
            <span>테마</span>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}

"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { user, isLoggedIn, login, logout } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const hydrated = useAuthHydration();

  if (!hydrated) {
    return <div className="h-10 w-24" />;
  }

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-2">
        {user.picture && (
          <Image
            src={user.picture}
            alt={user.name}
            width={28}
            height={28}
            className="rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
        <Button variant="ghost" size="sm" onClick={logout} aria-label="로그아웃">
          로그아웃
        </Button>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={
        isDark
          ? "inline-flex overflow-hidden rounded-full bg-[#131314]"
          : "inline-flex"
      }
    >
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            login(credentialResponse.credential);
          }
        }}
        onError={() => {
          console.error("Google login failed");
        }}
        size="medium"
        shape="pill"
        theme={isDark ? "filled_black" : "outline"}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

function useHasHydrated() {
  return useSyncExternalStore(
    (cb) => {
      const unsub = useAuthStore.persist.onFinishHydration(cb);
      return unsub;
    },
    () => useAuthStore.persist.hasHydrated(),
    () => false
  );
}

export function LoginButton() {
  const { user, isLoggedIn, login, logout } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const hasHydrated = useHasHydrated();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !hasHydrated) {
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

  return (
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
      theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
    />
  );
}

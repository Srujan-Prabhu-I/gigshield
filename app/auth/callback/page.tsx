"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuth = async () => {
      // Extract the PKCE code from the URL
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth exchange error:", error);
          // Hard redirect so stale state is cleared
          window.location.href = "/";
          return;
        }
      }

      // If the user came through a role-specific login, persist that role
      const intendedRole = typeof window !== "undefined" ? window.localStorage.getItem("intendedRole") : null

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error("Auth exchange error:", error)
          window.location.href = "/login"
          return
        }
      }

      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (user && intendedRole) {
        // write the role to database so auth, middleware and GraphQL can resolve immediately
        try {
          await (await import("@/lib/supabase-auth")).setUserRole(user.id, intendedRole)
        } catch (err) {
          console.error("Failed to persist role from callback:", err)
        }
      }

      // Clear transient context to avoid old state interfering
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("intendedRole")
      }

      const nextPath = intendedRole === "worker"
        ? "/worker"
        : intendedRole === "platform"
        ? "/platform"
        : intendedRole === "government"
        ? "/government"
        : "/select-role"

      window.location.href = nextPath
    };

    handleAuth();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-white bg-[#0e0e0e] font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#3fe56c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-bold tracking-tight">Verifying your identity...</p>
      </div>
    </div>
  );
}

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

      // Hard redirect ensures the new session cookie is sent with the next request
      // so middleware can read it and route the user to the correct portal
      window.location.href = "/select-role";
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

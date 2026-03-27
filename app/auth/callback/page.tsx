"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!error && data.session) {
        console.log("User verified:", data.session.user);
        router.push("/");
      } else {
        console.error("Auth error:", error);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-white bg-[#0e0e0e] font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#3fe56c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-bold tracking-tight">Verifying your identity...</p>
      </div>
    </div>
  );
}

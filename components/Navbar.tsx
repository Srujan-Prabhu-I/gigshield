"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ShieldCheck } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { user, role, mounted, signOut } = useAuth()

  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "Check My Pay", href: "/checker" },
    { name: "Exploitation Index", href: "/leaderboard" },
  ]
  const workerLinks = [
    { name: "Home", href: "/worker" },
    { name: "Marketplace", href: "/worker/marketplace" },
    { name: "Check My Pay", href: "/worker/checker" },
    { name: "My Rights", href: "/worker/rights" },
  ]
  const platformLinks = [
    { name: "Home", href: "/platform" },
    { name: "Audit", href: "/platform/audit" },
    { name: "Competitors", href: "/platform/competitors" },
    { name: "Trends", href: "/platform/trends" },
  ]
  const governmentLinks = [
    { name: "Command Center", href: "/govt" },
    { name: "Complaints", href: "/govt/complaints" },
    { name: "Compliance", href: "/govt/compliance" },
    { name: "Policy", href: "/govt/policy" },
  ]

  const navLinks = !user
    ? publicLinks
    : role === "worker"
      ? workerLinks
      : role === "platform"
        ? platformLinks
        : governmentLinks

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className="bg-[#0e0e0e]/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        <Link href={!user ? "/" : role === "worker" ? "/worker" : role === "platform" ? "/platform" : (role === "govt" || role === "government") ? "/govt" : "/"} className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#3fe56c] to-[#00c853] shadow-[0_0_15px_rgba(63,229,108,0.3)] group-hover:shadow-[0_0_20px_rgba(63,229,108,0.5)] transition-all">
            <ShieldCheck className="h-6 w-6 text-black fill-black/10" />
            <div className="absolute inset-0 rounded-xl border border-white/20" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            Gig<span className="text-[#3fe56c]">Shield</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-1 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center h-full px-4 text-sm font-medium transition-colors relative ${
                  isActive ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3fe56c] shadow-[0_0_10px_rgba(63,229,108,0.5)]" />
                )}
              </Link>
            )
          })}
          <div className="pl-6 flex items-center h-full">
            {mounted && (
              <>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="mr-3 px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login" className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#3fe56c] text-black hover:bg-[#37cf61] transition-colors">
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center">
          {mounted && user ? (
            <button onClick={handleLogout} className="mr-2 px-2.5 py-1 text-[11px] font-bold rounded-md border border-neutral-700 text-neutral-300">
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login" className="px-2 py-1 text-[11px] font-bold rounded-md border border-neutral-700 text-neutral-300">
                Login
              </Link>
              <Link href="/register" className="px-2 py-1 text-[11px] font-bold rounded-md bg-[#3fe56c] text-black">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

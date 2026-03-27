"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { setUserRole } from "@/lib/supabase-auth"
import { ShieldCheck, User, Building2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SelectRolePage() {
  const { user, role } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if user not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/")
    }
  }, [user, router])

  // Redirect if role already set
  useEffect(() => {
    if (role) {
      if (role === "worker") router.push("/checker")
      else if (role === "platform") router.push("/platform-portal")
      // Add more redirects as needed
    }
  }, [role, router])

  const handleSelectRole = async (selectedRole: string) => {
    if (!user) {
      toast.error("You must be logged in")
      return
    }

    setIsSubmitting(true)
    
    try {
      const { error } = await setUserRole(user.id, selectedRole)
      
      if (error) {
        console.error("Error setting role:", error)
        toast.error("Failed to set role. Please try again.")
        setIsSubmitting(false)
        return
      }

      toast.success(`Role updated to ${selectedRole}`)
      
      // Redirect based on selected role
      if (selectedRole === "worker") {
        router.push("/checker")
      } else if (selectedRole === "platform") {
        router.push("/platform-portal")
      }
    } catch (error: any) {
      console.error("Error setting role:", error)
      toast.error("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3fe56c] animate-spin mb-4" />
        <p className="text-neutral-400 font-medium">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl max-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#3fe56c] to-[#00c853] shadow-[0_0_20px_rgba(63,229,108,0.3)] mb-4">
            <ShieldCheck className="w-8 h-8 text-black fill-black/10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">How do you want to use GigShield?</h1>
          <p className="text-neutral-400 font-medium max-w-xl mx-auto text-lg">
            Choose your profile type to access the right tools and dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Worker Card */}
          <button 
            onClick={() => handleSelectRole("worker")}
            className="group flex flex-col items-start bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#3fe56c]/50 rounded-[28px] p-8 text-left transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#3ce36a]/30 relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#004c1b]/30 flex items-center justify-center mb-6 border border-[#00c853]/20 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7 text-[#3fe56c]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">I'm a Worker</h3>
            <p className="text-neutral-400 text-sm/relaxed font-medium">
              Check your fair pay, file grievances, and understand your legal rights against exploitation.
            </p>
          </button>

          {/* Platform Card */}
          <button 
            onClick={() => handleSelectRole("platform")}
            className="group flex flex-col items-start bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#2fb9f9]/50 rounded-[28px] p-8 text-left transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#2fb9f9]/30 relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00344b]/30 flex items-center justify-center mb-6 border border-[#2fb9f9]/20 group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7 text-[#2fb9f9]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">I'm a Platform</h3>
            <p className="text-neutral-400 text-sm/relaxed font-medium">
              Audit your compliance, compare competitor stats, and earn your Fair Pay Certification.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

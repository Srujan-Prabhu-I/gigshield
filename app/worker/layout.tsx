\"use client\"

import { useEffect } from \"react\"
import { useAuth } from \"@/lib/auth-context\"
import { useRouter } from \"next/navigation\"
import { Loader2 } from \"lucide-react\"

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || role !== \"worker\")) {
      router.push(\"/\")
    }
  }, [user, role, loading, router])

  if (loading || !user || role !== \"worker\") {
    return (
      <div className=\"min-h-screen bg-[#0e0e0e] flex items-center justify-center\">
        <Loader2 className=\"w-8 h-8 text-[#3fe56c] animate-spin\" />
      </div>
    )
  }

  return <>{children}</>
}

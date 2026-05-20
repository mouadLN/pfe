import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"

const TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours

export function useAutoLogout() {
  const router = useRouter()
  const timerRef = useRef(null)

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.replace("/login?reason=timeout")
    }
  }, [router])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(logout, TIMEOUT_MS)
  }, [logout])

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"]
    
    // Start timer
    resetTimer()

    // Reset on any activity
    events.forEach((e) => window.addEventListener(e, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [resetTimer])
}
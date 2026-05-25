"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Admin from "@/components/dashboardadministrateur"
import Auditeur from "@/components/dashboardauditeur"

export default function Home() {
  const [role, setRole] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
      return
    }
    const stored = JSON.parse(localStorage.getItem("user") || "{}")
    setRole((stored.role ?? "UNKNOWN").toUpperCase())
  }, [router])

  if (!role) return null

  if (role === "ADMIN")    return <Admin />
  if (role === "AUDITEUR") return <Auditeur />

  // Rôle inconnu → redirection login
  router.replace("/login")
  return null
}
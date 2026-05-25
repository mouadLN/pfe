"use client"

import { useState, useEffect } from "react"
import { useDarkMode } from "@/hooks/useDarkMode"
import { ClipboardList, User } from "lucide-react"

export default function DashboardAuditeur() {
  const isDark = useDarkMode()
  const [user, setUser] = useState({ nom: "", prenom: "", role: "" })

  const bg         = isDark ? "#18181b" : "#ffffff"
  const textMain   = isDark ? "#f4f4f5" : "#111827"
  const cardBorder = isDark ? "#3f3f46" : "#d1d5db"

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}")
    setUser(stored)
  }, [])

  const displayName = `${user.prenom || ""} ${user.nom || ""}`.trim() || "Auditeur"

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
      style={{ background: bg }}
    >
      {/* Avatar placeholder */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "#e8192c22", border: "2px solid #e8192c",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <User size={36} color="#e8192c" />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 6 }}>Bienvenue,</p>
        <h1 style={{ color: textMain, fontWeight: 800, fontSize: 24, marginBottom: 4 }}>
          {displayName.toUpperCase()}
        </h1>
        <span style={{
          background: "#e8192c22", color: "#e8192c",
          border: "1px solid #e8192c55", borderRadius: 4,
          padding: "2px 12px", fontSize: 12, fontWeight: 700,
        }}>
          AUDITEUR
        </span>
      </div>

      {/* Placeholder message */}
      <div style={{
        border: `1.5px solid ${cardBorder}`,
        borderRadius: 8, padding: "20px 32px",
        background: isDark ? "#09090b" : "#f9fafb",
        textAlign: "center", maxWidth: 400,
      }}>
        <ClipboardList size={28} color="#e8192c" style={{ margin: "0 auto 12px" }} />
        <p style={{ color: textMain, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
          Dashboard Auditeur
        </p>
        <p style={{ color: "#9ca3af", fontSize: 13 }}>
          Le dashboard auditeur est en cours de construction.
          Envoyez vos captures pour que je le génère.
        </p>
      </div>
    </div>
  )
}
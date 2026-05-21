"use client"

import { useEffect, useState } from "react"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"
import SectionHeader from "@/components/dashboardComponents/SectionHeader"
import { ClipboardList } from "lucide-react"

export default function DetailAuditKpi() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgClass    = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-300" : "text-gray-600"

  useEffect(() => {
    missionService.getAll().then((res) => {
      const missions = res.data ?? []
console.log("SESSION DETAILS:", JSON.stringify(missions[0]?.auditSession, null, 2))  // 👈

      // Dédupliquer les sessions par id pour éviter double comptage
      const sessionsMap = {}
      let totalPoints = 0
      let pointsFaibles = 0

      missions.forEach((m) => {
        totalPoints += (m.auditElements ?? []).length

        const session = m.auditSession
        if (!session || session.noteGlobale == null) return
        if (!sessionsMap[session.id]) {
          sessionsMap[session.id] = session.noteGlobale
          if (session.noteGlobale < 7) pointsFaibles++
        }
      })

      const notes = Object.values(sessionsMap)
      const noteGlobale = notes.length
        ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)
        : "—"

      setStats({ noteGlobale, pointsControles: totalPoints, pointsFaibles })
      setLoading(false)
    })
  }, [])

  const cards = stats ? [
    { label: "Note Globale",       value: stats.noteGlobale,      color: "text-red-500"   },
    { label: "Points Contrôlés",   value: stats.pointsControles,  color: "text-teal-500"  },
    { label: "Points Faibles < 7", value: stats.pointsFaibles,    color: "text-amber-400" },
  ] : []

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="Détail Audit" icon={ClipboardList} />

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div key={i} className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
            <p className={`text-sm mb-2 ${titleClass}`}>{card.label}</p>
            <p className={`text-4xl font-bold ${card.color}`}>
              {loading ? "…" : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
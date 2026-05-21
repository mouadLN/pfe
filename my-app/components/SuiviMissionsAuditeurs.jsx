"use client"

import { useEffect, useState, useMemo } from "react"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"
import SectionHeader from "@/components/SectionHeader"
import { ClipboardList } from "lucide-react"

export default function SuiviMissionsAuditeurs() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading]   = useState(true)
  const isDark = useDarkMode()

  const bgClass    = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-300" : "text-gray-600"

  useEffect(() => {
    missionService.getAll()
      .then((res) => { setMissions(res.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total:     missions.length,
    terminees: missions.filter((m) => m.statut === "TERMINEE").length,
    enCours:   missions.filter((m) => m.statut === "EN_COURS").length,
  }), [missions])

  const cards = [
    { label: "Total Missions",     value: stats.total,     color: "text-teal-500"  },
    { label: "Missions Terminées", value: stats.terminees, color: "text-teal-500"  },
    { label: "Missions En Cours",  value: stats.enCours,   color: "text-amber-400" },
  ]

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="Suivi des Missions & Auditeurs" icon={ClipboardList} />

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
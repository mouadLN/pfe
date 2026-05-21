"use client"

import { useEffect, useState, useMemo } from "react"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function AnalyseCritereAudit() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgCard     = isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-gray-200"
  const bgWrapper  = isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-gray-200"
  const titleClass = isDark ? "text-gray-200" : "text-gray-800"
  const labelClass = isDark ? "text-gray-400" : "text-gray-500"

  useEffect(() => {
  missionService.getAll().then((res) => {
    console.log("missions data:", JSON.stringify(res.data[0], null, 2))
    setMissions(res.data)
    setLoading(false)
  })
}, [])

  const stats = useMemo(() => {
    // Collect all element scores from all terminated audit sessions
    const allScores = []

    missions.forEach((m) => {
      const scores = m.auditSession?.scores ?? []
      scores.forEach((s) => {
        if (s.score != null) allScores.push(s.score)
      })
    })

    if (allScores.length === 0) return null

    const scoreMoyen = parseFloat(
      (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
    )

    const criteresFaibles = allScores.filter((s) => s < 7).length

    const meilleurScore = Math.max(...allScores)

    return { scoreMoyen, criteresFaibles, meilleurScore }
  }, [missions])

  const cards = stats
    ? [
        {
          label: "Score Moyen Critères",
          value: stats.scoreMoyen,
          color: "text-red-500",
          suffix: "/10",
        },
        {
          label: "Critères < 7/10",
          value: stats.criteresFaibles,
          color: "text-orange-400",
          suffix: "",
        },
        {
          label: "Meilleur Score",
          value: stats.meilleurScore,
          color: "text-teal-500",
          suffix: "",
        },
      ]
    : []

  return (
    <div className={`rounded-md border-2 border-red-500 p-4 ${bgWrapper}`}>
      {/* Title */}
      <p className={`text-base font-bold mb-4 ${titleClass}`}>
        Analyse par Critère d'Audit
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : !stats ? (
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`rounded-md border-2 border-red-500 p-4 ${bgCard}`}
            >
              <p className={`text-sm mb-2 truncate ${labelClass}`}>
                {card.label}
              </p>
              <p className={`text-3xl font-bold ${card.color}`}>
                {card.value}
                {card.suffix && (
                  <span className="text-lg font-medium">{card.suffix}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
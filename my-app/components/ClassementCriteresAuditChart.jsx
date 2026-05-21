"use client"

import { useEffect, useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

const RED = "#e8192c"

const getBarColor = (score) => {
  if (score >= 8) return "#2dd4bf"  // teal
  if (score >= 7) return "#f59e0b"  // orange
  return RED                         // rouge
}

export default function ClassementCriteresAuditChart() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading]   = useState(true)
  const isDark = useDarkMode()

  const bg          = isDark ? "#1f2937" : "#ffffff"
  const textPrimary = isDark ? "#f9fafb" : "#111111"
  const axisColor   = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg   = isDark ? "#111827" : "#ffffff"
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"

  useEffect(() => {
    missionService.getAll()
      .then((res) => { setMissions(res.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const chartData = useMemo(() => {
    const map = {}

    missions.forEach((m) => {
      const scores = m.auditSession?.scores ?? []
      scores.forEach((s) => {
        if (s.score == null) return
        const critere = s.auditElement?.nom ?? "Inconnu"
        if (!map[critere]) map[critere] = []
        map[critere].push(s.score)
      })
    })

    return Object.entries(map)
      .map(([nom, scores]) => ({
        id: nom,
        nom: nom.length > 22 ? nom.slice(0, 22) + "…" : nom,
        nomComplet: nom,
        note: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
      .map((item, i) => ({ ...item, id: i }))
  }, [missions])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nomComplet, note } = payload[0].payload
    return (
      <div style={{
        background: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: 8,
        padding: "8px 12px",
        pointerEvents: "none",
      }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nomComplet}</p>
        <p style={{ color: getBarColor(note), fontWeight: 700, fontSize: 13 }}>Note : {note}</p>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: bg,
      border: `2px solid ${RED}`,
      borderRadius: 6,
      padding: "16px",
      transition: "background .2s",
    }}>
      <p style={{ color: textPrimary, fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
        Classement des Critères d'Audit
      </p>

      {loading ? (
        <p style={{ color: axisColor, fontSize: 13 }}>Chargement…</p>
      ) : chartData.length === 0 ? (
        <p style={{ color: axisColor, fontSize: 13, fontStyle: "italic" }}>
          En attente des données de scores — sera connecté au service audit session.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={chartData.length * 42 + 20}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 50, top: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: axisColor }}
            />
            <YAxis
              type="category"
              dataKey="id"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={140}
              tick={{ fill: axisColor }}
              tickFormatter={(value) => chartData[value]?.nom ?? ""}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false}>
              <LabelList dataKey="note" position="right" fontSize={12} fill={axisColor} />
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={getBarColor(entry.note)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
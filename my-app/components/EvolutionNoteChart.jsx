"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

export default function EvolutionNoteChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgClass = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-200" : "text-gray-700"
  const axisColor = isDark ? "#9ca3af" : "#6b7280"
  const gridColor = isDark ? "#3f3f46" : "#f0f0f0"
  const tooltipBg = isDark ? "#18181b" : "#ffffff"
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

  useEffect(() => {
    missionService.getAll().then((res) => {
      const missions = res.data
      const parMois = {}

      missions.forEach((m) => {
        if (m.auditSession?.noteGlobale == null) return
        const d = new Date(m.dateDebut)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!parMois[key]) parMois[key] = { notes: [], mois: d.getMonth(), annee: d.getFullYear() }
        parMois[key].notes.push(m.auditSession.noteGlobale)
      })

      const data = Object.values(parMois)
        .sort((a, b) => a.annee - b.annee || a.mois - b.mois)
        .map((entry) => ({
          mois: MOIS[entry.mois],
          note: parseFloat((entry.notes.reduce((a, b) => a + b, 0) / entry.notes.length).toFixed(2)),
        }))

      setChartData(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
      <p className={`text-sm font-medium mb-4 ${titleClass}`}>
        Évolution Mensuelle de la Note Qualité
      </p>
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis dataKey="mois" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tick={{ fill: axisColor }} />
            <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tick={{ fill: axisColor }} />
            <Tooltip
              formatter={(value) => [value, "Note"]}
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8 }}
              labelStyle={{ color: axisColor }}
            />
            <Line
              dataKey="note"
              type="linear"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
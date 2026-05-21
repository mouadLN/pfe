"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function EvolutionParMagasinChart() {
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
      const avecNote = missions.filter((m) => m.auditSession?.noteGlobale != null)

      // Grouper par magasin, prendre la moyenne
      const parMagasin = {}
      avecNote.forEach((m, i) => {
        const nom = m.store?.nom ?? `Magasin ${i}`
        if (!parMagasin[nom]) parMagasin[nom] = []
        parMagasin[nom].push(m.auditSession.noteGlobale)
      })

      const data = Object.entries(parMagasin).map(([nom, notes], i) => ({
        index: i + 1,
        nom,
        note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
      }))

      setChartData(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
      <p className={`text-sm font-medium mb-4 ${titleClass}`}>Évolution par Magasin</p>
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ left: 0, right: 20, top: 20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis dataKey="index" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
            <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
            <Tooltip
              formatter={(value, _, props) => [value, props.payload.nom]}
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8 }}
              labelStyle={{ color: axisColor }}
            />
            <Line
              dataKey="note"
              type="linear"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", r: 4 }}
              activeDot={{ r: 6 }}
            >
              <LabelList dataKey="note" position="top" fontSize={11} fill={axisColor} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function ClassementMagasinsChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgClass = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-200" : "text-gray-700"
  const axisColor = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg = isDark ? "#18181b" : "#ffffff"
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

  useEffect(() => {
    missionService.getAll().then((res) => {
      const missions = res.data
      const parMagasin = {}

      missions.forEach((m) => {
        if (m.auditSession?.noteGlobale == null) return
        const nom = m.store?.nom ?? "Inconnu"
        if (!parMagasin[nom]) parMagasin[nom] = []
        parMagasin[nom].push(m.auditSession.noteGlobale)
      })

      const data = Object.entries(parMagasin)
        .map(([nom, notes], i) => ({
          id: i,
          nomComplet: nom,
          nom: nom.length > 10 ? nom.slice(0, 10) + "..." : nom,
          note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
        }))
        .sort((a, b) => b.note - a.note)
        .map((item, i) => ({ ...item, id: i }))

      setChartData(data)
      setLoading(false)
    })
  }, [])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nomComplet, note } = payload[0].payload
    return (
      <div style={{
        background: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: 8,
        padding: "8px 12px",
        pointerEvents: "none"
      }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nomComplet}</p>
        <p style={{ color: "#22c55e", fontWeight: 600, fontSize: 13 }}>Note : {note}</p>
      </div>
    )
  }

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
      <p className={`text-sm font-medium mb-4 ${titleClass}`}>Classement des Magasins</p>
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <ResponsiveContainer width="100%" height={chartData.length * 35 + 20}>
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
              fontSize={11}
              width={90}
              tick={{ fill: axisColor }}
              tickFormatter={(value) => chartData[value]?.nom ?? ""}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="note"
              radius={[0, 4, 4, 0]}
              barSize={16}
              isAnimationActive={false}
            >
              <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
              {chartData.map((entry, i) => (
                <Cell key={`cell-${entry.id}`} fill="#22c55e" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
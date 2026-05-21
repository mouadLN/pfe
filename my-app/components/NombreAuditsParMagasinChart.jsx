"use client"

import { useEffect, useState, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function NombreAuditsParMagasinChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgClass = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-200" : "text-gray-700"
  const axisColor = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg = isDark ? "#18181b" : "#ffffff"
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"
  const tooltipColor = isDark ? "#9ca3af" : "#6b7280"

  useEffect(() => {
    missionService.getAll().then((res) => {
      const missions = res.data
      const parMagasin = {}
      missions.forEach((m) => {
        const nom = m.store?.nom ?? "Inconnu"
        if (!parMagasin[nom]) parMagasin[nom] = 0
        parMagasin[nom]++
      })
      const data = Object.entries(parMagasin)
        .map(([nom, count]) => ({
          nomComplet: nom,
          nom: nom.length > 12 ? nom.slice(0, 12) + "..." : nom,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .map((item, i) => ({ ...item, id: i }))

      setChartData(data)
      setLoading(false)
    })
  }, [])

  const renderTooltip = useCallback(({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div style={{
        background: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: 8,
        padding: "8px 12px",
        pointerEvents: "none"
      }}>
        <p style={{ color: tooltipColor, fontSize: 12, marginBottom: 4 }}>{d.nomComplet}</p>
        <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>Audits : {d.count}</p>
      </div>
    )
  }, [tooltipBg, tooltipBorder, tooltipColor])

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
      <p className={`text-sm font-medium mb-4 ${titleClass}`}>Nombre d'Audits par Magasin</p>
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ left: 0, right: 20, top: 20, bottom: 40 }}>
            <XAxis
              dataKey="id"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fill: axisColor }}
              angle={-30}
              textAnchor="end"
              interval={0}
              tickFormatter={(value) => chartData[value]?.nom ?? ""}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: axisColor }}
              allowDecimals={false}
            />
            <Tooltip content={renderTooltip} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30} fill="#ef4444" isAnimationActive={false}>
              <LabelList dataKey="count" position="top" fontSize={11} fill={axisColor} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
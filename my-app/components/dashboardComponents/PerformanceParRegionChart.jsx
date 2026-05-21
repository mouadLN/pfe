"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function PerformanceParRegionChart() {
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
      const parRegion = {}

      missions.forEach((m) => {
        if (m.auditSession?.noteGlobale == null) return
        const region = m.store?.region
        if (!region) return
        if (!parRegion[region]) parRegion[region] = []
        parRegion[region].push(m.auditSession.noteGlobale)
      })

      const data = Object.entries(parRegion)
        .map(([region, notes]) => ({
          region,
          note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
        }))
        .sort((a, b) => b.note - a.note)

      setChartData(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
      <p className={`text-sm font-medium mb-4 ${titleClass}`}>Performance par Région</p>
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <ResponsiveContainer width="100%" height={chartData.length * 45 + 20}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 120, right: 40, top: 0, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
            <YAxis type="category" dataKey="region" tickLine={false} axisLine={false} fontSize={12} width={120} tick={{ fill: axisColor }} />
           <Tooltip
  formatter={(value) => [value, "Note"]}
  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8 }}
 labelStyle={{ color: isDark ? "#9ca3af" : "#6b7280" }}
itemStyle={{ color: "#ef4444" }}
/>
            <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((_, index) => (
                <Cell key={index} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
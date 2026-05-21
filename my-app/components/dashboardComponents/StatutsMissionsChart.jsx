"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

const COLORS = {
  TERMINEE: "#14b8a6",
  PLANIFIEE: "#3b82f6",
  EN_COURS: "#f59e0b",
  ANNULEE: "#ef4444",
}

export default function StatutsMissionsChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgClass = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-200" : "text-gray-700"
  const labelClass = isDark ? "text-gray-300" : "text-gray-600"
  const valueClass = isDark ? "text-gray-100" : "text-gray-800"
  const tooltipBg = isDark ? "#18181b" : "#ffffff"
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

  useEffect(() => {
    missionService.getStatsByStatus().then((res) => {
      const raw = res.data
      const total = raw.reduce((acc, [, count]) => acc + count, 0)
      const data = raw.map(([statut, count]) => ({
        statut,
        count,
        fill: COLORS[statut] ?? "#8884d8",
        pourcentage: ((count / total) * 100).toFixed(2) + "%",
      }))
      setChartData(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
      <p className={`text-sm font-medium mb-2 ${titleClass}`}>Statuts des Missions</p>
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8 }}
              />
              <Pie data={chartData} dataKey="count" nameKey="statut" innerRadius={55} outerRadius={85}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col gap-2">
            {chartData.map((entry) => (
              <div key={entry.statut} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: entry.fill }} />
                <span className={labelClass}>{entry.statut}</span>
                <span className={`font-medium ${valueClass}`}>{entry.pourcentage}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
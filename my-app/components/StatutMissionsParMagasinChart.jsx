"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

const STATUT_COLORS = {
  TERMINEE:  "#14b8a6",
  PLANIFIEE: "#3b82f6",
  EN_COURS:  "#f59e0b",
  ANNULEE:   "#ef4444",
}

const CustomYAxisTick = ({ x, y, payload, fill }) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={4}
      textAnchor="end"
      fill={fill}
      fontSize={11}
      style={{ whiteSpace: "nowrap" }}
    >
      {payload.value}
    </text>
  </g>
)

export default function StatutMissionsParMagasinChart() {
  const [chartData, setChartData] = useState([])
  const [statuts, setStatuts]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [yAxisWidth, setYAxisWidth] = useState(200)
  const isDark = useDarkMode()

  const bg           = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass   = isDark ? "text-gray-200" : "text-gray-700"
  const axisColor    = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg    = isDark ? "#18181b" : "#ffffff"
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"
  const tooltipLabel  = isDark ? "#9ca3af" : "#6b7280"

  useEffect(() => {
    missionService.getAll().then((res) => {
      const missions = res.data ?? []

      const statutsSet = new Set()
      missions.forEach((m) => statutsSet.add(m.statut))
      const statutsList = Array.from(statutsSet)
      setStatuts(statutsList)

      const byStore = {}
      missions.forEach((m) => {
        const nom = m.store?.nom ?? "Inconnu"
        if (!byStore[nom]) byStore[nom] = { nom }
        byStore[nom][m.statut] = (byStore[nom][m.statut] ?? 0) + 1
      })

      const data = Object.values(byStore)
      data.sort((a, b) => {
        const sumA = statutsList.reduce((s, st) => s + (a[st] ?? 0), 0)
        const sumB = statutsList.reduce((s, st) => s + (b[st] ?? 0), 0)
        return sumB - sumA
      })

      // Calculate yAxisWidth based on longest name
      const longest = data.reduce((max, d) => Math.max(max, d.nom.length), 0)
      setYAxisWidth(Math.min(longest * 7 + 10, 320))

      setChartData(data)
      setLoading(false)
    })
  }, [])

  const barHeight   = 24
  const chartHeight = Math.max(200, chartData.length * (barHeight * statuts.length + 16) + 60)

  return (
    <div className={`border-2 border-red-500 rounded-md p-4 ${bg}`}>
      <p className={`text-sm font-medium mb-3 ${titleClass}`}>
        Statut Missions par Magasin
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
            barGap={2}
            barCategoryGap={14}
          >
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: axisColor }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="nom"
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              interval={0}
              tick={<CustomYAxisTick fill={axisColor} />}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const sorted = [...payload]
                  .filter(e => e.value > 0)
                  .sort((a, b) => a.value - b.value)
                return (
                  <div style={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                  }}>
                    <p style={{ color: tooltipLabel, marginBottom: 6 }}>{label}</p>
                    {sorted.map((entry) => (
                      <p key={entry.name} style={{ color: STATUT_COLORS[entry.name] ?? "#6b7280", margin: "3px 0" }}>
                        {entry.name} : {entry.value}
                      </p>
                    ))}
                  </div>
                )
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingBottom: 4 }}
              formatter={(value) => (
                <span style={{ color: STATUT_COLORS[value] ?? axisColor }}>{value}</span>
              )}
            />
            {statuts.map((statut) => {
              const color = STATUT_COLORS[statut] ?? "#6b7280"
              return (
                <Bar
                  key={statut}
                  dataKey={statut}
                  name={statut}
                  fill={color}
                  radius={[0, 4, 4, 0]}
                  barSize={barHeight}
                  activeBar={{ fill: color }}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, Legend } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function ChargeEtNoteParAuditeur() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading]   = useState(true)
  const isDark = useDarkMode()

  const bgClass     = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass  = isDark ? "text-gray-200" : "text-gray-700"
  const axisColor   = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg   = isDark ? "#111827" : "#ffffff"
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"

  useEffect(() => {
    missionService.getAll()
      .then((res) => { setMissions(res.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Charge par auditeur : nb EN_COURS et TERMINEE
  const chargeData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      const nom = m.auditeur?.nom ?? "Inconnu"
      if (!map[nom]) map[nom] = { nom, id: nom, EN_COURS: 0, TERMINEE: 0 }
      if (m.statut === "EN_COURS")  map[nom].EN_COURS++
      if (m.statut === "TERMINEE")  map[nom].TERMINEE++
    })
    return Object.values(map).sort((a, b) => a.nom.localeCompare(b.nom))
  }, [missions])

  // Note moyenne par auditeur
  const noteData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      if (m.auditSession?.noteGlobale == null) return
      const nom = m.auditeur?.nom ?? "Inconnu"
      if (!map[nom]) map[nom] = { nom, notes: [] }
      map[nom].notes.push(m.auditSession.noteGlobale)
    })
    return Object.entries(map)
      .map(([nom, { notes }], i) => ({
        id: i,
        nom,
        note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
  }, [missions])

  const CustomTooltipCharge = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill, fontWeight: 600, fontSize: 12 }}>{p.name} : {p.value}</p>
        ))}
      </div>
    )
  }

  const CustomTooltipNote = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nom, note } = payload[0].payload
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nom}</p>
        <p style={{ color: "#e8192c", fontWeight: 600, fontSize: 12 }}>Note : {note}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Charge par Auditeur */}
      <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
        <p className={`text-sm font-medium mb-1 ${titleClass}`}>Charge par Auditeur</p>

        {loading ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : (
          <>
            {/* Légende manuelle */}
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">statut</span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                EN_COURS
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#2dd4bf" }} />
                TERMINEE
              </span>
            </div>

            <ResponsiveContainer width="100%" height={chargeData.length * 50 + 20}>
              <BarChart
                data={chargeData}
                layout="vertical"
                margin={{ left: 10, right: 40, top: 0, bottom: 0 }}
                barGap={4}
              >
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis
                  type="category"
                  dataKey="nom"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={80}
                  tick={{ fill: axisColor }}
                />
                <Tooltip content={<CustomTooltipCharge />} />
                <Bar dataKey="EN_COURS" name="EN_COURS" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                  <LabelList dataKey="EN_COURS" position="right" fontSize={11} fill={axisColor} />
                </Bar>
                <Bar dataKey="TERMINEE" name="TERMINEE" fill="#2dd4bf" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                  <LabelList dataKey="TERMINEE" position="right" fontSize={11} fill={axisColor} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Note Moyenne par Auditeur */}
      <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
        <p className={`text-sm font-medium mb-4 ${titleClass}`}>Note Moyenne par Auditeur</p>

        {loading ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : noteData.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucune note disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={noteData.length * 50 + 20}>
            <BarChart
              data={noteData}
              layout="vertical"
              margin={{ left: 10, right: 50, top: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
              <YAxis
                type="category"
                dataKey="id"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={80}
                tick={{ fill: axisColor }}
                tickFormatter={(value) => noteData[value]?.nom ?? ""}
              />
              <Tooltip content={<CustomTooltipNote />} />
              <Bar dataKey="note" fill="#e8192c" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
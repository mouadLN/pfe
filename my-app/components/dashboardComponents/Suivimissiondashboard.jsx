"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"
import { ClipboardList } from "lucide-react"

const RED = "#e8192c"

const STATUT_COLORS = {
  TERMINEE:  "#14b8a6",
  PLANIFIEE: "#3b82f6",
  EN_COURS:  "#f59e0b",
  ANNULEE:   "#ef4444",
}

const fmt = (dateStr) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
}
const fmtShort = (dateStr) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const StatutBadge = ({ statut }) => {
  const color = STATUT_COLORS[statut] ?? "#6b7280"
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {statut}
    </span>
  )
}

const CustomYAxisTick = ({ x, y, payload, fill }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={4} textAnchor="end" fill={fill} fontSize={11}>{payload.value}</text>
  </g>
)

const FloatingTooltip = ({ row, mouseX, mouseY, bg, border, textMain, textSub, isDark }) => {
  const CARD_W = 340
  const left = mouseX + CARD_W + 20 > window.innerWidth ? mouseX - CARD_W - 10 : mouseX + 10
  const top  = mouseY + 16
  return createPortal(
    <div style={{ position: "fixed", left, top, zIndex: 9999, background: bg, border: `2px solid ${RED}`, borderRadius: 8, padding: "14px 16px", width: CARD_W, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.7)" : "0 8px 32px rgba(0,0,0,0.18)", pointerEvents: "none", fontSize: 13 }}>
      <div style={{ background: RED, margin: "-14px -16px 12px -16px", padding: "8px 14px", borderRadius: "6px 6px 0 0" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Détail Mission #{row.id}</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Magasin</div>
        <div style={{ fontWeight: 700, color: textMain, fontSize: 14, lineHeight: 1.4 }}>{row.store?.nom ?? "—"}</div>
      </div>
      <div style={{ borderTop: `1px solid ${border}`, marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
        <div>
          <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Auditeur</div>
          <div style={{ fontWeight: 600, color: textMain }}>{row.auditeur?.nom ?? "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Statut</div>
          <StatutBadge statut={row.statut} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Date début</div>
          <div style={{ color: textMain, fontWeight: 500 }}>{fmtShort(row.dateDebut) || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Date fin</div>
          <div style={{ color: textMain, fontWeight: 500 }}>{fmt(row.dateFin) || "—"}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const MissionRow = ({ row, i, bg, bgAlt, bgHover, border, textMain, textSub, isDark }) => {
  const [tooltip, setTooltip] = useState(null)
  const handleMouseMove  = useCallback((e) => setTooltip({ x: e.clientX, y: e.clientY }), [])
  const handleMouseLeave = useCallback(() => setTooltip(null), [])
  return (
    <tr style={{ background: tooltip ? bgHover : i % 2 === 0 ? bg : bgAlt, borderBottom: `1px solid ${border}`, transition: "background .15s", cursor: "default" }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <td style={{ padding: "7px 10px", textAlign: "center", color: textSub, fontWeight: 600 }}>{row.id}</td>
      <td style={{ padding: "7px 10px", fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.store?.nom ?? "—"}</td>
      <td style={{ padding: "7px 10px", color: textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.auditeur?.nom ?? "—"}</td>
      <td style={{ padding: "7px 10px", textAlign: "center", color: textSub, whiteSpace: "nowrap" }}>{fmtShort(row.dateDebut)}</td>
      <td style={{ padding: "7px 10px", color: textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fmt(row.dateFin)}</td>
      <td style={{ padding: "7px 10px", textAlign: "center" }}><StatutBadge statut={row.statut} /></td>
      {tooltip && <FloatingTooltip row={row} mouseX={tooltip.x} mouseY={tooltip.y} bg={bg} border={border} textMain={textMain} textSub={textSub} isDark={isDark} />}
    </tr>
  )
}

export default function SuiviMissionsDashboard() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const isDark = useDarkMode()

  const bg        = isDark ? "#18181b" : "#ffffff"
  const bgAlt     = isDark ? "#09090b" : "#fafafa"
  const bgHover   = isDark ? "#3b0a0a" : "#fde8ea"
  const border    = isDark ? "#3f3f46" : "#e5e7eb"
  const textMain  = isDark ? "#f4f4f5" : "#111827"
  const textSub   = isDark ? "#9ca3af" : "#374151"
  const axisColor = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg = isDark ? "#18181b" : "#ffffff"
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"
  const tooltipLabel  = isDark ? "#9ca3af" : "#6b7280"
  const titleClass    = isDark ? "text-gray-300" : "text-gray-600"

  // ── Neutral card border ──────────────────────────────────────────────────────
  const cardBorder = isDark ? "#ffffff" : "#d1d5db"
  const card = (extra = {}) => ({ border: `1.5px solid ${cardBorder}`, borderRadius: 6, ...extra })

  useEffect(() => {
    missionService.getAll()
      .then((res) => { const data = res.data ?? []; data.sort((a, b) => b.id - a.id); setMissions(data) })
      .catch(() => setError("Impossible de charger les missions."))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total:     missions.length,
    terminees: missions.filter((m) => m.statut === "TERMINEE").length,
    enCours:   missions.filter((m) => m.statut === "EN_COURS").length,
    taux: missions.length ? ((missions.filter((m) => m.statut === "TERMINEE").length / missions.length) * 100).toFixed(2) : "0.00",
  }), [missions])

  const chargeData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      const nom = m.auditeur?.nom ?? "Inconnu"
      if (!map[nom]) map[nom] = { nom }
      map[nom][m.statut] = (map[nom][m.statut] ?? 0) + 1
    })
    return Object.values(map).sort((a, b) => {
      const sumA = Object.keys(STATUT_COLORS).reduce((s, k) => s + (a[k] ?? 0), 0)
      const sumB = Object.keys(STATUT_COLORS).reduce((s, k) => s + (b[k] ?? 0), 0)
      return sumB - sumA
    })
  }, [missions])

  const noteData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      if (m.auditSession?.noteGlobale == null) return
      const nom = m.auditeur?.nom ?? "Inconnu"
      if (!map[nom]) map[nom] = { nom, notes: [] }
      map[nom].notes.push(m.auditSession.noteGlobale)
    })
    return Object.entries(map)
      .map(([nom, { notes }], i) => ({ id: i, nom, note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)) }))
      .sort((a, b) => b.note - a.note)
  }, [missions])

  const { magasinData, statutsList } = useMemo(() => {
    const statutsSet = new Set()
    const byStore = {}
    missions.forEach((m) => {
      statutsSet.add(m.statut)
      const nom = m.store?.nom ?? "Inconnu"
      if (!byStore[nom]) byStore[nom] = { nom }
      byStore[nom][m.statut] = (byStore[nom][m.statut] ?? 0) + 1
    })
    const data = Object.values(byStore).sort((a, b) => {
      const statuts = Array.from(statutsSet)
      return statuts.reduce((s, k) => s + (b[k] ?? 0), 0) - statuts.reduce((s, k) => s + (a[k] ?? 0), 0)
    })
    return { magasinData: data, statutsList: Array.from(statutsSet) }
  }, [missions])

  const chargeHeight  = Math.max(160, chargeData.length * 52 + 60)
  const noteHeight    = Math.max(160, noteData.length  * 52 + 60)
  const magasinHeight = Math.max(200, magasinData.length * (24 * statutsList.length + 16) + 60)
  const magasinYAxisW = Math.min(magasinData.reduce((m, d) => Math.max(m, d.nom.length), 0) * 7 + 10, 320)

  const statCards = [
    { label: "Total Missions",     value: stats.total,     color: "text-teal-500"  },
    { label: "Missions Terminées", value: stats.terminees, color: "text-teal-500"  },
    { label: "Missions En Cours",  value: stats.enCours,   color: "text-amber-400" },
  ]

  const tableColumns = [
    { key: "id",        label: "id",        width: "5%",  center: true  },
    { key: "store",     label: "nom",        width: "20%", center: false },
    { key: "auditeur",  label: "nom",        width: "10%", center: false },
    { key: "dateDebut", label: "date_debut", width: "10%", center: true  },
    { key: "dateFin",   label: "date_fin",   width: "22%", center: false },
    { key: "statut",    label: "statut",     width: "12%", center: true  },
  ]

  const makeTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const sorted = [...payload].filter((e) => e.value > 0).sort((a, b) => a.value - b.value)
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <p style={{ color: tooltipLabel, marginBottom: 6 }}>{label}</p>
        {sorted.map((e) => <p key={e.name} style={{ color: STATUT_COLORS[e.name] ?? RED, margin: "3px 0" }}>{e.name} : {e.value}</p>)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-3">

      {/* LEFT COLUMN */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">

        {/* Title */}
        <div style={{ ...card(), padding: "14px 18px", background: bg, display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardList size={20} color={RED} />
          <span style={{ fontWeight: 800, fontSize: 18, color: textMain, letterSpacing: ".01em" }}>Suivi des Missions &amp; Auditeurs</span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((c) => (
            <div key={c.label} style={{ ...card(), padding: "14px 16px", background: bg }}>
              <p className={`text-sm mb-2 ${titleClass}`}>{c.label}</p>
              <p className={`text-4xl font-bold ${c.color}`}>{loading ? "…" : c.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-3">
          <div style={{ ...card(), padding: "12px 10px", background: bg }}>
            <p className={`text-sm font-medium mb-3 ${titleClass}`}>Charge par Auditeur</p>
            {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
              <ResponsiveContainer width="100%" height={chargeHeight}>
                <BarChart data={chargeData} layout="vertical" margin={{ left: 6, right: 20, top: 6, bottom: 6 }} barGap={2} barCategoryGap={14}>
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: axisColor }} allowDecimals={false} />
                  <YAxis type="category" dataKey="nom" tickLine={false} axisLine={false} width={80} interval={0} tick={<CustomYAxisTick fill={axisColor} />} />
                  <Tooltip content={makeTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span style={{ color: STATUT_COLORS[v] ?? axisColor }}>{v}</span>} />
                  {["EN_COURS", "TERMINEE"].map((st) => (
                    <Bar key={st} dataKey={st} name={st} fill={STATUT_COLORS[st]} radius={[0, 4, 4, 0]} barSize={20} activeBar={{ fill: STATUT_COLORS[st] }} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ ...card(), padding: "12px 10px", background: bg }}>
            <p className={`text-sm font-medium mb-3 ${titleClass}`}>Note Moyenne par Auditeur</p>
            {loading ? <p className="text-sm text-gray-400">Chargement...</p>
            : noteData.length === 0 ? <p className="text-sm text-gray-400">Aucune note disponible.</p>
            : (
              <ResponsiveContainer width="100%" height={noteHeight}>
                <BarChart data={noteData} layout="vertical" margin={{ left: 6, right: 50, top: 0, bottom: 0 }} barCategoryGap={18}>
                  <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={11} tick={{ fill: axisColor }} allowDecimals={false} />
                  <YAxis type="category" dataKey="id" tickLine={false} axisLine={false} fontSize={12} width={80} tick={{ fill: axisColor }} tickFormatter={(value) => noteData[value]?.nom ?? ""} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const { nom, note } = payload[0].payload
                    return <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}><p style={{ color: tooltipLabel, marginBottom: 4 }}>{nom}</p><p style={{ color: RED, fontWeight: 600 }}>Note : {note}</p></div>
                  }} />
                  <Bar dataKey="note" fill={RED} radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                    <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Table missions */}
        <div style={{ ...card(), background: bg, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 14, color: RED, letterSpacing: ".02em" }}>Détail des Missions</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: RED }}>
                  {tableColumns.map((col) => (
                    <th key={col.key + col.label} style={{ width: col.width, padding: "8px 10px", color: "#fff", fontWeight: 700, fontSize: 12, textAlign: col.center ? "center" : "left", borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={tableColumns.length} style={{ textAlign: "center", padding: 32, color: textSub }}>Chargement…</td></tr>}
                {error   && <tr><td colSpan={tableColumns.length} style={{ textAlign: "center", padding: 32, color: RED }}>{error}</td></tr>}
                {!loading && !error && missions.length === 0 && <tr><td colSpan={tableColumns.length} style={{ textAlign: "center", padding: 32, color: textSub }}>Aucune mission trouvée.</td></tr>}
                {!loading && !error && missions.map((row, i) => (
                  <MissionRow key={row.id} row={row} i={i} bg={bg} bgAlt={bgAlt} bgHover={bgHover} border={border} textMain={textMain} textSub={textSub} isDark={isDark} />
                ))}
              </tbody>
              {!loading && !error && missions.length > 0 && (
                <tfoot>
                  <tr style={{ background: isDark ? "#27272a" : "#f3f4f6", borderTop: `2px solid ${border}` }}>
                    <td colSpan={tableColumns.length} style={{ padding: "8px 10px", fontWeight: 700, color: textMain, fontSize: 12 }}>
                      Total — {missions.length} mission{missions.length > 1 ? "s" : ""}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
        <div style={{ ...card(), padding: "14px 16px", background: bg }}>
          <p className={`text-sm mb-2 ${titleClass}`}>Taux Complétion</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: RED, lineHeight: 1.1 }}>{loading ? "…" : stats.taux}</p>
        </div>

        <div style={{ ...card(), padding: "12px 10px", background: bg, flex: 1 }}>
          <p className={`text-sm font-medium mb-3 ${titleClass}`}>Statut Missions par Magasin</p>
          {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
            <ResponsiveContainer width="100%" height={magasinHeight}>
              <BarChart data={magasinData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }} barGap={2} barCategoryGap={14}>
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: axisColor }} allowDecimals={false} />
                <YAxis type="category" dataKey="nom" tickLine={false} axisLine={false} width={magasinYAxisW} interval={0} tick={<CustomYAxisTick fill={axisColor} />} />
                <Tooltip content={makeTooltip} />
                <Legend wrapperStyle={{ fontSize: 12, paddingBottom: 4 }} formatter={(v) => <span style={{ color: STATUT_COLORS[v] ?? axisColor }}>{v}</span>} />
                {statutsList.map((statut) => (
                  <Bar key={statut} dataKey={statut} name={statut} fill={STATUT_COLORS[statut] ?? "#6b7280"} radius={[0, 4, 4, 0]} barSize={24} activeBar={{ fill: STATUT_COLORS[statut] ?? "#6b7280" }} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
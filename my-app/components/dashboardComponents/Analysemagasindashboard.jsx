"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"
import { missionService } from "@/services/missionService"
import { storeService } from "@/services/storeService"
import { useDarkMode } from "@/hooks/useDarkMode"
import { Store } from "lucide-react"

const RED         = "#e8192c"
const GREEN       = "#22c55e"
const BORDER      = "#e5e7eb"
const BORDER_DARK = "#374151"

const TrendBadge = ({ value }) => {
  if (value == null) return <span style={{ color: "#9ca3af" }}>—</span>
  const isFlat = value === 0
  const isUp   = value > 0
  return (
    <span style={{ color: isFlat ? "#6b7280" : isUp ? "#16a34a" : RED, fontWeight: 600, fontSize: 12 }}>
      {isFlat ? "— Stable" : isUp ? "↑ Hausse" : "↓ Baisse"}
    </span>
  )
}

export default function AnalyseMagasinDashboard() {
  const [missions,   setMissions]   = useState([])
  const [stores,     setStores]     = useState([])
  const [statPairs,  setStatPairs]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const isDark = useDarkMode()

  const bg          = isDark ? "#18181b" : "#ffffff"
  const bgAlt       = isDark ? "#09090b" : "#fafafa"
  const bgHover     = isDark ? "#4b1a20" : "#fde8ea"
  const border      = isDark ? BORDER_DARK : BORDER
  const textPrimary = isDark ? "#f9fafb" : "#111111"
  const textSecond  = isDark ? "#d1d5db" : "#374151"
  const textMuted   = isDark ? "#9ca3af" : "#9ca3af"
  const axisColor   = isDark ? "#9ca3af" : "#6b7280"
  const gridColor   = isDark ? "#3f3f46" : "#f0f0f0"
  const tooltipBg   = isDark ? "#18181b" : "#ffffff"
  const tooltipBord = isDark ? "#3f3f46" : "#e5e7eb"
  const titleClass  = isDark ? "text-gray-200" : "text-gray-700"

  // ── Neutral card border ──────────────────────────────────────────────────────
  const cardBorder = isDark ? "#3f3f46" : "#d1d5db"
  const card = (extra = {}) => ({ border: `1.5px solid ${cardBorder}`, borderRadius: 6, ...extra })

  useEffect(() => {
    Promise.all([
      missionService.getAll(),
      storeService.getAll(),
      missionService.getStatsByStore(),
    ])
      .then(([mRes, sRes, stRes]) => {
        setMissions(mRes.data  ?? [])
        setStores(sRes.data    ?? [])
        setStatPairs(stRes.data ?? [])
      })
      .catch(() => setError("Impossible de charger les données."))
      .finally(() => setLoading(false))
  }, [])

  const evolutionData = useMemo(() => {
    const map = {}
    missions
      .filter((m) => m.auditSession?.noteGlobale != null)
      .forEach((m, i) => {
        const nom = m.store?.nom ?? `Magasin ${i}`
        if (!map[nom]) map[nom] = []
        map[nom].push(m.auditSession.noteGlobale)
      })
    return Object.entries(map).map(([nom, notes], i) => ({
      index: i + 1, nom,
      note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
    }))
  }, [missions])

  const classementData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      if (m.auditSession?.noteGlobale == null) return
      const nom = m.store?.nom ?? "Inconnu"
      if (!map[nom]) map[nom] = []
      map[nom].push(m.auditSession.noteGlobale)
    })
    return Object.entries(map)
      .map(([nom, notes]) => ({
        nomComplet: nom,
        nom: nom.length > 10 ? nom.slice(0, 10) + "..." : nom,
        note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
      .map((item, i) => ({ ...item, id: i }))
  }, [missions])

  const auditsData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      const nom = m.store?.nom ?? "Inconnu"
      if (!map[nom]) map[nom] = 0
      map[nom]++
    })
    return Object.entries(map)
      .map(([nom, count]) => ({
        nomComplet: nom,
        nom: nom.length > 12 ? nom.slice(0, 12) + "..." : nom,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .map((item, i) => ({ ...item, id: i }))
  }, [missions])

  const tableRows = useMemo(() => {
    const auditMap = {}
    for (const pair of statPairs) {
      if (Array.isArray(pair)) { auditMap[pair[0]] = pair[1] }
      else {
        const key = pair.storeName ?? pair.nom ?? pair.name
        auditMap[key] = pair.count ?? pair.nbAudits ?? 0
      }
    }
    const missionsByStore = {}
    for (const m of missions) {
      const nom = m.store?.nom ?? null
      if (!nom) continue
      if (!missionsByStore[nom]) missionsByStore[nom] = []
      missionsByStore[nom].push(m)
    }
    return stores.map((store) => {
      const sm = missionsByStore[store.nom] ?? []
      const noted = sm
        .filter((m) => m.auditSession?.noteGlobale != null)
        .sort((a, b) => new Date(a.auditSession.dateDebut ?? 0) - new Date(b.auditSession.dateDebut ?? 0))
      const nbAudits     = auditMap[store.nom] ?? null
      const noteMoyenne  = noted.length ? noted.reduce((s, m) => s + m.auditSession.noteGlobale, 0) / noted.length : null
      const derniereNote = noted.length ? noted[noted.length - 1].auditSession.noteGlobale : null
      const tendance     = noted.length >= 2
        ? noted[noted.length - 1].auditSession.noteGlobale - noted[noted.length - 2].auditSession.noteGlobale
        : null
      return { id: store.id, nom: store.nom, region: store.region ?? "—", ville: store.ville ?? "—",
        nbAudits, noteMoyenne, derniereNote, tendance }
    }).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  }, [stores, missions, statPairs])

  const totals = tableRows.reduce(
    (acc, r) => {
      acc.nbAudits += r.nbAudits ?? 0
      if (r.noteMoyenne  != null) { acc.noteSum += r.noteMoyenne;  acc.noteCount++ }
      if (r.derniereNote != null) { acc.lastSum += r.derniereNote; acc.lastCount++ }
      return acc
    },
    { nbAudits: 0, noteSum: 0, noteCount: 0, lastSum: 0, lastCount: 0 }
  )
  const avgNote = totals.noteCount ? totals.noteSum / totals.noteCount : null
  const avgLast = totals.lastCount ? totals.lastSum / totals.lastCount : null
  const fmt = (n) => (n == null ? "" : Number(n).toFixed(2))

  const ClassementTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nomComplet, note } = payload[0].payload
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBord}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nomComplet}</p>
        <p style={{ color: GREEN, fontWeight: 600, fontSize: 13 }}>Note : {note}</p>
      </div>
    )
  }

  const AuditsTooltip = useCallback(({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBord}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{d.nomComplet}</p>
        <p style={{ color: RED, fontSize: 13, fontWeight: 600 }}>Audits : {d.count}</p>
      </div>
    )
  }, [tooltipBg, tooltipBord, axisColor])

  const RowTooltip = () => {
    if (!hoveredRow) return null
    const row = hoveredRow
    const x = Math.min(tooltipPos.x + 16, window.innerWidth - 260)
    const y = Math.min(tooltipPos.y - 10, window.innerHeight - 200)
    return (
      <div style={{
        position: "fixed", left: x, top: y, zIndex: 9999,
        background: tooltipBg, border: `2px solid ${RED}`,
        borderRadius: 8, padding: "12px 16px", minWidth: 240,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)", pointerEvents: "none",
      }}>
        <p style={{ color: textPrimary, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{row.nom}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ color: textSecond, fontSize: 12 }}><span style={{ color: textMuted }}>Région : </span>{row.region}</p>
          <p style={{ color: textSecond, fontSize: 12 }}><span style={{ color: textMuted }}>Ville : </span>{row.ville}</p>
          {row.nbAudits    != null && <p style={{ color: textSecond, fontSize: 12 }}><span style={{ color: textMuted }}>Nb Audits : </span><span style={{ fontWeight: 600, color: textPrimary }}>{row.nbAudits}</span></p>}
          {row.noteMoyenne != null && <p style={{ color: textSecond, fontSize: 12 }}><span style={{ color: textMuted }}>Note Moyenne : </span><span style={{ fontWeight: 700, color: GREEN }}>{fmt(row.noteMoyenne)}</span></p>}
          {row.derniereNote != null && <p style={{ color: textSecond, fontSize: 12 }}><span style={{ color: textMuted }}>Dernière Note : </span><span style={{ fontWeight: 600, color: axisColor }}>{fmt(row.derniereNote)}</span></p>}
          {row.tendance    != null && <p style={{ color: textSecond, fontSize: 12 }}><span style={{ color: textMuted }}>Tendance : </span><TrendBadge value={row.tendance} /></p>}
        </div>
      </div>
    )
  }

  const tableColumns = [
    { key: "nom",          label: "Nom",              width: 180, center: false },
    { key: "region",       label: "Région",           width: 140, center: false },
    { key: "ville",        label: "Ville",            width: 110, center: false },
    { key: "nbAudits",     label: "Nb Audits",        width: 90,  center: true  },
    { key: "noteMoyenne",  label: "Note Moy.",        width: 90,  center: true  },
    { key: "derniereNote", label: "Derni. Note",      width: 90,  center: true  },
    { key: "tendance",     label: "Tendance",         width: 100, center: true  },
  ]

  return (
    <>
      <RowTooltip />
      <div className="grid grid-cols-12 gap-3">

        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">

          {/* Title */}
          <div style={{ ...card(), padding: "14px 18px", background: bg, display: "flex", alignItems: "center", gap: 10 }}>
            <Store size={20} color={RED} />
            <span style={{ fontWeight: 800, fontSize: 18, color: textPrimary }}>Analyse par Magasin</span>
          </div>

          {/* Évolution + Classement */}
          <div className="grid grid-cols-2 gap-3">
            <div style={{ ...card(), padding: "14px 12px", background: bg }}>
              <p className={`text-sm font-medium mb-4 ${titleClass}`}>Évolution par Magasin</p>
              {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={evolutionData} margin={{ left: 0, right: 20, top: 20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={gridColor} />
                    <XAxis dataKey="index" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                    <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                    <Tooltip formatter={(value, _, props) => [value, props.payload.nom]}
                      contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBord}`, borderRadius: 8 }}
                      labelStyle={{ color: axisColor }} />
                    <Line dataKey="note" type="linear" stroke={GREEN} strokeWidth={2}
                      dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false}>
                      <LabelList dataKey="note" position="top" fontSize={11} fill={axisColor} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ ...card(), padding: "14px 12px", background: bg }}>
              <p className={`text-sm font-medium mb-4 ${titleClass}`}>Classement des Magasins</p>
              {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
                <ResponsiveContainer width="100%" height={Math.max(220, classementData.length * 35 + 20)}>
                  <BarChart data={classementData} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                    <YAxis type="category" dataKey="id" tickLine={false} axisLine={false}
                      fontSize={11} width={90} tick={{ fill: axisColor }}
                      tickFormatter={(v) => classementData[v]?.nom ?? ""} />
                    <Tooltip content={<ClassementTooltip />} />
                    <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
                      <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
                      {classementData.map((entry) => <Cell key={entry.id} fill={GREEN} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Nombre d'Audits */}
          <div style={{ ...card(), padding: "14px 12px", background: bg }}>
            <p className={`text-sm font-medium mb-4 ${titleClass}`}>Nombre d'Audits par Magasin</p>
            {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={auditsData} margin={{ left: 0, right: 20, top: 20, bottom: 40 }}>
                  <XAxis dataKey="id" tickLine={false} axisLine={false} fontSize={10}
                    tick={{ fill: axisColor }} angle={-30} textAnchor="end" interval={0}
                    tickFormatter={(v) => auditsData[v]?.nom ?? ""} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} allowDecimals={false} />
                  <Tooltip content={<AuditsTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30} fill={RED} isAnimationActive={false}>
                    <LabelList dataKey="count" position="top" fontSize={11} fill={axisColor} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Tableau */}
        <div className="col-span-12 lg:col-span-5">
          <div style={{ ...card(), fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: bg, overflow: "hidden" }}>
            {/* header table — RED conservé */}
            <div style={{ padding: "12px 16px", background: RED, color: "#fff", fontWeight: 700, fontSize: 14 }}>
              Tableau Comparatif des Magasins
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                <thead>
                  <tr style={{ background: RED }}>
                    {tableColumns.map((col) => (
                      <th key={col.key} style={{
                        minWidth: col.width, padding: "8px 10px", color: "#fff",
                        fontWeight: 700, fontSize: 12,
                        textAlign: col.center ? "center" : "left",
                        borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap",
                      }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={tableColumns.length} style={{ textAlign: "center", padding: 32, color: textMuted, background: bg }}>Chargement…</td></tr>}
                  {error   && <tr><td colSpan={tableColumns.length} style={{ textAlign: "center", padding: 32, color: RED, background: bg }}>{error}</td></tr>}
                  {!loading && !error && tableRows.length === 0 && <tr><td colSpan={tableColumns.length} style={{ textAlign: "center", padding: 32, color: textMuted, background: bg }}>Aucun magasin trouvé.</td></tr>}
                  {!loading && !error && tableRows.map((row, i) => (
                    <tr key={row.id}
                      style={{ background: i % 2 === 0 ? bg : bgAlt, borderBottom: `1px solid ${border}`, transition: "background .15s", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = bgHover; setHoveredRow(row); setTooltipPos({ x: e.clientX, y: e.clientY }) }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? bg : bgAlt; setHoveredRow(null) }}
                    >
                      <td style={{ padding: "7px 10px", fontWeight: 500, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.nom}</td>
                      <td style={{ padding: "7px 10px", color: textSecond, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.region}</td>
                      <td style={{ padding: "7px 10px", color: textSecond, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.ville}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: row.nbAudits ? 600 : 400, color: row.nbAudits ? textPrimary : textMuted }}>{row.nbAudits ?? ""}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: textSecond }}>{fmt(row.noteMoyenne)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: textSecond }}>{fmt(row.derniereNote)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center" }}><TrendBadge value={row.tendance} /></td>
                    </tr>
                  ))}
                </tbody>
                {!loading && !error && tableRows.length > 0 && (
                  <tfoot>
                    <tr style={{ background: RED, color: "#fff", fontWeight: 700, borderTop: `2px solid ${RED}` }}>
                      <td colSpan={3} style={{ padding: "8px 10px" }}>Total</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>{totals.nbAudits || ""}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>{fmt(avgNote)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>{fmt(avgLast)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        <TrendBadge value={avgLast != null && avgNote != null ? avgLast - avgNote : null} />
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
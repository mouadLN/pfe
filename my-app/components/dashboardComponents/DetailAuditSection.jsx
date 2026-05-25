"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { auditSessionService } from "@/services/auditSessionService"
import { useDarkMode } from "@/hooks/useDarkMode"
import { ClipboardList } from "lucide-react"

const RED = "#e8192c"

const getBarColor = (score) => {
  if (score >= 8) return "#16a34a"
  if (score >= 7) return "#f59e0b"
  return RED
}

const getScoreCellBg = (score) => {
  if (score == null) return ""
  if (score >= 8) return "bg-green-600"
  if (score >= 7) return "bg-amber-500"
  return "bg-red-600"
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

const SectionHeader = ({ title, icon: Icon, bg, textMain, cardBorder }) => (
  <div style={{
    border: `1.5px solid ${cardBorder}`,
    borderRadius: 6,
    padding: "14px 18px",
    background: bg,
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
  }}>
    <Icon size={20} color={RED} />
    <span style={{ fontWeight: 800, fontSize: 18, color: textMain, letterSpacing: ".01em" }}>
      {title}
    </span>
  </div>
)

// ─── FloatingTooltip ─────────────────────────────────────────────────────────

const FloatingTooltip = ({ row, mouseX, mouseY, tooltipBg, isDark }) => {
  const CARD_W = 320
  const left = mouseX + CARD_W + 20 > window.innerWidth ? mouseX - CARD_W - 10 : mouseX + 14
  const scoreColor = row.score >= 8 ? "#16a34a" : row.score >= 7 ? "#f59e0b" : RED
  const border  = isDark ? "#3f3f46" : "#e5e7eb"
  const textMain = isDark ? "#f4f4f5" : "#111827"
  const textSub  = isDark ? "#9ca3af" : "#374151"

  return createPortal(
    <div style={{ position: "fixed", left, top: mouseY + 14, zIndex: 9999, background: tooltipBg, border: `2px solid ${RED}`, borderRadius: 8, width: CARD_W, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.7)" : "0 8px 32px rgba(0,0,0,0.18)", pointerEvents: "none", fontSize: 13, overflow: "hidden" }}>
      <div style={{ background: RED, padding: "8px 14px" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Détail Critère</span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Critère</div>
          <div style={{ fontWeight: 700, color: textMain, fontSize: 14, lineHeight: 1.4 }}>{row.critere}</div>
        </div>
        <div style={{ borderTop: `1px solid ${border}`, marginBottom: 10 }} />
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "10px 14px", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Score</div>
            <span style={{ display: "inline-block", background: scoreColor + "22", color: scoreColor, border: `1px solid ${scoreColor}55`, borderRadius: 4, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>
              {row.score ?? "—"}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 10, color: textSub, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Commentaire</div>
            <div style={{ color: textMain, lineHeight: 1.5, fontSize: 12 }}>{row.commentaire || "—"}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── CommentaireRow ───────────────────────────────────────────────────────────

const CommentaireRow = ({ row, i, rowEven, rowOdd, borderClass, textMain, labelClass, tooltipBg, isDark }) => {
  const [tooltip, setTooltip] = useState(null)
  const handleMouseMove  = useCallback((e) => setTooltip({ x: e.clientX, y: e.clientY }), [])
  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  return (
    <tr
      className={`${i % 2 === 0 ? rowEven : rowOdd} border-b ${borderClass}`}
      style={{ cursor: "default", transition: "background .15s" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <td className={`px-3 py-1.5 font-medium ${textMain} whitespace-nowrap`}>{row.critere}</td>
      <td className="px-3 py-1.5 text-center">
        <span className={`inline-block px-2 py-0.5 rounded text-white text-xs font-semibold ${getScoreCellBg(row.score)}`}>
          {row.score ?? "—"}
        </span>
      </td>
      <td className={`px-3 py-1.5 ${labelClass}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
        {row.commentaire}
      </td>
      {tooltip && <FloatingTooltip row={row} mouseX={tooltip.x} mouseY={tooltip.y} tooltipBg={tooltipBg} isDark={isDark} />}
    </tr>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DetailAuditSection() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)
  const isDark = useDarkMode()

  const bg            = isDark ? "#18181b" : "#ffffff"
  const bgClass       = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass    = isDark ? "text-gray-200" : "text-gray-700"
  const labelClass    = isDark ? "text-gray-300" : "text-gray-600"
  const axisColor     = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg     = isDark ? "#111827" : "#ffffff"
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"
  const tableHeaderBg = isDark ? "bg-red-700" : "bg-red-600"
  const rowEven       = isDark ? "bg-zinc-800" : "bg-gray-50"
  const rowOdd        = isDark ? "bg-zinc-900" : "bg-white"
  const textMain      = isDark ? "text-gray-200" : "text-gray-800"
  const textMainRaw   = isDark ? "#f4f4f5" : "#111827"
  const borderClass   = isDark ? "border-zinc-700" : "border-gray-200"

  // ── Neutral card border ──────────────────────────────────────────────────────
  const cardBorder = isDark ? "#ffffff" : "#d1d5db"
  const card = (extra = {}) => ({ border: `1.5px solid ${cardBorder}`, borderRadius: 6, ...extra })

  useEffect(() => {
    auditSessionService.getAll()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : JSON.parse(res.data)
        setSessions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const terminees = useMemo(() =>
    sessions.filter((s) => s.statut === "TERMINE")
      .sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut)),
    [sessions]
  )

  const kpi = useMemo(() => {
    let totalPoints = 0, pointsFaibles = 0
    const notes = []
    terminees.forEach((s) => {
      const scores = s.scores ?? []
      totalPoints += scores.length
      scores.forEach((sc) => { if (sc.score != null && sc.score < 7) pointsFaibles++ })
      if (s.noteGlobale != null) notes.push(s.noteGlobale)
    })
    return {
      noteGlobale:     notes.length ? parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)) : "—",
      pointsControles: totalPoints,
      pointsFaibles,
    }
  }, [terminees])

  const scoresActuels = useMemo(() => {
    const map = {}
    terminees.forEach((s) => {
      ;(s.scores ?? []).forEach((score) => {
        if (score.score == null) return
        const nom = score.auditElement?.nom ?? "Inconnu"
        if (!map[nom]) map[nom] = []
        map[nom].push(score.score)
      })
    })
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2))]))
  }, [terminees])

  const scoresPrecedents = useMemo(() => {
    const map = {}
    terminees.slice(0, -1).forEach((s) => {
      ;(s.scores ?? []).forEach((score) => {
        if (score.score == null) return
        const nom = score.auditElement?.nom ?? "Inconnu"
        if (!map[nom]) map[nom] = []
        map[nom].push(score.score)
      })
    })
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2))]))
  }, [terminees])

  const chart1Data = useMemo(() =>
    Object.entries(scoresActuels)
      .map(([nom, note]) => ({ nom: nom.length > 14 ? nom.slice(0, 14) + "…" : nom, nomComplet: nom, note }))
      .sort((a, b) => b.note - a.note)
      .map((item, i) => ({ ...item, id: i })),
    [scoresActuels]
  )

  const chart2Data = useMemo(() => {
    const allCriteres = new Set([...Object.keys(scoresActuels), ...Object.keys(scoresPrecedents)])
    return Array.from(allCriteres)
      .map((nom) => ({ nom: nom.length > 14 ? nom.slice(0, 14) + "…" : nom, nomComplet: nom, actuel: scoresActuels[nom] ?? null, precedent: scoresPrecedents[nom] ?? null }))
      .filter((d) => d.actuel != null)
      .sort((a, b) => (b.actuel ?? 0) - (a.actuel ?? 0))
      .map((item, i) => ({ ...item, id: i }))
  }, [scoresActuels, scoresPrecedents])

  const commentairesData = useMemo(() => {
    const rows = []
    terminees.forEach((s) => {
      ;(s.scores ?? []).forEach((sc) => {
        if (sc.commentaire) rows.push({ critere: sc.auditElement?.nom ?? "—", score: sc.score, commentaire: sc.commentaire })
      })
    })
    return rows.sort((a, b) => (a.critere ?? "").localeCompare(b.critere ?? ""))
  }, [terminees])

  const totalScores = commentairesData.reduce((acc, r) => acc + (r.score ?? 0), 0)
  const chartHeight = Math.max(chart1Data.length, chart2Data.length) * 42 + 20

  const Tooltip1 = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nomComplet, note } = payload[0].payload
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nomComplet}</p>
        <p style={{ color: getBarColor(note), fontWeight: 700, fontSize: 13 }}>Note : {note}</p>
      </div>
    )
  }

  const Tooltip2 = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nomComplet, actuel, precedent } = payload[0].payload
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nomComplet}</p>
        <p style={{ color: RED,       fontWeight: 600, fontSize: 12 }}>Actuel : {actuel ?? "—"}</p>
        <p style={{ color: "#38bdf8", fontWeight: 600, fontSize: 12 }}>Précédent : {precedent ?? "—"}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <SectionHeader title="Détail Audit" icon={ClipboardList} bg={bg} textMain={textMainRaw} cardBorder={cardBorder} />

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Note Globale",       value: kpi.noteGlobale,     color: "text-red-500"   },
          { label: "Points Contrôlés",   value: kpi.pointsControles, color: "text-teal-500"  },
          { label: "Points Faibles < 7", value: kpi.pointsFaibles,   color: "text-amber-400" },
        ].map((c, i) => (
          <div key={i} style={{ ...card(), padding: "16px" }} className={bgClass}>
            <p className={`text-sm mb-2 ${labelClass}`}>{c.label}</p>
            <p className={`text-4xl font-bold ${c.color}`}>{loading ? "…" : c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts + Tableau */}
      {!loading && chart1Data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">

          {/* Chart 1 */}
          <div style={{ ...card(), padding: "16px" }} className={bgClass}>
            <p className={`text-sm font-medium mb-4 ${titleClass}`}>Scores des Critères d'Audit</p>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={chart1Data} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis type="category" dataKey="id" tickLine={false} axisLine={false} fontSize={11} width={100} tick={{ fill: axisColor }} tickFormatter={(v) => chart1Data[v]?.nom ?? ""} />
                <Tooltip content={<Tooltip1 />} />
                <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                  <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
                  {chart1Data.map((e) => <Cell key={e.id} fill={getBarColor(e.note)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2 */}
          <div style={{ ...card(), padding: "16px" }} className={bgClass}>
            <p className={`text-sm font-medium mb-1 ${titleClass}`}>Comparaison Actuel vs Précédent</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: RED }} /> Score Moyen Session
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#38bdf8" }} /> Score Audit Précédent
              </span>
            </div>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={chart2Data} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }} barGap={2}>
                <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis type="category" dataKey="id" tickLine={false} axisLine={false} fontSize={11} width={100} tick={{ fill: axisColor }} tickFormatter={(v) => chart2Data[v]?.nom ?? ""} />
                <Tooltip content={<Tooltip2 />} />
                <Bar dataKey="actuel"    fill={RED}      radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                  <LabelList dataKey="actuel"    position="right" fontSize={11} fill={axisColor} />
                </Bar>
                <Bar dataKey="precedent" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                  <LabelList dataKey="precedent" position="right" fontSize={11} fill={axisColor} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tableau commentaires */}
          <div style={{ ...card(), overflow: "hidden" }} className={bgClass}>
            <p className={`text-sm font-medium p-3 ${titleClass}`}>Commentaires par Critère</p>
            <div className="overflow-y-auto" style={{ maxHeight: chartHeight + 20 }}>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className={`${tableHeaderBg} text-white`}>
                    <th className="px-3 py-2 text-left font-medium">nom</th>
                    <th className="px-3 py-2 text-center font-medium">Score</th>
                    <th className="px-3 py-2 text-left font-medium">commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {commentairesData.map((row, i) => (
                    <CommentaireRow
                      key={i} row={row} i={i}
                      rowEven={rowEven} rowOdd={rowOdd}
                      borderClass={borderClass} textMain={textMain}
                      labelClass={labelClass} tooltipBg={tooltipBg}
                      isDark={isDark}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className={`${tableHeaderBg} text-white font-bold`}>
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-center">{totalScores}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { auditSessionService } from "@/services/auditSessionService"
import { useDarkMode } from "@/hooks/useDarkMode"
import { BarChart2 } from "lucide-react"

const RED         = "#e8192c"
const BORDER      = "#e5e7eb"
const BORDER_DARK = "#374151"

const getScoreColor = (score) => {
  if (score == null) return { bg: "transparent", text: "transparent" }
  if (score >= 8)    return { bg: "#16a34a", text: "#ffffff" }
  if (score >= 7)    return { bg: "#ca8a04", text: "#ffffff" }
  return               { bg: RED,       text: "#ffffff" }
}

const getBarColor = (score) => {
  if (score >= 8) return "#2dd4bf"
  if (score >= 7) return "#f59e0b"
  return RED
}

const avg = (arr) => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null
const fmt = (n) => (n == null ? "" : Number(n).toFixed(2))

export default function AnalyseCriteresDashboard() {
  const [sessions,   setSessions]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const isDark = useDarkMode()

  const bg          = isDark ? "#18181b" : "#ffffff"
  const bgAlt       = isDark ? "#111827" : "#fafafa"
  const bgHover     = isDark ? "#4b1a20" : "#fde8ea"
  const border      = isDark ? BORDER_DARK : BORDER
  const textPrimary = isDark ? "#f9fafb" : "#111111"
  const textSecond  = isDark ? "#d1d5db" : "#374151"
  const textMuted   = isDark ? "#9ca3af" : "#9ca3af"
  const axisColor   = isDark ? "#9ca3af" : "#6b7280"
  const tooltipBg   = isDark ? "#111827" : "#ffffff"
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"
  const titleClass  = isDark ? "text-gray-300" : "text-gray-600"

  // ── Neutral card border ──────────────────────────────────────────────────────
  const cardBorder = isDark ? "#3f3f46" : "#d1d5db"
  const card = (extra = {}) => ({ border: `1.5px solid ${cardBorder}`, borderRadius: 6, ...extra })

  useEffect(() => {
    auditSessionService.getAll()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : Object.values(res.data)
        setSessions(raw)
      })
      .catch(() => setError("Impossible de charger les données."))
      .finally(() => setLoading(false))
  }, [])

  const allScores = useMemo(() =>
    sessions
      .filter((s) => s.statut === "TERMINE")
      .flatMap((s) => (s.scores ?? []).map((sc) => ({
        ...sc,
        magasin: s.store?.nom ?? "Inconnu",
        critere: sc.auditElement?.nom ?? "Inconnu",
      }))),
    [sessions]
  )

  const stats = useMemo(() => {
    const notes = allScores.map((s) => s.score).filter((s) => s != null)
    if (!notes.length) return null
    return {
      scoreMoyen:      parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
      criteresFaibles: notes.filter((n) => n < 7).length,
      meilleurScore:   Math.max(...notes),
    }
  }, [allScores])

  const { criteres, magasins, matrix, totauxCriteres, totauxMagasins, moyenneGlobale } = useMemo(() => {
    const map = {}
    allScores.forEach(({ magasin, critere, score }) => {
      if (score == null) return
      if (!map[critere])          map[critere] = {}
      if (!map[critere][magasin]) map[critere][magasin] = []
      map[critere][magasin].push(score)
    })
    const criteresList = Object.keys(map).sort()
    const magasinsSet  = new Set()
    criteresList.forEach((c) => Object.keys(map[c]).forEach((m) => magasinsSet.add(m)))
    const magasinsList = Array.from(magasinsSet).sort()
    const matrix = {}
    criteresList.forEach((c) => {
      matrix[c] = {}
      magasinsList.forEach((m) => { matrix[c][m] = avg(map[c]?.[m] ?? []) })
    })
    const totauxCriteres = {}
    criteresList.forEach((c) => { totauxCriteres[c] = avg(magasinsList.map((m) => matrix[c][m]).filter((v) => v != null)) })
    const totauxMagasins = {}
    magasinsList.forEach((m) => { totauxMagasins[m] = avg(criteresList.map((c) => matrix[c][m]).filter((v) => v != null)) })
    const moyenneGlobale = avg(Object.values(totauxMagasins).filter((v) => v != null))
    return { criteres: criteresList, magasins: magasinsList, matrix, totauxCriteres, totauxMagasins, moyenneGlobale }
  }, [allScores])

  const classementData = useMemo(() => {
    const map = {}
    allScores.forEach(({ critere, score }) => {
      if (score == null) return
      if (!map[critere]) map[critere] = []
      map[critere].push(score)
    })
    return Object.entries(map)
      .map(([nom, scores]) => ({
        nomComplet: nom,
        nom: nom.length > 22 ? nom.slice(0, 22) + "…" : nom,
        note: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
      .map((item, i) => ({ ...item, id: i }))
  }, [allScores])

  const hasData         = criteres.length > 0 && magasins.length > 0
  const displayCriteres = hasData ? criteres : ["Disposition des articles","Éclairage","Façade","Musique","Parking","Sol","Vitrine"]
  const displayMagasins = hasData ? magasins : ["ELECTROPLANET A","ELECTROPLANET B","ELECTROPLANET C"]

  const HeatmapRowTooltip = () => {
    if (!hoveredRow) return null
    const score = hasData ? totauxCriteres[hoveredRow] ?? null : null
    const x = Math.min(tooltipPos.x + 16, window.innerWidth - 260)
    const y = Math.min(tooltipPos.y - 10, window.innerHeight - 160)
    return (
      <div style={{
        position: "fixed", left: x, top: y, zIndex: 9999,
        background: tooltipBg, border: `2px solid ${RED}`,
        borderRadius: 8, padding: "12px 16px", minWidth: 220,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)", pointerEvents: "none",
      }}>
        <p style={{ color: textPrimary, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{hoveredRow}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {hasData && magasins.map((m) => {
            const s = matrix[hoveredRow]?.[m] ?? null
            const { bg: cellBg, text: cellText } = getScoreColor(s)
            return (
              <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ color: textSecond, fontSize: 11, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.replace("ELECTROPLANET ", "EP ")}
                </span>
                {s != null
                  ? <span style={{ background: cellBg, color: cellText, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{Number(s).toFixed(2)}</span>
                  : <span style={{ color: textMuted, fontSize: 11 }}>—</span>}
              </div>
            )
          })}
          {score != null && (
            <div style={{ marginTop: 6, borderTop: `1px solid ${border}`, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: textMuted, fontSize: 11, fontWeight: 600 }}>Moyenne critère</span>
              <span style={{ color: "#fff", background: getScoreColor(score).bg, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{fmt(score)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const ClassementTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { nomComplet, note } = payload[0].payload
    return (
      <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: axisColor, fontSize: 12, marginBottom: 4 }}>{nomComplet}</p>
        <p style={{ color: getBarColor(note), fontWeight: 700, fontSize: 13 }}>Note : {note}</p>
      </div>
    )
  }

  return (
    <>
      <HeatmapRowTooltip />
      <div className="grid grid-cols-12 gap-3">

        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">

          {/* Title */}
          <div style={{ ...card(), padding: "14px 18px", background: bg, display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 size={20} color={RED} />
            <span style={{ fontWeight: 800, fontSize: 18, color: textPrimary }}>Analyse par Critère d'Audit</span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            {loading ? (
              <div style={{ ...card(), padding: "14px 16px", background: bg, gridColumn: "span 3" }}>
                <p className="text-sm text-gray-400">Chargement...</p>
              </div>
            ) : !stats ? (
              <div style={{ ...card(), padding: "14px 16px", background: bg, gridColumn: "span 3" }}>
                <p className="text-sm text-gray-400">Aucune donnée disponible</p>
              </div>
            ) : (
              [
                { label: "Score Moyen Critères", value: `${stats.scoreMoyen}/10`, color: "text-red-500"   },
                { label: "Critères < 7/10",      value: stats.criteresFaibles,    color: "text-amber-400" },
                { label: "Meilleur Score",        value: stats.meilleurScore,      color: "text-teal-500"  },
              ].map((c, i) => (
                <div key={i} style={{ ...card(), padding: "14px 16px", background: bg }}>
                  <p className={`text-sm mb-2 ${titleClass}`}>{c.label}</p>
                  <p className={`text-4xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))
            )}
          </div>

          {/* Heatmap — header RED conservé */}
          <div style={{ ...card(), fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: bg, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: RED, color: "#fff", fontWeight: 700, fontSize: 14 }}>
              Heatmap Critères × Magasins
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: RED }}>
                    <th style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, fontSize: 12, textAlign: "left", borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap", minWidth: 160, position: "sticky", left: 0, zIndex: 2, background: RED }}>nom</th>
                    {displayMagasins.map((m, i) => (
                      <th key={i} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, fontSize: 12, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap", minWidth: 160 }}>{m}</th>
                    ))}
                    <th style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, fontSize: 12, textAlign: "center", whiteSpace: "nowrap", minWidth: 80 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={displayMagasins.length + 2} style={{ textAlign: "center", padding: 32, color: textMuted, background: bg }}>Chargement…</td></tr>}
                  {error   && <tr><td colSpan={displayMagasins.length + 2} style={{ textAlign: "center", padding: 32, color: RED, background: bg }}>{error}</td></tr>}
                  {!loading && !error && displayCriteres.map((critere, i) => {
                    const rowBg     = i % 2 === 0 ? bg : bgAlt
                    const isHovered = hoveredRow === critere
                    const currentBg = isHovered ? bgHover : rowBg
                    return (
                      <tr key={critere} style={{ borderBottom: `1px solid ${border}`, cursor: "pointer" }}
                        onMouseEnter={(e) => { setHoveredRow(critere); setTooltipPos({ x: e.clientX, y: e.clientY }) }}
                        onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredRow(null)}>
                        <td style={{ padding: "7px 10px", fontWeight: 500, color: textPrimary, whiteSpace: "nowrap", borderRight: `1px solid ${border}`, position: "sticky", left: 0, background: currentBg, zIndex: 1, minWidth: 160, transition: "background .15s" }}>{critere}</td>
                        {displayMagasins.map((m) => {
                          const score = hasData ? matrix[critere]?.[m] ?? null : null
                          const { bg: cellBg, text: cellText } = getScoreColor(score)
                          return (
                            <td key={m} style={{ padding: "7px 10px", textAlign: "center", background: score != null ? cellBg : currentBg, color: score != null ? cellText : textMuted, fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", borderRight: `1px solid ${border}`, minWidth: 120, transition: "background .15s" }}>
                              {score != null ? Number(score).toFixed(2) : ""}
                            </td>
                          )
                        })}
                        {(() => {
                          const score = hasData ? totauxCriteres[critere] ?? null : null
                          const { bg: cellBg, text: cellText } = getScoreColor(score)
                          return <td style={{ padding: "7px 10px", textAlign: "center", background: score != null ? cellBg : currentBg, color: score != null ? cellText : textMuted, fontWeight: 700, fontSize: 12, minWidth: 80, transition: "background .15s" }}>{score != null ? Number(score).toFixed(2) : ""}</td>
                        })()}
                      </tr>
                    )
                  })}
                </tbody>
                {!loading && !error && (
                  <tfoot>
                    <tr style={{ background: RED, color: "#fff", fontWeight: 700, borderTop: `2px solid ${RED}` }}>
                      <td style={{ padding: "8px 10px", position: "sticky", left: 0, background: RED, zIndex: 1 }}>Total</td>
                      {displayMagasins.map((m) => <td key={m} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 12 }}>{hasData ? fmt(totauxMagasins[m]) : ""}</td>)}
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 12 }}>{hasData ? fmt(moyenneGlobale) : ""}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-5">
          <div style={{ ...card(), padding: "16px", background: bg, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <p style={{ color: textPrimary, fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Classement des Critères d'Audit</p>
            {loading ? <p style={{ color: axisColor, fontSize: 13 }}>Chargement…</p>
            : classementData.length === 0 ? <p style={{ color: axisColor, fontSize: 13, fontStyle: "italic" }}>Aucune donnée disponible.</p>
            : (
              <ResponsiveContainer width="100%" height={classementData.length * 42 + 20}>
                <BarChart data={classementData} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                  <YAxis type="category" dataKey="id" tickLine={false} axisLine={false} fontSize={12} width={140} tick={{ fill: axisColor }} tickFormatter={(value) => classementData[value]?.nom ?? ""} />
                  <Tooltip content={<ClassementTooltip />} />
                  <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false}>
                    <LabelList dataKey="note" position="right" fontSize={12} fill={axisColor} />
                    {classementData.map((entry) => <Cell key={entry.id} fill={getBarColor(entry.note)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
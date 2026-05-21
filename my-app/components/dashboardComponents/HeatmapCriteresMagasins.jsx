"use client"

import { useState, useEffect, useMemo } from "react"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

const RED = "#e8192c"
const BORDER = "#e5e7eb"
const BORDER_DARK = "#374151"

const getScoreColor = (score) => {
  if (score == null) return { bg: "transparent", text: "transparent" }
  if (score >= 8)    return { bg: "#16a34a", text: "#ffffff" }
  if (score >= 7)    return { bg: "#ca8a04", text: "#ffffff" }
  return               { bg: RED,       text: "#ffffff" }
}

export default function HeatmapCriteresMagasins() {
  const [missions, setMissions]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const isDark = useDarkMode()

  const bg          = isDark ? "#1f2937" : "#ffffff"
  const bgAlt       = isDark ? "#111827" : "#fafafa"
  const bgHover     = isDark ? "#4b1a20" : "#fde8ea"
  const textPrimary = isDark ? "#f9fafb" : "#111111"
  const textMuted   = isDark ? "#9ca3af" : "#9ca3af"
  const border      = isDark ? BORDER_DARK : BORDER

  useEffect(() => {
    missionService.getAll()
      .then((res) => { setMissions(res.data ?? []); setLoading(false) })
      .catch((e)  => { console.error(e); setError("Impossible de charger les données."); setLoading(false) })
  }, [])

  const { criteres, magasins, matrix, totauxCriteres, totauxMagasins, moyenneGlobale } = useMemo(() => {
    const map = {}

    missions.forEach((m) => {
      const magasin = m.store?.nom ?? "Inconnu"
      const scores  = m.auditSession?.scores ?? []
      scores.forEach((s) => {
        if (s.score == null) return
        const critere = s.auditElement?.nom ?? "Inconnu"
        if (!map[critere])          map[critere] = {}
        if (!map[critere][magasin]) map[critere][magasin] = []
        map[critere][magasin].push(s.score)
      })
    })

    const criteres    = Object.keys(map).sort()
    const magasinsSet = new Set()
    criteres.forEach((c) => Object.keys(map[c]).forEach((m) => magasinsSet.add(m)))
    const magasins = Array.from(magasinsSet).sort()

    const avg = (arr) => arr.length
      ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
      : null

    const matrix = {}
    criteres.forEach((c) => {
      matrix[c] = {}
      magasins.forEach((m) => { matrix[c][m] = avg(map[c]?.[m] ?? []) })
    })

    const totauxCriteres = {}
    criteres.forEach((c) => {
      const vals = magasins.map((m) => matrix[c][m]).filter((v) => v != null)
      totauxCriteres[c] = avg(vals)
    })

    const totauxMagasins = {}
    magasins.forEach((m) => {
      const vals = criteres.map((c) => matrix[c][m]).filter((v) => v != null)
      totauxMagasins[m] = avg(vals)
    })

    const allVals        = Object.values(totauxMagasins).filter((v) => v != null)
    const moyenneGlobale = avg(allVals)

    return { criteres, magasins, matrix, totauxCriteres, totauxMagasins, moyenneGlobale }
  }, [missions])

  const hasData = criteres.length > 0 && magasins.length > 0
  const fmt     = (n) => (n == null ? "" : Number(n).toFixed(2))

  const placeholderCriteres = ["Disposition des articles", "Éclairage", "Façade", "Musique", "Parking", "Sol", "Vitrine"]
  const placeholderMagasins = ["ELECTROPLANET A", "ELECTROPLANET B", "ELECTROPLANET C"]

  const displayCriteres = hasData ? criteres : placeholderCriteres
  const displayMagasins = hasData ? magasins : placeholderMagasins

  return (
    <div style={{
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 13,
      background: bg,
      border: `2px solid ${RED}`,
      borderRadius: 6,
      overflow: "hidden",
      transition: "background .2s, color .2s",
    }}>
      <div style={{
        padding: "12px 16px",
        background: RED,
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: ".02em",
      }}>
        Heatmap Critères × Magasins
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: RED }}>
              <th style={{
                padding: "8px 10px",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                textAlign: "left",
                borderRight: "1px solid rgba(255,255,255,0.2)",
                whiteSpace: "nowrap",
                minWidth: 160,
                position: "sticky",
                left: 0,
                zIndex: 2,
                background: RED,
              }}>
                nom
              </th>
              {displayMagasins.map((m, i) => (
                <th key={i} style={{
                  padding: "8px 10px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: "center",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                  whiteSpace: "nowrap",
                  minWidth: 160,
                }}>
                  {m}
                </th>
              ))}
              <th style={{
                padding: "8px 10px",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                textAlign: "center",
                whiteSpace: "nowrap",
                minWidth: 80,
              }}>
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={displayMagasins.length + 2} style={{ textAlign: "center", padding: 32, color: textMuted, background: bg }}>
                  Chargement…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={displayMagasins.length + 2} style={{ textAlign: "center", padding: 32, color: RED, background: bg }}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && displayCriteres.map((critere, i) => {
              const rowBg     = i % 2 === 0 ? bg : bgAlt
              const isHovered = hoveredRow === critere
              const currentBg = isHovered ? bgHover : rowBg

              return (
                <tr
                  key={critere}
                  style={{ borderBottom: `1px solid ${border}` }}
                  onMouseEnter={() => setHoveredRow(critere)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{
                    padding: "7px 10px",
                    fontWeight: 500,
                    color: textPrimary,
                    whiteSpace: "nowrap",
                    borderRight: `1px solid ${border}`,
                    position: "sticky",
                    left: 0,
                    background: currentBg,
                    zIndex: 1,
                    minWidth: 160,
                    transition: "background .15s",
                  }}>
                    {critere}
                  </td>

                  {displayMagasins.map((m) => {
                    const score = hasData ? matrix[critere]?.[m] ?? null : null
                    const { bg: cellBg, text: cellText } = getScoreColor(score)
                    return (
                      <td key={m} style={{
                        padding: "7px 10px",
                        textAlign: "center",
                        background: score != null ? cellBg : currentBg,
                        color: score != null ? cellText : textMuted,
                        fontWeight: 600,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        borderRight: `1px solid ${border}`,
                        minWidth: 120,
                        transition: "background .15s",
                      }}>
                        {score != null ? Number(score).toFixed(2) : ""}
                      </td>
                    )
                  })}

                  {(() => {
                    const score = hasData ? totauxCriteres[critere] ?? null : null
                    const { bg: cellBg, text: cellText } = getScoreColor(score)
                    return (
                      <td style={{
                        padding: "7px 10px",
                        textAlign: "center",
                        background: score != null ? cellBg : currentBg,
                        color: score != null ? cellText : textMuted,
                        fontWeight: 700,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        minWidth: 80,
                        transition: "background .15s",
                      }}>
                        {score != null ? Number(score).toFixed(2) : ""}
                      </td>
                    )
                  })()}
                </tr>
              )
            })}
          </tbody>

          {!loading && !error && (
            <tfoot>
              <tr style={{ background: RED, color: "#fff", fontWeight: 700, borderTop: `2px solid ${RED}` }}>
                <td style={{ padding: "8px 10px", position: "sticky", left: 0, background: RED, zIndex: 1 }}>
                  Total
                </td>
                {displayMagasins.map((m) => (
                  <td key={m} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 12 }}>
                    {hasData ? fmt(totauxMagasins[m]) : ""}
                  </td>
                ))}
                <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 12 }}>
                  {hasData ? fmt(moyenneGlobale) : ""}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {!loading && !error && !hasData && (
        <p style={{ padding: "8px 16px 12px", color: textMuted, fontSize: 12, fontStyle: "italic" }}>
          En attente des données de scores — sera connecté au service audit session.
        </p>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

const RED = "#e8192c"

const STATUT_COLORS = {
  TERMINEE:  "#14b8a6",
  PLANIFIEE: "#3b82f6",
  EN_COURS:  "#f59e0b",
  ANNULEE:   "#ef4444",
}

const StatutBadge = ({ statut }) => {
  const color = STATUT_COLORS[statut] ?? "#6b7280"
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}55`,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {statut}
    </span>
  )
}

const fmt = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
}

const fmtShort = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function DetailMissions() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const isDark = useDarkMode()

  // ── theme tokens ──────────────────────────────────────────────────────────
  const bg        = isDark ? "#18181b" : "#ffffff"
  const bgAlt     = isDark ? "#09090b" : "#fafafa"
  const bgHover   = isDark ? "#3b0a0a" : "#fde8ea"
  const border    = isDark ? "#3f3f46" : "#e5e7eb"
  const textMain  = isDark ? "#f4f4f5" : "#111827"
  const textSub   = isDark ? "#9ca3af" : "#374151"

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await missionService.getAll()
        const missions = res.data ?? []
        // Sort by id desc (most recent first)
        missions.sort((a, b) => b.id - a.id)
        setRows(missions)
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les missions.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    { key: "id",          label: "id",          width: "5%",  center: true  },
    { key: "store",       label: "nom",          width: "20%", center: false },
    { key: "auditeur",    label: "nom",          width: "10%", center: false },
    { key: "dateDebut",   label: "date_debut",   width: "10%", center: true  },
    { key: "dateFin",     label: "date_fin",     width: "20%", center: false },
    { key: "statut",      label: "statut",       width: "12%", center: true  },
  ]

  return (
    <div style={{
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 13,
      background: bg,
      border: `2px solid ${RED}`,
      borderRadius: 6,
      overflow: "hidden",
    }}>
      {/* Title bar */}
      <div style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${border}`,
        fontWeight: 700,
        fontSize: 14,
        color: RED,
        letterSpacing: ".02em",
        background: bg,
      }}>
        Détail des Missions
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          {/* Header */}
          <thead>
            <tr style={{ background: RED }}>
              {columns.map((col) => (
                <th key={col.key + col.label} style={{
                  width: col.width,
                  padding: "8px 10px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: col.center ? "center" : "left",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                  whiteSpace: "nowrap",
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: textSub }}>
                  Chargement…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: RED }}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: textSub }}>
                  Aucune mission trouvée.
                </td>
              </tr>
            )}

            {!loading && !error && rows.map((row, i) => (
              <tr
                key={row.id}
                style={{
                  background: i % 2 === 0 ? bg : bgAlt,
                  borderBottom: `1px solid ${border}`,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = bgHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? bg : bgAlt)}
              >
                {/* id */}
                <td style={{ padding: "7px 10px", textAlign: "center", color: textSub, fontWeight: 600 }}>
                  {row.id}
                </td>
                {/* store nom */}
                <td style={{ padding: "7px 10px", fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.store?.nom ?? "—"}
                </td>
                {/* auditeur nom */}
                <td style={{ padding: "7px 10px", color: textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.auditeur?.nom ?? "—"}
                </td>
                {/* date debut */}
                <td style={{ padding: "7px 10px", textAlign: "center", color: textSub, whiteSpace: "nowrap" }}>
                  {fmtShort(row.dateDebut)}
                </td>
                {/* date fin (longue) */}
                <td style={{ padding: "7px 10px", color: textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fmt(row.dateFin)}
                </td>
                {/* statut */}
                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                  <StatutBadge statut={row.statut} />
                </td>
              </tr>
            ))}
          </tbody>

          {/* Total row */}
          {!loading && !error && rows.length > 0 && (
            <tfoot>
              <tr style={{
                background: isDark ? "#27272a" : "#f3f4f6",
                borderTop: `2px solid ${border}`,
              }}>
                <td colSpan={columns.length} style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: textMain,
                  fontSize: 12,
                }}>
                  Total — {rows.length} mission{rows.length > 1 ? "s" : ""}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
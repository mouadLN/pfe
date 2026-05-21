"use client"

import { useState, useEffect } from "react"
import { missionService } from "@/services/missionService"
import { storeService } from "@/services/storeService"
import { useDarkMode } from "@/hooks/useDarkMode"

const RED = "#e8192c"
const BORDER = "#e5e7eb"
const BORDER_DARK = "#374151"

const TrendBadge = ({ value }) => {
  if (value == null) return <span style={{ color: "#9ca3af" }}>—</span>
  const isUp = value > 0
  const isFlat = value === 0
  return (
    <span style={{
      color: isFlat ? "#6b7280" : isUp ? "#16a34a" : RED,
      fontWeight: 600,
      fontSize: 12,
    }}>
      {isFlat ? "— Stable" : isUp ? "↑ Hausse" : "↓ Baisse"}
    </span>
  )
}

export default function TableauComparatifMagasins() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isDark = useDarkMode()

  // ── Dynamic theme values ─────────────────────────────────────────────────
  const bg          = isDark ? "#1f2937" : "#ffffff"
  const bgAlt       = isDark ? "#111827" : "#fafafa"
  const bgHover     = isDark ? "#4b1a20" : "#fde8ea"
  const textPrimary = isDark ? "#f9fafb" : "#111111"
  const textSecond  = isDark ? "#d1d5db" : "#374151"
  const textMuted   = isDark ? "#9ca3af" : "#9ca3af"
  const border      = isDark ? BORDER_DARK : BORDER

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [storesRes, statsByStoreRes, missionsRes] = await Promise.all([
          storeService.getAll(),
          missionService.getStatsByStore(),
          missionService.getAll(),
        ])

        const stores    = storesRes.data     ?? []
        const statPairs = statsByStoreRes.data ?? []
        const missions  = missionsRes.data   ?? []

        const auditMap = {}
        for (const pair of statPairs) {
          if (Array.isArray(pair)) {
            auditMap[pair[0]] = pair[1]
          } else {
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

        const merged = stores.map((store) => {
          const storeMissions = missionsByStore[store.nom] ?? []

          const noted = storeMissions
            .filter((m) => m.auditSession?.noteGlobale != null)
            .sort((a, b) => new Date(a.auditSession.dateDebut ?? 0) - new Date(b.auditSession.dateDebut ?? 0))

          const nbAudits     = auditMap[store.nom] ?? null
          const noteMoyenne  = noted.length
            ? noted.reduce((s, m) => s + m.auditSession.noteGlobale, 0) / noted.length
            : null
          const derniereNote = noted.length ? noted[noted.length - 1].auditSession.noteGlobale : null

          let tendance = null
          if (noted.length >= 2) {
            tendance = noted[noted.length - 1].auditSession.noteGlobale - noted[noted.length - 2].auditSession.noteGlobale
          }

          return {
            id: store.id,
            nom: store.nom,
            region: store.region ?? "—",
            ville: store.ville ?? "—",
            nbAudits,
            noteMoyenne,
            derniereNote,
            tendance,
          }
        })

        merged.sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
        setRows(merged)
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les données.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ── Totals ───────────────────────────────────────────────────────────────
  const totals = rows.reduce(
    (acc, r) => {
      acc.nbAudits += r.nbAudits ?? 0
      if (r.noteMoyenne  != null) { acc.noteSum  += r.noteMoyenne;  acc.noteCount++ }
      if (r.derniereNote != null) { acc.lastSum  += r.derniereNote; acc.lastCount++ }
      return acc
    },
    { nbAudits: 0, noteSum: 0, noteCount: 0, lastSum: 0, lastCount: 0 }
  )
  const avgNote = totals.noteCount ? totals.noteSum / totals.noteCount : null
  const avgLast = totals.lastCount ? totals.lastSum / totals.lastCount : null

  const fmt = (n) => (n == null ? "" : Number(n).toFixed(2))

  const columns = [
    { key: "nom",          label: "nom",                   width: "22%", center: false },
    { key: "region",       label: "region",                width: "16%", center: false },
    { key: "ville",        label: "ville",                 width: "10%", center: false },
    { key: "nbAudits",     label: "Nb Audits par Magasin", width: "13%", center: true  },
    { key: "noteMoyenne",  label: "Note Moyenne Magasin",  width: "13%", center: true  },
    { key: "derniereNote", label: "Dernière Note Magasin", width: "13%", center: true  },
    { key: "tendance",     label: "Tendance Magasin",      width: "13%", center: true  },
  ]

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
      {/* Title bar */}
      <div style={{
        padding: "12px 16px",
        background: RED,
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: ".02em",
      }}>
        Tableau Comparatif des Magasins
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: RED }}>
              {columns.map((col) => (
                <th key={col.key} style={{
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
              <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: textMuted, background: bg }}>
                Chargement…
              </td></tr>
            )}
            {error && (
              <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: RED, background: bg }}>
                {error}
              </td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: textMuted, background: bg }}>
                Aucun magasin trouvé.
              </td></tr>
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
                <td style={{ padding: "7px 10px", fontWeight: 500, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.nom}
                </td>
                <td style={{ padding: "7px 10px", color: textSecond, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.region}
                </td>
                <td style={{ padding: "7px 10px", color: textSecond, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.ville}
                </td>
                <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: row.nbAudits ? 600 : 400, color: row.nbAudits ? textPrimary : textMuted }}>
                  {row.nbAudits ?? ""}
                </td>
                <td style={{ padding: "7px 10px", textAlign: "center", color: textSecond }}>
                  {fmt(row.noteMoyenne)}
                </td>
                <td style={{ padding: "7px 10px", textAlign: "center", color: textSecond }}>
                  {fmt(row.derniereNote)}
                </td>
                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                  <TrendBadge value={row.tendance} />
                </td>
              </tr>
            ))}
          </tbody>

          {!loading && !error && rows.length > 0 && (
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
  )
}
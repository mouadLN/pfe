"use client"

import { useEffect, useState, useMemo } from "react"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LabelList, CartesianGrid,
  PieChart, Pie, Legend,
} from "recharts"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"
import { ClipboardList, TrendingUp, Star, Award, Calendar } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = "#e8192c"

const STATUT_COLORS = {
  TERMINEE:  "#00C9A7",
  EN_COURS:  "#F5A623",
  PLANIFIEE: "#4FC3F7",
  ANNULEE:   "#E8001D",
}

const PERIODES = [
  { label: "Tout",          value: "" },
  { label: "Janvier 2025",  value: "2025-01" },
  { label: "Février 2025",  value: "2025-02" },
  { label: "Mars 2025",     value: "2025-03" },
  { label: "Avril 2025",    value: "2025-04" },
  { label: "Mai 2025",      value: "2025-05" },
]

const fmtDate = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// ─── StatutBadge ─────────────────────────────────────────────────────────────

const StatutBadge = ({ statut }) => {
  const color = STATUT_COLORS[statut] ?? "#6b7280"
  return (
    <span style={{
      background: color + "22", color,
      border: `1px solid ${color}55`,
      borderRadius: 4, padding: "2px 8px",
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {statut}
    </span>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardAuditeur() {
  const [allMissions, setAllMissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [periode, setPeriode]         = useState("")
  const [auditeur, setAuditeur]       = useState({ nom: "", prenom: "" })
  const isDark = useDarkMode()

  // ── Theme ──────────────────────────────────────────────────────────────────
  const bg         = isDark ? "#18181b" : "#ffffff"
  const bgAlt      = isDark ? "#09090b" : "#fafafa"
  const textMain   = isDark ? "#f4f4f5" : "#111827"
  const textSub    = isDark ? "#9ca3af" : "#374151"
  const textMuted  = isDark ? "#6b7280" : "#9ca3af"
  const axisColor  = isDark ? "#9ca3af" : "#6b7280"
  const gridColor  = isDark ? "#3f3f46" : "#f0f0f0"
  const borderRow  = isDark ? "#3f3f46" : "#e5e7eb"
  const tooltipBg  = isDark ? "#18181b" : "#ffffff"
  const tooltipBdr = isDark ? "#3f3f46" : "#e5e7eb"
  const titleCls   = isDark ? "text-gray-300" : "text-gray-600"
  const cardBorder = isDark ? "#3f3f46" : "#d1d5db"
  const inputCls   = isDark
    ? "w-full text-sm text-gray-100 bg-zinc-900 border-none outline-none cursor-pointer"
    : "w-full text-sm text-gray-800 bg-white border-none outline-none cursor-pointer"

  const card = (extra = {}) => ({
    border: `1.5px solid ${cardBorder}`,
    borderRadius: 8,
    background: bg,
    ...extra,
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}")
    setAuditeur(stored)

    // userCode est directement disponible dans le user stocké
    const userCode = stored.userCode

    if (!userCode) {
      console.error("userCode introuvable dans localStorage:", stored)
      setLoading(false)
      return
    }

    missionService.getByAuditeur(userCode)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? res.data?.data ?? [])
        setAllMissions(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Filter by auditeur + période ──────────────────────────────────────────
  const missions = useMemo(() => {
    return allMissions.filter((m) => {
      // ── Filtre auditeur ──────────────────────────────────────────────────
      // Essai 1 : par ID (le plus fiable)
      if (auditeur.id && m.auditeur?.id) {
        if (String(m.auditeur.id) !== String(auditeur.id)) return false
      } else if (auditeur.nom || auditeur.prenom) {
        // Essai 2 : matching souple sur le nom
        const mNom = (m.auditeur?.nom ?? "").toLowerCase()
        const uNom = (auditeur.nom ?? "").toLowerCase()
        const uPrenom = (auditeur.prenom ?? "").toLowerCase()
        // accepte si le nom de la mission contient le nom OU le prénom de l'utilisateur
        const match =
          (uNom    && mNom.includes(uNom))    ||
          (uPrenom && mNom.includes(uPrenom)) ||
          mNom === `${uPrenom} ${uNom}`       ||
          mNom === `${uNom} ${uPrenom}`
        if (!match) return false
      }

      // ── Filtre période ───────────────────────────────────────────────────
      if (periode) {
        const d = new Date(m.dateDebut)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        if (key !== periode) return false
      }
      return true
    })
  }, [allMissions, auditeur, periode])

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const avecNote = missions.filter((m) => m.auditSession?.noteGlobale != null)
    const notes = avecNote.map((m) => m.auditSession.noteGlobale)
    const moy = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null
    const max = notes.length ? Math.max(...notes) : null
    const last = avecNote.length
      ? [...avecNote].sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))[0].auditSession.noteGlobale
      : null
    return {
      total:       missions.length,
      noteMoyenne: moy != null ? moy.toFixed(2) : "—",
      meilleur:    max != null ? max.toFixed(2)  : "—",
      dernier:     last != null ? last.toFixed(2) : "—",
    }
  }, [missions])

  // ── Évolution ────────────────────────────────────────────────────────────
  const evolutionData = useMemo(() => {
    return missions
      .filter((m) => m.auditSession?.noteGlobale != null)
      .sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut))
      .map((m, i) => ({
        index: i + 1,
        note: parseFloat(m.auditSession.noteGlobale.toFixed(2)),
        label: m.store?.nom ?? `Audit ${i + 1}`,
      }))
  }, [missions])

  // ── Magasins audités ─────────────────────────────────────────────────────
  const magasinsData = useMemo(() => {
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
        nom: nom.length > 12 ? nom.slice(0, 12) + "…" : nom,
        note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
      .map((item, i) => ({ ...item, id: i }))
  }, [missions])

  // ── Missions planifiées ──────────────────────────────────────────────────
  const planifiees = useMemo(() =>
    missions
      .filter((m) => m.statut === "PLANIFIEE" || m.statut === "EN_COURS")
      .sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut)),
    [missions]
  )

  // ── Points forts / faibles ───────────────────────────────────────────────
  const pointsData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      ;(m.auditSession?.scores ?? []).forEach((sc) => {
        if (sc.score == null) return
        const nom = sc.auditElement?.nom ?? "Inconnu"
        if (!map[nom]) map[nom] = []
        map[nom].push(sc.score)
      })
    })
    return Object.entries(map)
      .map(([nom, scores]) => ({
        nomComplet: nom,
        nom: nom.length > 20 ? nom.slice(0, 20) + "…" : nom,
        note: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
      .slice(0, 8)
      .map((item, i) => ({ ...item, id: i }))
  }, [missions])

  // ── Statut donut ─────────────────────────────────────────────────────────
  const statutData = useMemo(() => {
    const map = {}
    missions.forEach((m) => { map[m.statut] = (map[m.statut] ?? 0) + 1 })
    return Object.entries(map).map(([statut, count]) => ({
      statut, count, fill: STATUT_COLORS[statut] ?? "#8884d8",
    }))
  }, [missions])

  const ttStyle = { background: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: 8 }

  const getBarColor = (note) => {
    if (note >= 8) return "#00C9A7"
    if (note >= 7) return "#F5A623"
    return RED
  }

  const displayName = `${auditeur.prenom || ""} ${auditeur.nom || ""}`.trim() || "Auditeur"

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 p-4" style={{ background: bg, minHeight: "100%" }}>

      {/* ── 1. Header ── */}
      <div style={{ ...card(), padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <ClipboardList size={20} color={RED} />
        <span style={{ fontWeight: 800, fontSize: 18, color: textMain, letterSpacing: ".01em" }}>
          Mon Tableau de Bord — {displayName.toUpperCase()}
        </span>
      </div>

      {/* ── 2. Filtre période ── */}
      <div style={{ ...card(), padding: "10px 14px", maxWidth: 300 }}>
        <label style={{ display: "block", fontSize: 11, color: textMuted, marginBottom: 4 }}>
          Période
        </label>
        <select value={periode} onChange={(e) => setPeriode(e.target.value)} className={inputCls}>
          {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* ── 3. KPI cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Mes Audits",      value: kpi.total,       color: "text-teal-500",  icon: <Calendar   size={16} color="#14b8a6" /> },
          { label: "Ma Note Moyenne", value: kpi.noteMoyenne, color: "text-red-500",   icon: <TrendingUp size={16} color={RED}      /> },
          { label: "Meilleur Score",  value: kpi.meilleur,    color: "text-amber-400", icon: <Star       size={16} color="#f59e0b"  /> },
          { label: "Dernier Score",   value: kpi.dernier,     color: "text-teal-500",  icon: <Award      size={16} color="#14b8a6"  /> },
        ].map((c, i) => (
          <div key={i} style={{ ...card(), padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              {c.icon}
              <p style={{ fontSize: 13, color: textSub, margin: 0 }}>{c.label}</p>
            </div>
            <p className={`text-3xl font-bold ${c.color}`} style={{ margin: 0 }}>
              {loading ? "…" : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── 4. Évolution + Magasins ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Évolution */}
        <div style={{ ...card(), padding: "14px 16px" }}>
          <p className={`text-sm font-medium mb-4 ${titleCls}`}>Évolution de mes Notes</p>
          {loading ? <p className="text-sm text-gray-400">Chargement...</p>
          : evolutionData.length === 0 ? <p className="text-sm" style={{ color: textMuted }}>Aucune donnée</p>
          : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={evolutionData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={gridColor} />
                <XAxis dataKey="index" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const { label, note } = payload[0].payload
                    return (
                      <div style={{ ...ttStyle, padding: "8px 12px" }}>
                        <p style={{ color: textSub, fontSize: 11, marginBottom: 4 }}>{label}</p>
                        <p style={{ color: RED, fontWeight: 700, fontSize: 13 }}>Note : {note}</p>
                      </div>
                    )
                  }}
                />
                <Line dataKey="note" type="linear" stroke={RED} strokeWidth={2}
                  dot={{ fill: RED, r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false}>
                  <LabelList dataKey="note" position="top" fontSize={11} fill={axisColor} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Magasins audités */}
        <div style={{ ...card(), padding: "14px 16px" }}>
          <p className={`text-sm font-medium mb-4 ${titleCls}`}>Mes Magasins Audités</p>
          {loading ? <p className="text-sm text-gray-400">Chargement...</p>
          : magasinsData.length === 0 ? <p className="text-sm" style={{ color: textMuted }}>Aucun magasin</p>
          : (
            <ResponsiveContainer width="100%" height={Math.max(180, magasinsData.length * 36 + 20)}>
              <BarChart data={magasinsData} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis type="category" dataKey="id" tickLine={false} axisLine={false}
                  fontSize={11} width={100} tick={{ fill: axisColor }}
                  tickFormatter={(v) => magasinsData[v]?.nom ?? ""} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const { nomComplet, note } = payload[0].payload
                  return (
                    <div style={{ ...ttStyle, padding: "8px 12px" }}>
                      <p style={{ color: textSub, fontSize: 11, marginBottom: 4 }}>{nomComplet}</p>
                      <p style={{ color: "#00C9A7", fontWeight: 700, fontSize: 13 }}>Note : {note}</p>
                    </div>
                  )
                }} />
                <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                  <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
                  {magasinsData.map((e) => <Cell key={e.id} fill={getBarColor(e.note)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 5. Missions planifiées + Points forts/faibles ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Missions planifiées */}
        <div style={{ ...card(), overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: RED, color: "#fff", fontWeight: 700, fontSize: 14 }}>
            Mes Missions Planifiées
          </div>
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 280 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: RED }}>
                  {["Titre", "Magasin", "Date début", "Statut"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: textMuted }}>Chargement…</td></tr>}
                {!loading && planifiees.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: textMuted }}>Aucune mission</td></tr>}
                {!loading && planifiees.map((m, i) => (
                  <tr key={m.id}
                    style={{ background: i % 2 === 0 ? bg : bgAlt, borderBottom: `1px solid ${borderRow}` }}>
                    <td style={{ padding: "7px 10px", color: textMain, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                      {m.title ?? m.titre ?? `Mission #${m.id}`}
                    </td>
                    <td style={{ padding: "7px 10px", color: textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                      {m.store?.nom ?? "—"}
                    </td>
                    <td style={{ padding: "7px 10px", color: textSub, whiteSpace: "nowrap" }}>
                      {fmtDate(m.dateDebut)}
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      <StatutBadge statut={m.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Points forts et faibles */}
        <div style={{ ...card(), padding: "14px 16px" }}>
          <p className={`text-sm font-medium mb-4 ${titleCls}`}>Mes Points Forts et Faibles</p>
          {loading ? <p className="text-sm text-gray-400">Chargement...</p>
          : pointsData.length === 0 ? <p className="text-sm" style={{ color: textMuted }}>Aucune donnée</p>
          : (
            <ResponsiveContainer width="100%" height={Math.max(200, pointsData.length * 36 + 20)}>
              <BarChart data={pointsData} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis type="category" dataKey="id" tickLine={false} axisLine={false}
                  fontSize={11} width={130} tick={{ fill: axisColor }}
                  tickFormatter={(v) => pointsData[v]?.nom ?? ""} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const { nomComplet, note } = payload[0].payload
                  return (
                    <div style={{ ...ttStyle, padding: "8px 12px" }}>
                      <p style={{ color: textSub, fontSize: 11, marginBottom: 4 }}>{nomComplet}</p>
                      <p style={{ color: getBarColor(note), fontWeight: 700, fontSize: 13 }}>Note : {note}</p>
                    </div>
                  )
                }} />
                <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                  <LabelList dataKey="note" position="right" fontSize={11} fill={axisColor} />
                  {pointsData.map((e) => <Cell key={e.id} fill={getBarColor(e.note)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 6. Statut donut ── */}
      <div style={{ ...card(), padding: "14px 16px" }}>
        <p className={`text-sm font-medium mb-4 ${titleCls}`}>Statut de mes Missions</p>
        {loading ? <p className="text-sm text-gray-400">Chargement...</p>
        : statutData.length === 0 ? <p className="text-sm" style={{ color: textMuted }}>Aucune donnée</p>
        : (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const { statut, count } = payload[0].payload
                    return (
                      <div style={{ ...ttStyle, padding: "8px 12px" }}>
                        <p style={{ color: STATUT_COLORS[statut] ?? textSub, fontWeight: 700, fontSize: 13 }}>{statut}</p>
                        <p style={{ color: textSub, fontSize: 12 }}>Missions : {count}</p>
                      </div>
                    )
                  }}
                />
                <Pie
                  data={statutData}
                  dataKey="count"
                  nameKey="statut"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {statutData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Légende */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statutData.map((e) => (
                <div key={e.statut} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: e.fill, flexShrink: 0 }} />
                  <span style={{ color: textSub, fontSize: 13 }}>{e.statut}</span>
                  <span style={{ color: e.fill, fontWeight: 700, fontSize: 13, marginLeft: 4 }}>{e.count}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, borderTop: `1px solid ${borderRow}`, paddingTop: 8 }}>
                <span style={{ color: textMuted, fontSize: 12 }}>Total : </span>
                <span style={{ color: textMain, fontWeight: 700, fontSize: 13 }}>{missions.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
"use client"

import { useEffect, useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid, Line, LineChart,
  Pie, PieChart,
} from "recharts"
import { missionService } from "@/services/missionService"
import { storeService } from "@/services/storeService"
import { useDarkMode } from "@/hooks/useDarkMode"
import { LayoutDashboard } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = "#e8192c"

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

const PERIODES = [
  { label: "Tout",          value: "" },
  { label: "Janvier 2025",  value: "2025-01" },
  { label: "Février 2025",  value: "2025-02" },
  { label: "Mars 2025",     value: "2025-03" },
  { label: "Avril 2025",    value: "2025-04" },
  { label: "Mai 2025",      value: "2025-05" },
]

const STATUT_COLORS = {
  TERMINEE:  "#14b8a6",
  PLANIFIEE: "#3b82f6",
  EN_COURS:  "#f59e0b",
  ANNULEE:   "#ef4444",
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatNote = (n) =>
  n !== null && n !== undefined ? n.toFixed(2).replace(".", ",") : "--"

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PerformanceGlobaleDashboard() {
  const [allMissions, setAllMissions] = useState([])
  const [regions, setRegions]         = useState([])
  const [stores, setStores]           = useState([])
  const [filters, setFilters]         = useState({ periode: "", region: "", storeId: "" })
  const [loading, setLoading]         = useState(true)
  const isDark = useDarkMode()

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const bg         = isDark ? "bg-zinc-900"  : "bg-white"
  const titleCls   = isDark ? "text-gray-200" : "text-gray-700"
  const labelCls   = isDark ? "text-gray-300" : "text-gray-600"
  const valueCls   = isDark ? "text-gray-100" : "text-gray-800"
  const axisColor  = isDark ? "#9ca3af"       : "#6b7280"
  const gridColor  = isDark ? "#3f3f46"       : "#f0f0f0"
  const tooltipBg  = isDark ? "#18181b"       : "#ffffff"
  const tooltipBdr = isDark ? "#3f3f46"       : "#e5e7eb"
  const inputCls   = "w-full text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900 border-none outline-none cursor-pointer"
  const ttStyle    = { background: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: 8 }

  // Bordures neutres : gris en light, blanc en dark
  const cardBorder  = isDark ? "#ffffff"  : "#d1d5db"   // blanc / gris-300
  const cardBorder2 = isDark ? "#e5e7eb"  : "#1f2937"   // léger / noir — pour la card teal (variation)

  // ── Initial fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      missionService.getAll(),
      storeService.getRegions(),
      storeService.getActive(),
    ]).then(([mRes, rRes, sRes]) => {
      setAllMissions(mRes.data ?? [])
      setRegions(rRes.data ?? [])
      setStores(sRes.data ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ── Reload stores on region change ────────────────────────────────────────────
  useEffect(() => {
    if (loading) return
    if (filters.region) {
      storeService.getByRegion(filters.region).then((res) => setStores(res.data ?? []))
    } else {
      storeService.getActive().then((res) => setStores(res.data ?? []))
    }
  }, [filters.region])

  const handleFilter = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "region") next.storeId = ""
      return next
    })
  }

  // ── Filtered missions ─────────────────────────────────────────────────────────
  const missions = useMemo(() => allMissions.filter((m) => {
    if (filters.storeId && String(m.store?.id) !== String(filters.storeId)) return false
    if (filters.region  && m.store?.region !== filters.region)               return false
    if (filters.periode) {
      const d = new Date(m.dateDebut)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (key !== filters.periode) return false
    }
    return true
  }), [allMissions, filters])

  // ── KPI ──────────────────────────────────────────────────────────────────────
  const { noteActuelle, variation } = useMemo(() => {
    const avecNote = missions.filter((m) => m.auditSession?.noteGlobale != null)
    if (!avecNote.length) return { noteActuelle: null, variation: null }

    const triees        = [...avecNote].sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))
    const dernierDate   = new Date(triees[0].dateDebut)
    const dernierMois   = dernierDate.getMonth()
    const derniereAnnee = dernierDate.getFullYear()
    const moisPrec      = dernierMois === 0 ? 11 : dernierMois - 1
    const anneePrec     = dernierMois === 0 ? derniereAnnee - 1 : derniereAnnee

    const moy = (liste) =>
      liste.length > 0
        ? liste.reduce((acc, m) => acc + m.auditSession.noteGlobale, 0) / liste.length
        : null

    const noteAct  = moy(avecNote.filter((m) => { const d = new Date(m.dateDebut); return d.getMonth() === dernierMois  && d.getFullYear() === derniereAnnee }))
    const notePrec = moy(avecNote.filter((m) => { const d = new Date(m.dateDebut); return d.getMonth() === moisPrec     && d.getFullYear() === anneePrec     }))

    return {
      noteActuelle: noteAct,
      variation: noteAct !== null && notePrec !== null
        ? (noteAct - notePrec).toFixed(2)
        : null,
    }
  }, [missions])

  // ── Évolution mensuelle ───────────────────────────────────────────────────────
  const evolutionData = useMemo(() => {
    const parMois = {}
    missions.forEach((m) => {
      if (m.auditSession?.noteGlobale == null) return
      const d = new Date(m.dateDebut)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!parMois[key]) parMois[key] = { notes: [], mois: d.getMonth(), annee: d.getFullYear() }
      parMois[key].notes.push(m.auditSession.noteGlobale)
    })
    return Object.values(parMois)
      .sort((a, b) => a.annee - b.annee || a.mois - b.mois)
      .map((e) => ({
        mois: MOIS[e.mois],
        note: parseFloat((e.notes.reduce((a, b) => a + b, 0) / e.notes.length).toFixed(2)),
      }))
  }, [missions])

  // ── Statuts missions ──────────────────────────────────────────────────────────
  const statutsData = useMemo(() => {
    const map = {}
    missions.forEach((m) => { map[m.statut] = (map[m.statut] ?? 0) + 1 })
    const total = Object.values(map).reduce((a, b) => a + b, 0)
    return Object.entries(map).map(([statut, count]) => ({
      statut, count,
      fill: STATUT_COLORS[statut] ?? "#8884d8",
      pourcentage: total > 0 ? ((count / total) * 100).toFixed(2) + "%" : "0%",
    }))
  }, [missions])

  // ── Performance par région ────────────────────────────────────────────────────
  const regionData = useMemo(() => {
    const map = {}
    missions.forEach((m) => {
      if (m.auditSession?.noteGlobale == null) return
      const region = m.store?.region
      if (!region) return
      if (!map[region]) map[region] = []
      map[region].push(m.auditSession.noteGlobale)
    })
    return Object.entries(map)
      .map(([region, notes]) => ({
        region,
        note: parseFloat((notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)),
      }))
      .sort((a, b) => b.note - a.note)
  }, [missions])

  // ── Shared card style ─────────────────────────────────────────────────────────
  const card = (extraStyle = {}) => ({
    border: `1.5px solid ${cardBorder}`,
    borderRadius: 8,
    ...extraStyle,
  })

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {/* ── 1. Header ── */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-md ${bg}`}
        style={card()}
      >
        <LayoutDashboard className="w-5 h-5 text-red-500 shrink-0" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0">
          Vue Nationale : Performance Globale
        </h2>
      </div>

      {/* ── 2. Filtres ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Période : Jan-Mai 2025",
            content: (
              <select value={filters.periode} onChange={(e) => handleFilter("periode", e.target.value)} className={inputCls}>
                {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            ),
          },
          {
            label: "Région",
            content: (
              <select value={filters.region} onChange={(e) => handleFilter("region", e.target.value)} className={inputCls}>
                <option value="">Tout</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ),
          },
          {
            label: "Magasin",
            content: (
              <select value={filters.storeId} onChange={(e) => handleFilter("storeId", e.target.value)} className={inputCls}>
                <option value="">Tout</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            ),
          },
        ].map(({ label, content }) => (
          <div key={label} className={`rounded-md px-3.5 py-2.5 ${bg}`} style={card()}>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
            {content}
          </div>
        ))}
      </div>

      {/* ── 3. KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-md p-4 ${bg}`} style={card()}>
          <p className={`text-sm mb-2 ${labelCls}`}>Note Qualité Nationale</p>
          {loading
            ? <p className="text-gray-400 text-sm">Chargement...</p>
            : <p className="text-4xl font-bold text-red-500">{formatNote(noteActuelle)}</p>
          }
        </div>

        <div className={`rounded-md p-4 ${bg}`} style={card()}>
          <p className={`text-sm mb-2 ${labelCls}`}>Variation vs Mois Précédent</p>
          {loading
            ? <p className="text-gray-400 text-sm">Chargement...</p>
            : <p className={`text-4xl font-bold ${
                variation === null         ? "text-gray-400"  :
                parseFloat(variation) >= 0 ? "text-teal-500"  : "text-red-500"
              }`}>
                {variation === null
                  ? "--"
                  : `${parseFloat(variation) >= 0 ? "+" : ""}${variation.replace(".", ",")}`}
              </p>
          }
        </div>
      </div>

      {/* ── 4. Évolution + Statuts ── */}
      <div className="grid grid-cols-2 gap-3">

        <div className={`rounded-md p-4 ${bg}`} style={card()}>
          <p className={`text-sm font-medium mb-4 ${titleCls}`}>Évolution Mensuelle de la Note Qualité</p>
          {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={evolutionData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={gridColor} />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tick={{ fill: axisColor }} />
                <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tick={{ fill: axisColor }} />
                <Tooltip
                  formatter={(v) => [v, "Note"]}
                  contentStyle={ttStyle}
                  labelStyle={{ color: axisColor }}
                />
                <Line dataKey="note" type="linear" stroke={RED} strokeWidth={2} dot={{ fill: RED, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={`rounded-md p-4 ${bg}`} style={card()}>
          <p className={`text-sm font-medium mb-2 ${titleCls}`}>Statuts des Missions</p>
          {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={ttStyle} />
                  <Pie data={statutsData} dataKey="count" nameKey="statut" innerRadius={55} outerRadius={85}>
                    {statutsData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {statutsData.map((e) => (
                  <div key={e.statut} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: e.fill }} />
                    <span className={labelCls}>{e.statut}</span>
                    <span className={`font-medium ${valueCls}`}>{e.pourcentage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Performance par Région ── */}
      <div className={`rounded-md p-4 ${bg}`} style={card()}>
        <p className={`text-sm font-medium mb-4 ${titleCls}`}>Performance par Région</p>
        {loading ? <p className="text-sm text-gray-400">Chargement...</p> : (
          <ResponsiveContainer width="100%" height={regionData.length * 45 + 20}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 120, right: 40, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: axisColor }} />
              <YAxis type="category" dataKey="region" tickLine={false} axisLine={false} fontSize={12} width={120} tick={{ fill: axisColor }} />
              <Tooltip
                formatter={(v) => [v, "Note"]}
                contentStyle={ttStyle}
                labelStyle={{ color: axisColor }}
                itemStyle={{ color: "#ef4444" }}
              />
              <Bar dataKey="note" radius={[0, 4, 4, 0]} barSize={18}>
                {regionData.map((_, i) => <Cell key={i} fill="#ef4444" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}
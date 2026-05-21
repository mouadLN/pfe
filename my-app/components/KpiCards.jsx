"use client"

import { useEffect, useState } from "react"
import { missionService } from "@/services/missionService"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function KpiCards() {
  const [noteActuelle, setNoteActuelle] = useState(null)
  const [notePrecedente, setNotePrecedente] = useState(null)
  const [loading, setLoading] = useState(true)
  const isDark = useDarkMode()

  const bgClass = isDark ? "bg-zinc-900" : "bg-white"
  const titleClass = isDark ? "text-gray-300" : "text-gray-600"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await missionService.getAll()
        const missions = res.data

        const avecNote = missions.filter(
          (m) => m.auditSession?.noteGlobale != null
        )

        if (avecNote.length === 0) { setLoading(false); return }

        const triees = [...avecNote].sort(
          (a, b) => new Date(b.dateDebut) - new Date(a.dateDebut)
        )

        const dernierDate = new Date(triees[0].dateDebut)
        const dernierMois = dernierDate.getMonth()
        const derniereAnnee = dernierDate.getFullYear()
        const moisPrec = dernierMois === 0 ? 11 : dernierMois - 1
        const anneePrec = dernierMois === 0 ? derniereAnnee - 1 : derniereAnnee

        const missionsActuelles = avecNote.filter((m) => {
          const d = new Date(m.dateDebut)
          return d.getMonth() === dernierMois && d.getFullYear() === derniereAnnee
        })

        const missionsPrecedentes = avecNote.filter((m) => {
          const d = new Date(m.dateDebut)
          return d.getMonth() === moisPrec && d.getFullYear() === anneePrec
        })

        const moyenne = (liste) =>
          liste.length > 0
            ? liste.reduce((acc, m) => acc + m.auditSession.noteGlobale, 0) / liste.length
            : null

        setNoteActuelle(moyenne(missionsActuelles))
        setNotePrecedente(moyenne(missionsPrecedentes))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const variation =
    noteActuelle !== null && notePrecedente !== null
      ? (noteActuelle - notePrecedente).toFixed(2)
      : null

  const formatNote = (n) =>
    n !== null ? n.toFixed(2).replace(".", ",") : "--"

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className={`border-2 border-red-500 rounded-md p-4 ${bgClass}`}>
        <p className={`text-sm mb-2 ${titleClass}`}>Note Qualité Nationale</p>
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement...</p>
        ) : (
          <p className="text-4xl font-bold text-red-500">{formatNote(noteActuelle)}</p>
        )}
      </div>

      <div className={`border-2 border-teal-400 rounded-md p-4 ${bgClass}`}>
        <p className={`text-sm mb-2 ${titleClass}`}>Variation vs Mois Précédent</p>
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement...</p>
        ) : (
          <p className={`text-4xl font-bold ${
            variation === null ? "text-gray-400" :
            parseFloat(variation) >= 0 ? "text-teal-500" : "text-red-500"
          }`}>
            {variation === null
              ? "--"
              : `${parseFloat(variation) >= 0 ? "+" : ""}${variation.replace(".", ",")}`}
          </p>
        )}
      </div>
    </div>
  )
}
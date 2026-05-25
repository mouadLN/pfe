"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDarkMode } from "@/hooks/useDarkMode"
import Performanceglobaledashboard from "@/components/dashboardComponents/Performanceglobaledashboard"
import Analysemagasindashboard from "@/components/dashboardComponents/Analysemagasindashboard"
import Analysecriteredashboard from "@/components/dashboardComponents/Analysecriteredashboard"
import Suivimissiondashboard from "@/components/dashboardComponents/Suivimissiondashboard"
import DetailAuditSection from "@/components/dashboardComponents/DetailAuditSection"

const TABS = [
  { id: 0, label: "Vue Nationale : Performance Globale" },
  { id: 1, label: "Analyse par Magasin"                },
  { id: 2, label: "Analyse par Critère d'Audit"        },
  { id: 3, label: "Suivi des Missions & Auditeurs"     },
  { id: 4, label: "Détail Audit"                       },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)
  const tabBarRef = useRef(null)
  const isDark = useDarkMode()

  const navBg        = isDark ? "#18181b" : "#ffffff"
  const navBorder    = isDark ? "#3f3f46" : "#e5e7eb"
  const textActive   = isDark ? "#ffffff" : "#111827"
  const textInactive = isDark ? "#9ca3af" : "#6b7280"
  const tabBorder    = isDark ? "#3f3f46" : "#e5e7eb"

  const goTo = (id) => setActiveTab(id)
  const goPrev = () => setActiveTab((t) => Math.max(0, t - 1))
  const goNext = () => setActiveTab((t) => Math.min(TABS.length - 1, t + 1))

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="flex-1 p-4">
        {activeTab === 0 && <Performanceglobaledashboard />}
        {activeTab === 1 && <Analysemagasindashboard />}
        {activeTab === 2 && <Analysecriteredashboard />}
        {activeTab === 3 && <Suivimissiondashboard />}
        {activeTab === 4 && <DetailAuditSection />}
      </div>

      <nav
        className="sticky bottom-0 z-50 flex items-stretch shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        style={{ height: 44, borderTop: `1px solid ${navBorder}`, background: navBg }}
      >
        {/* Left arrow */}
        <button
          onClick={goPrev}
          disabled={activeTab === 0}
          className="flex items-center justify-center px-3 disabled:opacity-30 transition-colors shrink-0"
          style={{ borderRight: `1px solid ${navBorder}`, color: textInactive }}
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Tabs */}
        <div
          ref={tabBarRef}
          className="flex flex-1 items-stretch overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => goTo(tab.id)}
                className="relative flex items-center justify-center px-5 shrink-0 text-sm whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? textActive : textInactive,
                  fontWeight: isActive ? 700 : 400,
                  borderRight: `1px solid ${tabBorder}`,
                  background: "transparent",
                  minWidth: 0,
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: 3, background: "#14b8a6", borderRadius: "2px 2px 0 0" }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          disabled={activeTab === TABS.length - 1}
          className="flex items-center justify-center px-3 disabled:opacity-30 transition-colors shrink-0"
          style={{ borderLeft: `1px solid ${navBorder}`, color: textInactive }}
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  )
}
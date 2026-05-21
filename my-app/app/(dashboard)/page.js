import SectionHeader from "@/components/SectionHeader";
import DashboardFilters from "@/components/DashboardFilters";
import KpiCards from "@/components/KpiCards";
import EvolutionNoteChart from "@/components/EvolutionNoteChart";
import StatutsMissionsChart from "@/components/StatutsMissionsChart";
import PerformanceParRegionChart from "@/components/PerformanceParRegionChart";
import AnalyseMagasinHeader from "@/components/AnalyseMagasinHeader";
import EvolutionParMagasinChart from "@/components/EvolutionParMagasinChart";
import ClassementMagasinsChart from "@/components/ClassementMagasinsChart";
import NombreAuditsParMagasinChart from "@/components/NombreAuditsParMagasinChart";
import TableauComparatifMagasins from "@/components/TableauComparatifMagasins.jsx";
import AnalyseCritereAudit from "@/components/AnalyseCritereAudit";
import HeatmapCriteresMagasins from "@/components/HeatmapCriteresMagasins";
import ClassementCriteresAuditChart from "@/components/ClassementCriteresAuditChart";
import SuiviMissionsAuditeurs from "@/components/SuiviMissionsAuditeurs";
import ChargeEtNoteParAuditeur from "@/components/ChargeEtNoteParAuditeur";
import DetailMissions from "@/components/DetailMissions";
import StatutMissionsParMagasinChart from "@/components/StatutMissionsParMagasinChart";
import { Map } from "lucide-react";
import DetailAuditKpi from "@/components/DetailAuditKpi";

export default function Home() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionHeader title="Vue Nationale : Performance Globale" icon={Map} />
      <DashboardFilters />
      <KpiCards />
      <div className="grid grid-cols-2 gap-3">
        <EvolutionNoteChart />
        <StatutsMissionsChart />
      </div>
      <PerformanceParRegionChart />
      <AnalyseMagasinHeader />
      <div className="grid grid-cols-2 gap-3">
        <EvolutionParMagasinChart />
        <ClassementMagasinsChart />
      </div>
      <NombreAuditsParMagasinChart />
      <TableauComparatifMagasins />
      <AnalyseCritereAudit />
      <HeatmapCriteresMagasins />
      <ClassementCriteresAuditChart />
      <SuiviMissionsAuditeurs />
      <ChargeEtNoteParAuditeur />
      <DetailMissions />
      <StatutMissionsParMagasinChart />
      <DetailAuditKpi />
    </div>
  );
}
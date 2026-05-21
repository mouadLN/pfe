import SectionHeader from "@/components/dashboardComponents/SectionHeader";
import DashboardFilters from "@/components/dashboardComponents/DashboardFilters";
import KpiCards from "@/components/dashboardComponents/KpiCards";
import EvolutionNoteChart from "@/components/dashboardComponents/EvolutionNoteChart";
import StatutsMissionsChart from "@/components/dashboardComponents/StatutsMissionsChart";
import PerformanceParRegionChart from "@/components/dashboardComponents/PerformanceParRegionChart";
import AnalyseMagasinHeader from "@/components/dashboardComponents/AnalyseMagasinHeader";
import EvolutionParMagasinChart from "@/components/dashboardComponents/EvolutionParMagasinChart";
import ClassementMagasinsChart from "@/components/dashboardComponents/ClassementMagasinsChart";
import NombreAuditsParMagasinChart from "@/components/dashboardComponents/NombreAuditsParMagasinChart";
import TableauComparatifMagasins from "@/components/dashboardComponents/TableauComparatifMagasins.jsx";
import AnalyseCritereAudit from "@/components/dashboardComponents/AnalyseCritereAudit";
import HeatmapCriteresMagasins from "@/components/dashboardComponents/HeatmapCriteresMagasins";
import ClassementCriteresAuditChart from "@/components/dashboardComponents/ClassementCriteresAuditChart";
import SuiviMissionsAuditeurs from "@/components/dashboardComponents/SuiviMissionsAuditeurs";
import ChargeEtNoteParAuditeur from "@/components/dashboardComponents/ChargeEtNoteParAuditeur";
import DetailMissions from "@/components/dashboardComponents/DetailMissions";
import StatutMissionsParMagasinChart from "@/components/dashboardComponents/StatutMissionsParMagasinChart";
import { Map } from "lucide-react";
import DetailAuditKpi from "@/components/dashboardComponents/DetailAuditKpi";

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
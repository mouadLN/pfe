"use client";

import { useState, useEffect } from "react";
import { missionService } from "@/services/missionService";
import { auditSessionService } from "@/services/auditSessionService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, Store, Play, RefreshCw, Eye ,ListTodo,ClipboardCheck ,ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ViewMissionDialog } from "@/components/missionForms/view-mission";

const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
};

const getStatusBadge = (status) => {
    switch (status) {
        case "PLANIFIEE": return <Badge variant="en_attente">À faire</Badge>;
        case "EN_COURS": return <Badge variant="en_cours">En cours</Badge>;
        case "TERMINEE": return <Badge variant="terminee">Terminée</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function AuditeurMissionsPage() {
    const [activeFilter, setActiveFilter] = useState("planifiee"); // state instead of URL param
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [missionToView, setMissionToView] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(stored);
    }, []);

    useEffect(() => {
        if (currentUser?.userId) {
            fetchMissions();
        }
    }, [currentUser]);

    const fetchMissions = async () => {
        setLoading(true);
        setError("");
        try {
            const params = {
                page: 0,
                size: 100,
                auditeurId: currentUser.userId,
                sortBy: "dateDebut",
                sortDir: "asc"
            };
            
            const response = await missionService.getFiltered(params);
            setMissions(response.data.content || []);
        } catch (err) {
            setError("Erreur lors du chargement des missions");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

const handleStartMission = async (missionId) => {
    setActionLoading(missionId);
    try {
        await auditSessionService.startFromMission(missionId, currentUser.userId);
        window.location.href = `/audit/session/${missionId}`; // already correct
    } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du démarrage");
    } finally {
        setActionLoading(null);
    }
};

    const handleResumeMission = (missionId) => {
        window.location.href = `/audit/session/${missionId}`;
    };

    const handleViewMission = (mission) => {
        setMissionToView(mission);
    };

    // Get filtered missions based on activeFilter state
    const getFilteredMissions = () => {
        if (activeFilter === "planifiee") return missions.filter(m => m.statut === "PLANIFIEE");
        if (activeFilter === "en_cours") return missions.filter(m => m.statut === "EN_COURS");
        return missions.filter(m => m.statut === "TERMINEE");
    };

    const getFilterCount = (filter) => {
        if (filter === "planifiee") return missions.filter(m => m.statut === "PLANIFIEE").length;
        if (filter === "en_cours") return missions.filter(m => m.statut === "EN_COURS").length;
        return missions.filter(m => m.statut === "TERMINEE").length;
    };

    const filteredMissions = getFilteredMissions();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Mes missions</h1>
                <p className="text-muted-foreground mt-1">
                    Gérez vos missions d'audit, démarrez de nouvelles audits ou reprenez où vous vous êtes arrêté.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side - Filters (no page reload) */}
                <div className="lg:w-64 shrink-0">
                    <div className="sticky top-24">
                        <h2 className="text-sm font-medium text-muted-foreground mb-3">Filtres</h2>
                        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                            <Button
                                variant={activeFilter === "planifiee" ? "default" : "ghost"}
                                className="justify-start shrink-0"
                                onClick={() => setActiveFilter("planifiee")}  // ✅ Just update state, no page reload
                            >
                                <span className="flex items-center gap-2">
                                   <ShieldAlert  /> À faire
                                    <Badge variant="secondary" className="ml-auto">
                                        {getFilterCount("planifiee")}
                                    </Badge>
                                </span>
                            </Button>
                            <Button
                                variant={activeFilter === "en_cours" ? "default" : "ghost"}
                                className="justify-start shrink-0"
                                onClick={() => setActiveFilter("en_cours")}   // ✅ Just update state, no page reload
                            >
                                <span className="flex items-center gap-2">
                                    <ListTodo />En cours
                                    <Badge variant="secondary" className="ml-auto">
                                        {getFilterCount("en_cours")}
                                    </Badge>
                                </span>
                            </Button>
                            <Button
                                variant={activeFilter === "terminee" ? "default" : "ghost"}
                                className="justify-start shrink-0"
                                onClick={() => setActiveFilter("terminee")}   // ✅ Just update state, no page reload
                            >
                                <span className="flex items-center gap-2">
                                    <ClipboardCheck />Terminées
                                    <Badge variant="secondary" className="ml-auto">
                                        {getFilterCount("terminee")}
                                    </Badge>
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Cards */}
                <div className="flex-1">
                    {filteredMissions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <div className="text-4xl mb-3">📭</div>
                            <p>Aucune mission {activeFilter === "planifiee" ? "à faire" : activeFilter === "en_cours" ? "en cours" : "terminée"}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredMissions.map((mission) => (
                                <Card key={mission.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between flex-wrap gap-2">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">{mission.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {mission.description || "Aucune description"}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(mission.statut)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Store className="h-4 w-4" />
                                                <span>{mission.store?.nom || mission.store}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{mission.store?.ville}, {mission.store?.region}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Du {formatDate(mission.dateDebut)} au {formatDate(mission.dateFin)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleViewMission(mission)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir détails
                                        </Button>
                                        
                                        {mission.statut === "PLANIFIEE" && (
                                            <Button 
                                                size="sm"
                                                onClick={() => handleStartMission(mission.id)}
                                                disabled={actionLoading === mission.id}
                                            >
                                                {actionLoading === mission.id ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Play className="h-4 w-4 mr-2" />
                                                )}
                                                Commencer
                                            </Button>
                                        )}
                                        
                                        {mission.statut === "EN_COURS" && (
                                            <Button 
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleResumeMission(mission.id)}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Reprendre
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* View Mission Dialog */}
            <ViewMissionDialog
                mission={missionToView}
                open={!!missionToView}
                onOpenChange={(open) => !open && setMissionToView(null)}
            />
        </div>
    );
}
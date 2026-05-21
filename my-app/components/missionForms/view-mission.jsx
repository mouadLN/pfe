"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, MapPin, User, FileText, Store, CheckSquare, Download, Shield, Globe } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const getStatusLabel = (status) => {
    switch (status) {
        case "PLANIFIEE": return "En attente";
        case "EN_COURS": return "En cours";
        case "TERMINEE": return "Terminée";
        case "ANNULEE": return "Annulée";
        default: return status;
    }
};

const getStatusVariant = (status) => {
    switch (status) {
        case "PLANIFIEE": return "en_attente";
        case "EN_COURS": return "en_cours";
        case "TERMINEE": return "terminee";
        case "ANNULEE": return "inactif";
        default: return "default";
    }
};

const formatDateOnly = (dateString) => {
    if (!dateString) return "Non définie";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
};

const formatDateTime = (dateString) => {
    if (!dateString) return "Non définie";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
};

export function ViewMissionDialog({ mission, open, onOpenChange }) {
    if (!mission) return null;


    const handleDownloadReport = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(
                `http://localhost:8080/api/audit-missions/${mission.id}/rapport`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) throw new Error("Erreur lors du téléchargement")

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `rapport-mission-${mission.id}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Download error:", error)
        }
    }
    const handlePreviewReport = async () => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(
      `http://localhost:8080/api/audit-missions/${mission.id}/rapport`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      throw new Error(errorText || "Erreur lors du chargement")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    window.open(url, "_blank")
  } catch (error) {
    console.error("Preview error:", error.message)
    alert(error.message) // temporary to see the error
  }
}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center justify-between">
                        <span>Détails de la mission</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            {mission.title}
                            <Badge variant={getStatusVariant(mission.statut)}>
                                {getStatusLabel(mission.statut)}
                            </Badge>
                        </h3>
                    </div>



                    {/* Description */}
                    {mission.description && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                            <p className="text-sm">{mission.description}</p>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                        <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Date de début
                            </p>
                            <p className="text-sm font-medium">{formatDateOnly(mission.dateDebut)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Date de fin
                            </p>
                            <p className="text-sm font-medium">{formatDateOnly(mission.dateFin)}</p>
                        </div>
                    </div>

                    {/* Store */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Store className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Magasin</p>
                            <p className="text-sm font-medium">
                                {mission.store?.code && <span>{mission.store.code} - </span>}
                                {mission.store?.nom || mission.store || "-"}
                            </p>
                            {mission.store?.adresse && (
                                <p className="text-xs text-muted-foreground mt-1">{mission.store.adresse}</p>
                            )}
                        </div>
                    </div>

                    {/* City */}
                    {mission.store?.ville && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Ville</p>
                                <p className="text-sm font-medium">{mission.store.ville}</p>
                            </div>
                        </div>
                    )}

                    {/* Region */}
                    {mission.store?.region && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Région</p>
                                <p className="text-sm font-medium">{mission.store.region}</p>
                            </div>
                        </div>
                    )}

                    {/* Auditor */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Auditeur responsable</p>
                            <p className="text-sm font-medium">
                                {mission.auditeur?.prenom} {mission.auditeur?.nom}
                            </p>
                            <p className="text-xs text-muted-foreground">{mission.auditeur?.email}</p>
                        </div>
                    </div>

                    {/* Created By (Administrateur) */}
                    {mission.administrateur && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Créée par</p>
                                <p className="text-sm font-medium">
                                    {mission.administrateur.prenom} {mission.administrateur.nom}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {mission.administrateur.email} • Administrateur
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Date Creation - Just day, no time */}
                    {mission.dateCreation && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Date de création</p>
                                <p className="text-sm font-medium">
                                    {formatDateTime(mission.dateCreation)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Audit Elements */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            Éléments d'audit ({mission.auditElements?.length || 0})
                        </p>
                        {mission.auditElements && mission.auditElements.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pl-6">
                                {mission.auditElements.map((element) => (
                                    <Badge key={element.id} variant="secondary">
                                        {element.nom}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground pl-6">Aucun élément d'audit</p>
                        )}
                    </div>

                    {/* Download Report Button - Always visible but disabled for non-terminated missions */}
                    <div className="pt-4 border-t flex gap-2">
                        <Button
                            onClick={handlePreviewReport}
                            className="flex-1 gap-2"
                            variant="outline"
                            disabled={mission.statut !== "TERMINEE"}
                        >
                            <Eye className="h-4 w-4" />
                            Aperçu
                        </Button>
                        <Button
                            onClick={handleDownloadReport}
                            className="flex-1 gap-2"
                            disabled={mission.statut !== "TERMINEE"}
                        >
                            <Download className="h-4 w-4" />
                            Télécharger
                        </Button>
                    </div>
                    {mission.statut !== "TERMINEE" && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Disponible uniquement pour les missions terminées
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
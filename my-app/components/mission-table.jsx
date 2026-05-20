"use client";
import { useState, useEffect, useCallback } from "react";
import { missionService } from "@/services/missionService";
import { TablePagination } from "@/components/tables-pagination";
import { MoreHorizontalIcon, Loader2 } from "lucide-react";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditMissionDialog } from "@/components/missionForms/edit-mission";
import { ViewMissionDialog } from "@/components/missionForms/view-mission";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DEFAULT_ITEMS_PER_PAGE = 10

const getStatusVariant = (status) => {
    switch (status) {
        case "PLANIFIEE": return "en_attente";
        case "EN_COURS": return "en_cours";
        case "TERMINEE": return "terminee";
        case "ANNULEE": return "inactif";
        default: return "default";
    }
}

const getStatusLabel = (status) => {
    switch (status) {
        case "PLANIFIEE": return "En attente";
        case "EN_COURS": return "En cours";
        case "TERMINEE": return "Terminée";
        case "ANNULEE": return "Annulée";
        default: return status;
    }
}

const mapStatusToBackend = (frontendStatus) => {
    switch (frontendStatus) {
        case "En attente": return "PLANIFIEE";
        case "En cours": return "EN_COURS";
        case "Terminée": return "TERMINEE";
        case "Annulée": return "ANNULEE";
        default: return null;
    }
}

export function MissionsTable({ search = "", statut = "all", sort = "id", order = "asc", refreshKey = 0 }) {
    const [missions, setMissions] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [missionToDelete, setMissionToDelete] = useState(null)
    const [missionToEdit, setMissionToEdit] = useState(null)
    const [missionToView, setMissionToView] = useState(null);

    // ✅ 1. fetchMissions defined FIRST
    const fetchMissions = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const params = {
                page: currentPage - 1,
                size: itemsPerPage,
                sortBy: sort,
                sortDir: order,
            }
            if (search) params.keyword = search
            if (statut !== "all") {
                const backendStatus = mapStatusToBackend(statut)
                if (backendStatus) params.status = backendStatus
            }

            const response = await missionService.getFiltered(params)

            // ✅ Parse if string, use directly if already object
            const data = typeof response.data === "string"
                ? JSON.parse(response.data)
                : response.data

            setMissions(data.content || [])
            setTotalItems(data.totalElements || 0)
            setTotalPages(data.totalPages || 1)

        } catch (err) {
            console.error("❌ Error:", err)
            if (err.response?.status === 403) {
                setError("Vous n'avez pas les droits pour voir ces missions.")
            } else {
                setError("Erreur lors du chargement des missions.")
            }
            setMissions([])
        } finally {
            setLoading(false)
        }
    }, [currentPage, itemsPerPage, search, statut, sort, order])

    // ✅ 2. Single useEffect AFTER fetchMissions
    useEffect(() => {
        fetchMissions()
    }, [fetchMissions, refreshKey])

    const handleDelete = async (mission) => {
        try {
            await missionService.delete(mission.id)
            setMissionToDelete(null)
            fetchMissions()
        } catch (err) {
            setError("Erreur lors de la suppression.")
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-"
        return format(new Date(dateString), "dd/MM/yyyy", { locale: fr })
    }

    return (
        <>
            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                    {error}
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Badge>ID</Badge></TableHead>
                        <TableHead><Badge>Titre</Badge></TableHead>
                        <TableHead><Badge>Magasin</Badge></TableHead>
                        <TableHead><Badge>Auditeur</Badge></TableHead>
                        <TableHead><Badge>Date Début</Badge></TableHead>
                        <TableHead><Badge>Date Fin</Badge></TableHead>
                        <TableHead><Badge>Statut</Badge></TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                <Loader2 className="animate-spin mx-auto h-6 w-6 text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : missions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                Aucune mission trouvée.
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {missions.map((mission) => (
                                <TableRow key={mission.id}>
                                    <TableCell>{mission.id}</TableCell>
                                    <TableCell className="font-medium">{mission.title}</TableCell>
                                    <TableCell>{mission.store?.nom || mission.store}</TableCell>
                                    <TableCell>{mission.auditeur?.prenom + " " + mission.auditeur?.nom || mission.auditeur || "-"}</TableCell>
                                    <TableCell>{formatDate(mission.dateDebut)}</TableCell>
                                    <TableCell>{formatDate(mission.dateFin)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(mission.statut)}>
                                            <BadgeDot />
                                            {getStatusLabel(mission.statut)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* View Details - Always enabled */}
                                                <DropdownMenuItem onSelect={() => setMissionToView(mission)}>
                                                    Voir détails
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />

                                                {/* Edit - Only for PLANIFIEE */}
                                                <DropdownMenuItem
                                                    onSelect={() => setMissionToEdit(mission)}
                                                    disabled={mission.statut !== "PLANIFIEE"}
                                                >
                                                    Modifier
                                                </DropdownMenuItem>

                                                {/* Delete - Only for PLANIFIEE */}
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() => setMissionToDelete(mission)}
                                                    disabled={mission.statut !== "PLANIFIEE"}
                                                >
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.from({ length: itemsPerPage - missions.length }).map((_, i) => (
                                <TableRow key={`empty-${i}`} className="pointer-events-none h-[49px]">
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <TableCell key={j}>&nbsp;</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </>
                    )}
                </TableBody>
            </Table>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={totalItems}
            />

            <AlertDialog open={!!missionToDelete} onOpenChange={(open) => !open && setMissionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la mission "{missionToDelete?.title}" ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cette mission sera définitivement supprimée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(missionToDelete)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditMissionDialog
                mission={missionToEdit}
                open={!!missionToEdit}
                onOpenChange={(open) => !open && setMissionToEdit(null)}
                onSuccess={() => {
                    setMissionToEdit(null)
                    fetchMissions()
                }}
            />

            {/* View Dialog */}
            <ViewMissionDialog
                mission={missionToView}
                open={!!missionToView}
                onOpenChange={(open) => !open && setMissionToView(null)}
            />
        </>
    )
}
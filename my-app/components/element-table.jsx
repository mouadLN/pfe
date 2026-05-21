"use client";
import { useState, useEffect } from "react";
import { elementAuditService } from "@/services/elementAuditService";
import { TablePagination } from "@/components/tables-pagination";
import { MoreHorizontalIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditElementDialog } from "@/components/elementForms/edit-element";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const DEFAULT_ITEMS_PER_PAGE = 10

export function ElementsAuditTable({ search = "", statut = "all", sort = "id", order = "asc", refreshKey = 0, userRole = null }) {
    const [elements, setElements] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [elementToDelete, setElementToDelete] = useState(null)
    const [elementToEdit, setElementToEdit] = useState(null)

    const isAdmin = userRole === "ADMIN"

    useEffect(() => {
        setCurrentPage(1)
    }, [search, statut, sort, order])

    useEffect(() => {
        fetchElements()
    }, [search, statut, sort, order, currentPage, itemsPerPage, refreshKey])

    const fetchElements = async () => {
        setLoading(true)
        setError("")
        try {
            const params = {
                page: currentPage - 1,
                size: itemsPerPage,
                sortBy: sort,
                sortDir: order === "asc" ? "asc" : "desc",
            }
            
            if (search) params.keyword = search
            if (statut !== "all") params.actif = statut === "Actif"
            
            // For auditeur, always only get active elements
            if (!isAdmin && statut === "all") {
                params.actif = true
            }

            const response = await elementAuditService.getFiltered(params)
            const data = response.data

            setElements(data.content)
            setTotalItems(data.totalElements)
            setTotalPages(data.totalPages)
        } catch (err) {
            setError("Erreur lors du chargement des éléments d'audit.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (element) => {
        try {
            await elementAuditService.delete(element.id)
            setElementToDelete(null)
            fetchElements()
        } catch (err) {
            setError("Erreur lors de la suppression.")
        }
    }

    const handleToggleActif = async (element) => {
        try {
            await elementAuditService.update(element.id, {
                nom: element.nom,
                description: element.description,
                actif: !element.actif
            })
            fetchElements()
        } catch (err) {
            setError("Erreur lors du changement de statut.")
        }
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
                        <TableHead><Badge>Nom</Badge></TableHead>
                        <TableHead><Badge>Description</Badge></TableHead>
                        <TableHead><Badge>Statut</Badge></TableHead>
                        {/* Action column only for admin */}
                        {isAdmin && <TableHead className="text-right">Action</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8">
                                <Loader2 className="animate-spin mx-auto h-6 w-6 text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : elements.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                                Aucun élément d'audit trouvé.
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {elements.map((element) => (
                                <TableRow key={element.id}>
                                    <TableCell>{element.id}</TableCell>
                                    <TableCell>{element.nom}</TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {element.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={element.actif ? "actif" : "inactif"}>
                                            {element.actif ? "Actif" : "Inactif"}
                                        </Badge>
                                    </TableCell>
                                    {/* Action column only for admin */}
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8">
                                                        <MoreHorizontalIcon />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => setElementToEdit(element)}>
                                                        Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleToggleActif(element)}>
                                                        {element.actif ? "Désactiver" : "Activer"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onSelect={() => setElementToDelete(element)}
                                                    >
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {Array.from({ length: itemsPerPage - elements.length }).map((_, i) => (
                                <TableRow key={`empty-${i}`} className="pointer-events-none h-[49px]">
                                    {Array.from({ length: isAdmin ? 5 : 4 }).map((_, j) => (
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

            {/* Delete Dialog - only for admin */}
            {isAdmin && (
                <AlertDialog open={!!elementToDelete} onOpenChange={(open) => !open && setElementToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Supprimer {elementToDelete?.nom} ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action est irréversible. Cet élément sera définitivement supprimé.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(elementToDelete)}>
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Edit Dialog - only for admin */}
            {isAdmin && (
                <EditElementDialog
                    element={elementToEdit}
                    open={!!elementToEdit}
                    onOpenChange={(open) => !open && setElementToEdit(null)}
                    onSuccess={() => {
                        setElementToEdit(null)
                        fetchElements()
                    }}
                />
            )}
        </>
    )
}
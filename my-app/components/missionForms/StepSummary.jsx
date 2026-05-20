"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { format } from "date-fns";

const formatDate = (date) => {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy");
};

export function StepSummary({ data, onEdit }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Récapitulatif de la mission</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vérifiez que toutes les informations sont correctes avant de confirmer.
        </p>
      </div>

      {/* Mission Info */}
      <div className="rounded-xl bg-muted p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Informations générales</p>
          <button onClick={() => onEdit(1)} className="text-xs text-foreground underline hover:opacity-60">
            Modifier
          </button>
        </div>
        <Separator />
        <div className="space-y-2">
          <div><p className="text-xs text-muted-foreground">Titre</p><p className="text-sm font-medium">{data.title || "—"}</p></div>
          {data.description && <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{data.description}</p></div>}
          <div className="grid grid-cols-2 gap-2">
            <div><p className="text-xs text-muted-foreground">Date début</p><p className="text-sm font-medium">{formatDate(data.dateDebut)}</p></div>
            <div><p className="text-xs text-muted-foreground">Date fin</p><p className="text-sm font-medium">{formatDate(data.dateFin)}</p></div>
          </div>
          {/* Store Info */}
          <div>
            <p className="text-xs text-muted-foreground">Magasin</p>
            <p className="text-sm font-medium">
              {data.store ? `${data.store.code} - ${data.store.nom}` : "—"}
            </p>
            {data.store?.adresse && (
              <p className="text-xs text-muted-foreground mt-1">{data.store.adresse}</p>
            )}
          </div>
        </div>
      </div>

      {/* Auditeur */}
      <div className="rounded-xl bg-muted p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Auditeur</p>
          <button onClick={() => onEdit(2)} className="text-xs text-foreground underline hover:opacity-60">Modifier</button>
        </div>
        <Separator />
        {data.auditeur ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
            <div><p className="text-sm font-medium">{data.auditeur.prenom} {data.auditeur.nom}</p><p className="text-xs text-muted-foreground">{data.auditeur.email}</p></div>
          </div>
        ) : <p className="text-sm text-muted-foreground">Aucun auditeur sélectionné</p>}
      </div>

      {/* Éléments */}
      <div className="rounded-xl bg-muted p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Éléments d'audit</p>
          <button onClick={() => onEdit(3)} className="text-xs text-foreground underline hover:opacity-60">Modifier</button>
        </div>
        <Separator />
        {data.elements.length > 0 ? (
          <div className="flex flex-wrap gap-2">{data.elements.map((el) => <Badge key={el.id} variant="secondary">{el.nom}</Badge>)}</div>
        ) : <p className="text-sm text-muted-foreground">Aucun élément sélectionné</p>}
      </div>
    </div>
  );
}
"use client";

import { cn } from "@/lib/utils";
import { Check, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function StepSelectAuditeur({ data, onChange, auditeurs, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Choisir un auditeur</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez l'auditeur responsable de cette mission.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {auditeurs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun auditeur disponible</p>
        ) : (
          auditeurs.map((auditeur) => (
            <label
              key={auditeur.id}
              className={cn(
                "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                data.auditeur?.id === auditeur.id
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <input
                type="radio"
                name="auditeur"
                checked={data.auditeur?.id === auditeur.id}
                onChange={() => onChange({ auditeur })}
                className="sr-only"
              />
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {auditeur.prenom} {auditeur.nom}
                </p>
                <p className="text-xs text-muted-foreground">{auditeur.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{auditeur.userCode}</p>
              </div>
              {data.auditeur?.id === auditeur.id && (
                <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
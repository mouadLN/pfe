"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function StepSelectElements({ data, onChange, elements, loading }) {
  const [searchTerm, setSearchTerm] = useState("");

  const toggleElement = (element) => {
    const exists = data.elements.find((e) => e.id === element.id);
    if (exists) {
      onChange({ elements: data.elements.filter((e) => e.id !== element.id) });
    } else {
      onChange({ elements: [...data.elements, element] });
    }
  };

  const removeElement = (e, elementId) => {
    e.stopPropagation();
    e.preventDefault();
    onChange({ elements: data.elements.filter((el) => el.id !== elementId) });
  };

  // Filter elements: only active ones and match search term
  const filteredElements = elements.filter((element) => {
    // Only show active elements
    if (!element.actif) return false;
    // Filter by search term
    if (searchTerm) {
      return element.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (element.description && element.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return true;
  });

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Éléments d'audit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez les éléments qui seront audités (multi-sélection possible).
        </p>
      </div>

      {/* Selected tags */}
      {data.elements.length > 0 && (
  <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-muted rounded-lg">
    <span className="text-xs text-muted-foreground mr-1 self-center">
      ({data.elements.length}) :
    </span>
    {data.elements.map((el) => (
      <Badge key={el.id} variant="secondary" className="text-xs px-1.5 py-0 h-5 gap-0.5">
        {el.nom}
        <button
          type="button"
          className="ml-0.5 hover:text-destructive focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onChange({ elements: data.elements.filter((item) => item.id !== el.id) });
          }}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </Badge>
    ))}
    <button
      type="button"
      onClick={() => onChange({ elements: [] })}
      className="ml-auto self-center text-xs text-muted-foreground hover:text-destructive underline"
    >
      Tout effacer
    </button>
  </div>
)}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un élément d'audit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Elements list */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {filteredElements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? "Aucun élément ne correspond à votre recherche" : "Aucun élément d'audit actif disponible"}
          </p>
        ) : (
          filteredElements.map((element) => {
            const checked = data.elements.some((e) => e.id === element.id);
            return (
              <label
                key={element.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                  checked ? "border-foreground bg-muted" : "border-border hover:border-foreground/40",
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleElement(element)} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{element.nom}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {element.description || "Aucune description"}
                  </p>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Actif
                </Badge>
              </label>
            );
          })
        )}
      </div>

      {/* Summary of selection */}
      {data.elements.length > 0 && (
        <div className="text-sm text-muted-foreground border-t pt-3 mt-2">
          <span className="font-medium text-foreground">{data.elements.length}</span> élément(s) sélectionné(s)
        </div>
      )}
    </div>
  );
}
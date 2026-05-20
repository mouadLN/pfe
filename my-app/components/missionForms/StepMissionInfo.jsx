"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Search, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function StepMissionInfo({ data, onChange, regions, stores, loadingRegions, loadingStores, onRegionChange, selectedRegion }) {
  const [storeSearch, setStoreSearch] = useState("");
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  
  const handleDateChange = (field, date) => {
    onChange({ [field]: date ? format(date, "yyyy-MM-dd") : "" });
  };

  // Filter stores based on search
  const filteredStores = stores.filter(store => {
    if (!storeSearch) return true;
    const searchLower = storeSearch.toLowerCase();
    return (
      store.code?.toLowerCase().includes(searchLower) ||
      store.nom?.toLowerCase().includes(searchLower) ||
      store.ville?.toLowerCase().includes(searchLower)
    );
  });

  const handleStoreSelect = (store) => {
    onChange({ store: store });
    setStoreSearch("");
    setIsStoreOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Informations de la mission</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Remplissez les détails de base de la mission d'audit.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="grid gap-1.5">
          <Label htmlFor="title">Titre de la mission <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            placeholder="e.g. Audit trimestriel Q1"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="grid gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Description détaillée de la mission..."
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        {/* Dates - Side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date Debut */}
          <div className="grid gap-1.5">
            <Label>Date de début <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.dateDebut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.dateDebut ? format(new Date(data.dateDebut), "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.dateDebut ? new Date(data.dateDebut) : undefined}
                  onSelect={(date) => handleDateChange("dateDebut", date)}
                  initialFocus
                  locale={fr}
                  captionLayout="dropdown"
                  className="rounded-lg border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Fin */}
          <div className="grid gap-1.5">
            <Label>Date de fin <span className="text-muted-foreground text-xs">(optionnelle)</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.dateFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.dateFin ? format(new Date(data.dateFin), "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.dateFin ? new Date(data.dateFin) : undefined}
                  onSelect={(date) => handleDateChange("dateFin", date)}
                  initialFocus
                  locale={fr}
                  captionLayout="dropdown"
                  className="rounded-lg border"
                  disabled={(date) => {
                    if (data.dateDebut) {
                      return date < new Date(data.dateDebut);
                    }
                    return false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Region Dropdown */}
        <div className="grid gap-1.5">
          <Label htmlFor="region">Région <span className="text-destructive">*</span></Label>
          {loadingRegions ? (
            <div className="flex items-center gap-2 p-2">
              <Spinner /> <span className="text-sm text-muted-foreground">Chargement des régions...</span>
            </div>
          ) : (
            <select
              id="region"
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Sélectionnez une région</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          )}
        </div>

        {/* Store Dropdown with Search */}
        <div className="grid gap-1.5">
          <Label htmlFor="store">Magasin <span className="text-destructive">*</span></Label>
          {loadingStores ? (
            <div className="flex items-center gap-2 p-2">
              <Spinner /> <span className="text-sm text-muted-foreground">Chargement des magasins...</span>
            </div>
          ) : (
            <div className="relative">
              {/* Selected store display */}
              {data.store ? (
                <div 
                  className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                  onClick={() => setIsStoreOpen(!isStoreOpen)}
                >
                  <span>
                    {data.store.code} - {data.store.nom}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isStoreOpen && "rotate-180")} />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setIsStoreOpen(!isStoreOpen)}
                  disabled={!selectedRegion}
                >
                  {selectedRegion ? "Sélectionnez un magasin" : "Sélectionnez d'abord une région"}
                </Button>
              )}

              {/* Dropdown with search */}
              {isStoreOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStoreOpen(false)}
                  />
                  <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher par code, nom ou ville..."
                          value={storeSearch}
                          onChange={(e) => setStoreSearch(e.target.value)}
                          className="pl-8 h-8 text-sm"
                          autoFocus
                        />
                        {storeSearch && (
                          <button
                            onClick={() => setStoreSearch("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stores list */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredStores.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Aucun magasin trouvé
                        </div>
                      ) : (
                        filteredStores.map((store) => (
                          <div
                            key={store.id}
                            className="px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleStoreSelect(store)}
                          >
                            <p className="text-sm font-medium">
                              {store.code} - {store.nom}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {store.ville && <span>{store.ville}</span>}
                              {store.ville && store.region && <span> · </span>}
                              {store.region && <span>{store.region}</span>}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
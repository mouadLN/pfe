"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function StepMissionInfo({ data, onChange, regions, stores, loadingRegions, loadingStores, onRegionChange, selectedRegion }) {
  
  const handleDateChange = (field, date) => {
    onChange({ [field]: date ? format(date, "yyyy-MM-dd") : "" });
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

        {/* Dates - Side by side on desktop, stacked on mobile */}
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

          {/* Date Fin - Not required */}
          <div className="grid gap-1.5">
            <Label>Date de fin <span className="text-muted-foreground text-xs"></span></Label>
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
                    // Disable dates before dateDebut if dateDebut exists
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

        {/* Store Dropdown */}
        <div className="grid gap-1.5">
          <Label htmlFor="store">Magasin <span className="text-destructive">*</span></Label>
          {loadingStores ? (
            <div className="flex items-center gap-2 p-2">
              <Spinner /> <span className="text-sm text-muted-foreground">Chargement des magasins...</span>
            </div>
          ) : (
            <select
              id="store"
              value={data.store?.id || ""}
              onChange={(e) => {
                const selectedStore = stores.find(s => s.id === parseInt(e.target.value));
                onChange({ store: selectedStore });
              }}
              disabled={!selectedRegion}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{selectedRegion ? "Sélectionnez un magasin" : "Sélectionnez d'abord une région"}</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.nom}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
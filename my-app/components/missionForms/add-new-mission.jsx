"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X } from "lucide-react";
import { missionService } from "@/services/missionService";
import { userService } from "@/services/userService";
import { elementAuditService } from "@/services/elementAuditService";
import { storeService } from "@/services/storeService";
import { Spinner } from "@/components/ui/spinner";
import { StepSidebar } from "./StepSidebar";
import { StepMissionInfo } from "./StepMissionInfo";
import { StepSelectAuditeur } from "./StepSelectAuditeur";
import { StepSelectElements } from "./StepSelectElements";
import { StepSummary } from "./StepSummary";

export function AddNewMission({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Data states
  const [auditeurs, setAuditeurs] = useState([]);
  const [elements, setElements] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [loadingAuditeurs, setLoadingAuditeurs] = useState(false);
  const [loadingElements, setLoadingElements] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    store: null,
    auditeur: null,
    elements: [],
  });

  useEffect(() => {
    if (open) {
      loadAuditeurs();
      loadElements();
      loadRegions();
    }
  }, [open]);

  const loadAuditeurs = async () => {
    setLoadingAuditeurs(true);
    try {
      const response = await userService.getFiltered({ role: "AUDITEUR", size: 100 });
      setAuditeurs(response.data.content || []);
    } catch (err) { console.error(err); }
    finally { setLoadingAuditeurs(false); }
  };

  const loadElements = async () => {
    setLoadingElements(true);
    try {
      const response = await elementAuditService.getFiltered({ actif: true, size: 100 });
      setElements(response.data.content || []);
    } catch (err) { console.error(err); }
    finally { setLoadingElements(false); }
  };

  const loadRegions = async () => {
    setLoadingRegions(true);
    try {
      const response = await storeService.getRegions();
      setRegions(response.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingRegions(false); }
  };

  const loadStoresByRegion = async (region) => {
    setLoadingStores(true);
    try {
      const response = await storeService.getByRegion(region);
      setStores(response.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingStores(false); }
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setFormData(prev => ({ ...prev, store: null }));
    if (region) loadStoresByRegion(region);
    else setStores([]);
  };

  const patch = (p) => setFormData((prev) => ({ ...prev, ...p }));

  const handleNext = () => step < 4 ? setStep(s => s + 1) : handleSubmit();
  const handleBack = () => setStep(s => Math.max(1, s - 1));
  const handleCancel = () => { setOpen(false); setStep(1); setError(""); setShowSidebar(false); setFormData({ title: "", description: "", dateDebut: "", dateFin: "", store: null, auditeur: null, elements: [] }); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.dateDebut || !formData.store) {
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }
    if (!formData.auditeur) { setError("Veuillez sélectionner un auditeur."); return; }
    if (formData.elements.length === 0) { setError("Veuillez sélectionner au moins un élément d'audit."); return; }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: formData.title,
        description: formData.description || "",
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        store: { id: formData.store.id },
        auditeur: { id: formData.auditeur.id },
        statut: "PLANIFIEE"
      };
      const elementIds = formData.elements.map(el => el.id);
      await missionService.create(payload, elementIds);
      setOpen(false);
      setFormData({ title: "", description: "", dateDebut: "", dateFin: "", store: null, auditeur: null, elements: [] });
      setStep(1);
      setSelectedRegion("");
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de la mission.");
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        Nouvelle mission
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden mx-2 sm:mx-0">
            
            
            <div className="flex flex-col lg:flex-row min-h-[80vh] sm:min-h-[500px]">
              
              {/* Sidebar - Hidden on mobile by default */}
              <div className={cn(
                "fixed inset-y-0 left-0 z-10 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:block",
                showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              )}>
                <StepSidebar current={step} onClose={() => setShowSidebar(false)} />
              </div>
              
              {/* Overlay for mobile sidebar */}
              {showSidebar && (
                <div 
                  className="fixed inset-0 z-5 bg-black/50 lg:hidden"
                  onClick={() => setShowSidebar(false)}
                />
              )}
              
              {/* Content Area */}
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 min-h-[500px] bg-white/50 dark:bg-gray-900/50 overflow-y-auto">
                <div className="flex-1">
                  {/* Step indicator for mobile */}
                  <div className="lg:hidden mb-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Étape {step} sur 4
                    </p>
                    <div className="flex gap-1 justify-center mt-2">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={cn(
                            "h-1 w-8 rounded-full transition-all",
                            s === step ? "bg-foreground" : "bg-gray-300 dark:bg-gray-700"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50/90 backdrop-blur-sm p-3 text-sm text-red-800 border border-red-200">
                      {error}
                    </div>
                  )}
                  
                  {step === 1 && <StepMissionInfo data={formData} onChange={patch} regions={regions} stores={stores} loadingRegions={loadingRegions} loadingStores={loadingStores} onRegionChange={handleRegionChange} selectedRegion={selectedRegion} />}
                  {step === 2 && <StepSelectAuditeur data={formData} onChange={patch} auditeurs={auditeurs} loading={loadingAuditeurs} />}
                  {step === 3 && <StepSelectElements data={formData} onChange={patch} elements={elements} loading={loadingElements} />}
                  {step === 4 && <StepSummary data={formData} onEdit={setStep} />}
                </div>

                {/* Navigation Buttons */}
                <div className={cn(
                  "flex flex-col-reverse sm:flex-row mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 gap-3",
                  step === 1 ? "sm:justify-end" : "sm:justify-between"
                )}>
                  {step > 1 && (
                    <Button variant="ghost" onClick={handleBack} disabled={submitting} className="w-full sm:w-auto order-2 sm:order-1">
                      Retour
                    </Button>
                  )}
                  <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                    <Button variant="outline" onClick={handleCancel} disabled={submitting} className="flex-1 sm:flex-none">
                      Annuler
                    </Button>
                    <Button onClick={handleNext} disabled={submitting} className="flex-1 sm:flex-none gap-2">
                      {submitting ? <Spinner /> : step === 4 ? "Créer" : "Suivant"}
                      {step < 4 && !submitting && <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
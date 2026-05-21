"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

export function SubmitButton({ progress, onSubmit, submitting, totalElements }) {
    const isComplete = progress === 100;

    return (
        <div className="mt-8 pt-6 border-t">
            <Button onClick={onSubmit} disabled={submitting || !isComplete} className="w-full gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {isComplete ? "Terminer l'audit" : `Complétez les éléments restants`}
            </Button>
        </div>
    );
}
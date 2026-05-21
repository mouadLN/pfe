"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

export function AuditHeader({ mission, progress, isTerminated }) {
    const router = useRouter();

    return (
        <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
            </Button>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{mission.title}</h1>
                    <p className="text-muted-foreground">{mission.description}</p>
                </div>
                <Badge variant={isTerminated ? "terminee" : "en_cours"}>
                    {isTerminated ? "Terminée" : "En cours"}
                </Badge>
            </div>
            {!isTerminated && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )}
        </div>
    );
}
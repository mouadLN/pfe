"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function StartSessionCard({ mission, onStart, error, submitting }) {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{mission.title}</CardTitle>
                    <CardDescription>Vous êtes sur le point de commencer cette mission</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Date limite</p>
                        <p className="font-medium">
                            {mission.dateFin ? format(new Date(mission.dateFin), "dd MMMM yyyy", { locale: fr }) : "Non définie"}
                        </p>
                    </div>
                    {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg">{error}</div>}
                    <Button onClick={onStart} disabled={submitting} className="gap-2">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Commencer l'audit
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
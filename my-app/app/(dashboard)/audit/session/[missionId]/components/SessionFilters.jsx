"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SessionFilters({ activeFilter, setActiveFilter, pendingCount, completedCount }) {
    return (
        <div className="lg:w-64 shrink-0">
            <div className="sticky top-24">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">Statut</h2>
                <div className="flex flex-row lg:flex-col gap-2">
                    <Button
                        variant={activeFilter === "pending" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveFilter("pending")}
                    >
                        📝 À noter
                        <Badge variant="secondary" className="ml-auto">{pendingCount}</Badge>
                    </Button>
                    <Button
                        variant={activeFilter === "completed" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveFilter("completed")}
                    >
                        ✅ Notés
                        <Badge variant="secondary" className="ml-auto">{completedCount}</Badge>
                    </Button>
                </div>
            </div>
        </div>
    );
}
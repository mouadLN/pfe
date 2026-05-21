"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { missionService } from "@/services/missionService";
import { auditSessionService } from "@/services/auditSessionService";
import { Loader2 } from "lucide-react";
import { AuditHeader } from "./components/AuditHeader";
import { SessionFilters } from "./components/SessionFilters";
import { GradeCard } from "./components/GradeCard";

export default function AuditSessionPage() {
    const params = useParams();
    const router = useRouter();
    const missionId = params.missionId;

    const [loading, setLoading] = useState(true);
    const [mission, setMission] = useState(null);
    const [session, setSession] = useState(null);
    const [elements, setElements] = useState([]);
    const [scores, setScores] = useState({});
    const [comments, setComments] = useState({});
    const [images, setImages] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [activeFilter, setActiveFilter] = useState("pending");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(stored);
    }, []);

    useEffect(() => {
        if (currentUser?.userId && missionId) {
            loadData();
        }
    }, [currentUser?.userId, missionId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const missionRes = await missionService.getById(missionId);
            const missionData = missionRes.data;
            setMission(missionData);
            setElements(missionData.auditElements || []);



            const sessionRes = await auditSessionService.getByMission(missionId, currentUser.userId);

            console.log("Session response:", sessionRes.data);

            if (sessionRes.data.exists) {
                setSession(sessionRes.data.session);

                const scoresRes = await auditSessionService.getScores(sessionRes.data.session.id);
                const scoreMap = {}, commentMap = {}, imageMap = {};
                scoresRes.data.forEach(score => {
                    scoreMap[score.auditElement.id] = score.score;
                    commentMap[score.auditElement.id] = score.commentaire || "";
                    imageMap[score.auditElement.id] = score.images || [];
                });
                setScores(scoreMap);
                setComments(commentMap);
                setImages(imageMap);
            } else {
                setError("Session introuvable. Retour aux missions...");
                setTimeout(() => router.push("/missions/auditeur"), 2000);
            }
        } catch (err) {
            setError("Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveScore = async (elementId, score, comment) => {
        if (!session) return;
        try {
            await auditSessionService.gradeElement(session.id, elementId, score, comment || "");
            setScores(prev => ({ ...prev, [elementId]: score }));
            setComments(prev => ({ ...prev, [elementId]: comment || "" }));
            setSuccess("Sauvegardé");
            setTimeout(() => setSuccess(""), 2000);
        } catch (err) {
            setError("Erreur lors de la sauvegarde");
        }
    };

    const handleSubmitAudit = async () => {
        const allGraded = elements.every(el => scores[el.id] && scores[el.id] >= 1);
        if (!allGraded) return setError("Veuillez noter tous les éléments");
        if (!confirm("Terminer l'audit ?")) return;

        setSubmitting(true);
        try {
            await auditSessionService.submitAudit(session.id);
            router.push("/missions/auditeur");
        } catch (err) {
            setError("Erreur lors de la soumission");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Guards — all at the bottom after handlers ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Chargement de la session...</p>
        </div>
    );

    if (error && !session) return (
        <div className="flex flex-col items-center justify-center h-96 gap-3">
            <p className="text-red-500">{error}</p>
        </div>
    );

    if (!mission || !session) return (
        <div className="p-12 text-center text-muted-foreground">
            Session introuvable.
        </div>
    );

    const pendingElements = elements.filter(el => !scores[el.id] || scores[el.id] < 1);
    const completedElements = elements.filter(el => scores[el.id] && scores[el.id] >= 1);
    const progress = elements.length ? ((completedElements.length / elements.length) * 100) : 0;

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <AuditHeader mission={mission} progress={progress} isTerminated={false} />

            {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg">{success}</div>}

            <div className="flex flex-col lg:flex-row gap-6">
                <SessionFilters
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    pendingCount={pendingElements.length}
                    completedCount={completedElements.length}
                />

                <div className="flex-1 space-y-4">
                    {activeFilter === "pending" && pendingElements.map(el => (
                        <GradeCard
                            key={el.id}
                            element={el}
                            score={scores[el.id]}
                            comment={comments[el.id] || ""}
                            onSave={handleSaveScore}
                            sessionId={session.id}
                        />
                    ))}

                    {activeFilter === "completed" && completedElements.map(el => (
                        <GradeCard
                            key={el.id}
                            element={el}
                            score={scores[el.id]}
                            comment={comments[el.id] || ""}
                            images={images[el.id] || []}
                            onSave={handleSaveScore}
                            sessionId={session.id}
                        />
                    ))}

                    {activeFilter === "pending" && pendingElements.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            🎉 Tous les éléments sont notés !
                        </div>
                    )}
                    {activeFilter === "completed" && completedElements.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            📋 Aucun élément noté
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t">
                <button
                    onClick={handleSubmitAudit}
                    disabled={progress < 100 || submitting}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                >
                    {submitting
                        ? "Envoi en cours..."
                        : progress === 100
                            ? "Terminer l'audit"
                            : `${Math.round(progress)}% complété`}
                </button>
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, Edit, CheckCircle, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { auditSessionService } from "@/services/auditSessionService";

export function GradeCard({ element, score, comment, images = [], onSave, sessionId }) {
    const [localScore, setLocalScore] = useState(score || "");
    const [localComment, setLocalComment] = useState(comment || "");
    const [localImages, setLocalImages] = useState(images || []);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        setLocalScore(score || "");
        setLocalComment(comment || "");
        setLocalImages(images || []);
    }, [score, comment, JSON.stringify(images)]); // ← stringify to compare by value

    const handleSave = async () => {
        if (!localScore || localScore < 1 || localScore > 10) return;
        setSaving(true);
        await onSave(element.id, parseInt(localScore), localComment);
        setSaving(false);
        setIsEditing(false);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const remaining = 3 - (localImages?.length || 0);
        setSelectedFiles(files.slice(0, remaining));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("images", file));

        try {
            const response = await auditSessionService.uploadImages(sessionId, element.id, formData);
            setLocalImages(response.data.images);
            setSelectedFiles([]);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (index) => {
        try {
            await auditSessionService.removeImage(sessionId, element.id, index);
            setLocalImages(prev => prev.filter((_, i) => i !== index));
        } catch (err) {
            console.error("Remove failed", err);
        }
    };

    const isGraded = score && score >= 1;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{element.nom}</CardTitle>
                        <CardDescription>{element.description || "Aucune description"}</CardDescription>
                    </div>
                    {isGraded && !isEditing && (
                        <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Note: {score}/10
                        </Badge>
                    )}
                    {isEditing && <Badge variant="warning">Modification</Badge>}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Score */}
                <div>
                    <Label>Note (1-10) <span className="text-destructive">*</span></Label>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={localScore}
                            onChange={(e) => setLocalScore(e.target.value)}
                            disabled={!isEditing && isGraded}
                            className={cn(
                                "w-24 px-3 py-2 border rounded-md",
                                !isEditing && isGraded && "bg-muted text-muted-foreground"
                            )}
                        />
                        {!isEditing && isGraded ? (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="h-3 w-3 mr-1" /> Modifier
                            </Button>
                        ) : (
                            <Button size="sm" onClick={handleSave} disabled={saving || !localScore}>
                                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                                Sauvegarder
                            </Button>
                        )}
                        {isEditing && (
                            <Button size="sm" variant="ghost" onClick={() => {
                                setIsEditing(false);
                                setLocalScore(score || "");
                            }}>
                                Annuler
                            </Button>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <Label>Commentaire</Label>
                    <Textarea
                        value={localComment}
                        onChange={(e) => setLocalComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="mt-1"
                        rows={2}
                        onBlur={() => {
                            if (localComment !== comment && (localScore || score)) {
                                onSave(element.id, parseInt(localScore) || score || 0, localComment);
                            }
                        }}
                    />
                </div>

                {/* Images */}
                <div>
                    <Label>Preuves (max 3)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {localImages?.map((img, idx) => (
                            <div key={idx} className="relative group">
                                <img
                                    src={img.startsWith('http') ? img : `http://localhost:8080${img}`}
                                    alt={`Preuve ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-md border"
                                />
                                <button
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {(localImages?.length || 0) < 3 && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="flex-1"
                                />
                                {selectedFiles.length > 0 && (
                                    <Button size="sm" onClick={handleUpload} disabled={uploading}>
                                        {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                                        Upload ({selectedFiles.length})
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {3 - (localImages?.length || 0)} photos restantes
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
"use client"

import { useState, useEffect } from "react"
import { elementAuditService } from "@/services/elementAuditService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

export function EditElementDialog({ element, open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nom: "",
    description: "",
    actif: true,
  })

  useEffect(() => {
    if (element) {
      setForm({
        nom: element.nom || "",
        description: element.description || "",
        actif: element.actif ?? true,
      })
    }
  }, [element])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      setError("Le nom est obligatoire.")
      return
    }

    setIsLoading(true)
    try {
      await elementAuditService.update(element.id, {
        nom: form.nom,
        description: form.description,
        actif: form.actif,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'élément d'audit</DialogTitle>
          <DialogDescription>
            Modifiez les informations ci-dessous.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="nom">
              Nom <span className="text-destructive">*</span>
            </FieldLabel>
            <Input 
              id="nom" 
              name="nom" 
              value={form.nom}
              onChange={handleChange}
              required 
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea 
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <><Spinner /> Enregistrement...</> : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState } from "react"
import { elementAuditService } from "@/services/elementAuditService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

export function AddNewElement({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nom: "",
    description: "",
    actif: true, // default to active
  })

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
      await elementAuditService.create({
        nom: form.nom,
        description: form.description || "",
        actif: true,
      })
      setOpen(false)
      setForm({ nom: "", description: "", actif: true })
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'élément.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un élément</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouvel élément d'audit</DialogTitle>
          <DialogDescription>
            Remplissez les informations du nouvel élément d'audit ci-dessous, puis cliquez sur « Enregistrer » pour valider.
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
              placeholder="Nom de l'élément d'audit" 
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
              placeholder="Entrez une description ici."
              value={form.description}
              onChange={handleChange}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Annuler</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <><Spinner /> Enregistrement...</> : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
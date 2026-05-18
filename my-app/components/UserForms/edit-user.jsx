"use client"

import { useState, useEffect } from "react"
import { userService } from "@/services/userService"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"

export function EditUserDialog({ user, open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const [form, setForm] = useState({
    userCode: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    region: "",
    role: "AUDITEUR",
  })

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  useEffect(() => {
  if (user) {
    setForm({
      userCode: user.userCode || "",
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      region: user.region || "",
      role: user.role || "AUDITEUR",
    })
    setError("") 
  }
}, [user])


const handleOpenChange = (open) => {
  if (!open) {
    setError("") 
  }
  onOpenChange(open)
}

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!form.prenom || !form.nom || !form.email) {
      setError("Veuillez remplir tous les champs obligatoires.")
      return
    }

    // ✅ Email format validation
    if (!isValidEmail(form.email)) {
      setError("Veuillez entrer une adresse email valide (exemple: nom@domaine.com).")
      return
    }

    setIsLoading(true)
    try {
      await userService.update(user.id, {
        userCode: form.userCode,
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || null,
        region: form.region || null,
        role: form.role,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      // ✅ Better error handling
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
        const firstError = Object.values(validationErrors)[0]
        setError(firstError || "Erreur lors de la modification de l'utilisateur.")
      } else {
        setError("Erreur lors de la modification de l'utilisateur.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur ci-dessous.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="userCode">
            Code Utilisateur <span className="text-destructive">*</span>
          </FieldLabel>
          <Input 
            id="userCode" 
            name="userCode" 
            placeholder="USER001" 
            value={form.userCode} 
            onChange={handleChange} 
            disabled  // Usually userCode shouldn't be changed
          />
        </Field>

        <FieldGroup className="grid max-w-sm grid-cols-2">
          <Field>
            <FieldLabel htmlFor="prenom">Prénom <span className="text-destructive">*</span></FieldLabel>
            <Input 
              id="prenom" 
              name="prenom" 
              placeholder="Assia" 
              value={form.prenom} 
              onChange={handleChange} 
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nom">Nom <span className="text-destructive">*</span></FieldLabel>
            <Input 
              id="nom" 
              name="nom" 
              placeholder="DAHIR" 
              value={form.nom} 
              onChange={handleChange} 
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email <span className="text-destructive">*</span></FieldLabel>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              value={form.email} 
              onChange={handleChange} 
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="telephone">Téléphone</FieldLabel>
            <Input 
              id="telephone" 
              name="telephone" 
              placeholder="06XXXXXXXX" 
              value={form.telephone} 
              onChange={handleChange} 
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="region">Région</FieldLabel>
            <Input 
              id="region" 
              name="region" 
              placeholder="Casablanca" 
              value={form.region} 
              onChange={handleChange} 
            />
          </Field>
        </FieldGroup>

        <div>
          <FieldLabel>Rôle <span className="text-destructive">*</span></FieldLabel>
          <RadioGroup
            value={form.role}
            onValueChange={(val) => setForm({ ...form, role: val })}
            className="mt-2 w-fit"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="ADMIN" id="edit-r1" />
              <Label htmlFor="edit-r1">Administrateur</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="AUDITEUR" id="edit-r2" />
              <Label htmlFor="edit-r2">Auditeur</Label>
            </div>
          </RadioGroup>
        </div>

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
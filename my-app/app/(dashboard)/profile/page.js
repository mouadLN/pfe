"use client"

import { useState, useEffect } from "react"
import { userService } from "@/services/userService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2, Mail, Phone, MapPin, Hash, Calendar,
  Pencil, Check, X, ShieldCheck, User, AlertCircle, CircleCheck,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

const initials = (prenom, nom) =>
  `${(prenom || "")[0] || ""}${(nom || "")[0] || ""}`.toUpperCase()

/* ── Read-only field row ── */
function InfoRow({ icon: Icon, label, value, children }) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">
          {label}
        </Label>
        {children ?? (
          <p className={`text-sm font-medium ${!value ? "text-muted-foreground italic" : ""}`}>
            {value || "Non renseigné"}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ email: "", telephone: "", region: "" })

  useEffect(() => { fetchUser() }, [])

  const fetchUser = async () => {
    try {
      const cu = JSON.parse(localStorage.getItem("user") || "{}")
      if (cu.userId) {
        const { data } = await userService.getById(cu.userId)
        setUser(data)
        setForm({ email: data.email || "", telephone: data.telephone || "", region: data.region || "" })
      }
    } catch {
      setError("Impossible de charger le profil.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setForm({ email: user?.email || "", telephone: user?.telephone || "", region: user?.region || "" })
    setError("")
    setSuccess("")
  }

  const handleSave = async () => {
    if (!isValidEmail(form.email)) {
      setError("Adresse email invalide (ex : nom@domaine.com)")
      return
    }
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const cu = JSON.parse(localStorage.getItem("user") || "{}")
      await userService.update(cu.userId, {
        email: form.email,
        telephone: form.telephone || null,
        region: form.region || null,
      })
      setUser((u) => ({ ...u, ...form }))
      cu.email = form.email
      localStorage.setItem("user", JSON.stringify(cu))
      setSuccess("Profil mis à jour avec succès.")
      setTimeout(() => setSuccess(""), 4000)
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.")
    } finally {
      setSaving(false)
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Separator />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ✅ Add null check - if no user, show error
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger le profil utilisateur.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg tracking-tight select-none shrink-0">
            {initials(user?.prenom, user?.nom)}
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {user?.prenom} {user?.nom}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* ✅ Fixed: Use optional chaining and fallback */}
              <Badge variant={user?.role === "ADMIN" ? "admin" : "auditor"} className="gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                {user?.role === "ADMIN" ? "Administrateur" : "Auditeur"}
              </Badge>
            </div>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsEditing(true); setError(""); setSuccess("") }}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Modifier
          </Button>
        )}
      </div>

      <Separator />

      {/* ── Alerts ── */}
      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mt-6 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
          <CircleCheck className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* ── Fields ── */}
      <div className="mt-2 divide-y divide-border">

        <InfoRow icon={Hash} label="Code utilisateur" value={user?.userCode} />

        <InfoRow icon={Mail} label="Email">
          {isEditing ? (
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nom@domaine.com"
              className="mt-1 h-8 text-sm max-w-sm"
            />
          ) : (
            <p className="text-sm font-medium">{user?.email}</p>
          )}
        </InfoRow>

        <InfoRow icon={Phone} label="Téléphone">
          {isEditing ? (
            <Input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="0612345678"
              maxLength={10}
              className="mt-1 h-8 text-sm max-w-sm"
            />
          ) : (
            <p className={`text-sm font-medium ${!user?.telephone ? "text-muted-foreground italic" : ""}`}>
              {user?.telephone || "Non renseigné"}
            </p>
          )}
        </InfoRow>

        <InfoRow icon={MapPin} label="Région">
          {isEditing ? (
            <Input
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="Casablanca"
              className="mt-1 h-8 text-sm max-w-sm"
            />
          ) : (
            <p className={`text-sm font-medium ${!user?.region ? "text-muted-foreground italic" : ""}`}>
              {user?.region || "Non renseignée"}
            </p>
          )}
        </InfoRow>

        <InfoRow
          icon={Calendar}
          label="Membre depuis"
          value={
            user?.dateCreation
              ? format(new Date(user.dateCreation), "dd MMMM yyyy", { locale: fr })
              : "—"
          }
        />
      </div>

      {/* ── Save / Cancel ── */}
      {isEditing && (
        <>
          <Separator className="mt-6" />
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Enregistrement…</>
                : <><Check className="h-3.5 w-3.5 mr-1.5" />Enregistrer</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Annuler
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
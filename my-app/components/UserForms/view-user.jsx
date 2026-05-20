"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Hash, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function ViewUserDialog({ user, open, onOpenChange }) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {user.prenom} {user.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Role & Status */}
          <div className="flex gap-2">
            <Badge variant={user.role === "ADMIN" ? "admin" : "auditor"}>
              {user.role === "ADMIN" ? "Administrateur" : "Auditeur"}
            </Badge>
          </div>

          {/* User Code */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Code Utilisateur</p>
              <p className="font-medium">{user.userCode}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">{user.telephone || "Non renseigné"}</p>
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Région</p>
              <p className="font-medium">{user.region || "Non renseignée"}</p>
            </div>
          </div>

          {/* Date Created */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Membre depuis</p>
              <p className="font-medium">
                {user.dateCreation 
                  ? format(new Date(user.dateCreation), "dd MMMM yyyy", { locale: fr })
                  : "Non disponible"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
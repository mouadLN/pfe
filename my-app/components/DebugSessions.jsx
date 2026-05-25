"use client"
import { useEffect } from "react"
import { auditSessionService } from "@/services/auditSessionService"

export default function DebugSessions() {
  useEffect(() => {
  auditSessionService.getAll()
    .then((res) => {
      console.log("SESSIONS raw:", JSON.stringify(res.data, null, 2).slice(0, 2000))
    })
    .catch((e) => console.log("erreur:", e.message))
}, [])

  return null
}
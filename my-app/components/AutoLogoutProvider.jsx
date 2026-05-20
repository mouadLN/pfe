"use client"

import { useAutoLogout } from "@/hooks/useAutoLogout"

export function AutoLogoutProvider({ children }) {
  useAutoLogout()
  return children
}
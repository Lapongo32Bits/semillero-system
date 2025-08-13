"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { SemilleroSelector } from "./semillero-selector"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredSection?: string
}

export function ProtectedRoute({ children, requiredSection }: ProtectedRouteProps) {
  const { user, selectedSemillero, canAccess, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Si es profesor o estudiante y no ha seleccionado semillero
  if ((user.role === "profesor" || user.role === "estudiante") && !selectedSemillero) {
    return <SemilleroSelector />
  }

  // Verificar permisos para la sección específica
  if (requiredSection && !canAccess(requiredSection)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acceso Restringido</h1>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

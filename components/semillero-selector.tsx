"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Users, BookOpen, ChevronRight } from "lucide-react"

export function SemilleroSelector() {
  const { user, semilleros, selectSemillero } = useAuth()
  const [selectedId, setSelectedId] = useState<string>("")

  if (!user || user.role === "administrador" || user.role === "visitante" || user.role === "estudiante") {
    return null
  }

  if (user.role !== "profesor") {
    return null
  }

  const handleSelect = () => {
    const semillero = semilleros.find((s) => s.id === selectedId)
    if (semillero) {
      selectSemillero(semillero)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Selecciona tu Semillero</h1>
          <p className="text-muted-foreground">
            Como profesor, puedes coordinar múltiples semilleros. Selecciona uno para comenzar.
          </p>
        </div>

        {/* Semilleros Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {semilleros.map((semillero) => (
            <Card
              key={semillero.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === semillero.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedId(semillero.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{semillero.name}</CardTitle>
                    <CardDescription>{semillero.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedId === semillero.id && (
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{semillero.members} miembros</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Coordinador: {semillero.coordinator}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button onClick={handleSelect} disabled={!selectedId} size="lg" className="px-8">
            Continuar al Sistema
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Podrás cambiar de semillero en cualquier momento desde el sistema.</p>
        </div>
      </div>
    </div>
  )
}

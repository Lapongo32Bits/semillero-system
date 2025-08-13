"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, FileText, Download, Edit } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { dataService, type Project } from "@/lib/data-service"

export default function ProyectoDetallePage({ params }: { params: { id: string } }) {
  const { user, canDownload } = useAuth()
  const router = useRouter()
  const [proyecto, setProyecto] = useState<Project | null>(null)

  useEffect(() => {
    const projects = dataService.getProjects()
    const foundProject = projects.find((p) => p.id === params.id)
    setProyecto(foundProject || null)
  }, [params.id])

  if (!proyecto) {
    return (
      <ProtectedRoute requiredSection="proyectos">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Proyecto no encontrado</p>
        </div>
      </ProtectedRoute>
    )
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "en-progreso":
        return "default"
      case "planificacion":
        return "secondary"
      case "completado":
        return "success"
      case "pausado":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "en-progreso":
        return "En progreso"
      case "planificacion":
        return "Planificación"
      case "completado":
        return "Completado"
      case "pausado":
        return "Pausado"
      default:
        return status
    }
  }

  const canEditProject = (): boolean => {
    if (!user) return false

    // Solo estudiantes pueden editar proyectos
    if (user.role !== "estudiante") return false

    // Solo pueden editar proyectos de su propio semillero
    if (proyecto.semilleroId !== user.semilleroId) return false

    // Verificar si el estudiante es parte del equipo del proyecto
    return proyecto.team.some((member) => member.toLowerCase().includes(user.name.toLowerCase()))
  }

  const handleEditarProyecto = () => {
    router.push(`/proyectos/${proyecto.id}/editar`)
  }

  const handleDescargarDocumento = (documentName: string) => {
    const link = document.createElement("a")
    link.href = "#"
    link.download = documentName
    link.click()
    console.log(`Descargando documento: ${documentName}`)
  }

  return (
    <ProtectedRoute requiredSection="proyectos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">{proyecto.title}</h1>
                <Badge variant={getStatusColor(proyecto.status)}>{getStatusLabel(proyecto.status)}</Badge>
              </div>
              <p className="text-muted-foreground">
                ID: {proyecto.id} • Semillero: {proyecto.semilleroName}
              </p>
            </div>
          </div>
          {canEditProject() && (
            <Button onClick={handleEditarProyecto}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Proyecto
            </Button>
          )}
        </div>

        {/* Información general */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{proyecto.progress}%</div>
              <Progress value={proyecto.progress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${proyecto.budget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Presupuesto asignado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duración</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.ceil(
                  (new Date(proyecto.endDate).getTime() - new Date(proyecto.startDate).getTime()) /
                    (1000 * 60 * 60 * 24 * 30),
                )}{" "}
                meses
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(proyecto.startDate).toLocaleDateString()} - {new Date(proyecto.endDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Tabs defaultValue="descripcion" className="space-y-4">
          <TabsList>
            <TabsTrigger value="descripcion">Descripción</TabsTrigger>
            <TabsTrigger value="equipo">Equipo</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="descripcion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{proyecto.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipo">
            <Card>
              <CardHeader>
                <CardTitle>Equipo de Investigación</CardTitle>
                <CardDescription>{proyecto.team.length} miembros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proyecto.team.map((investigador, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{investigador}</h4>
                        <p className="text-sm text-muted-foreground">Investigador</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos del Proyecto</CardTitle>
                <CardDescription>Archivos relacionados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proyecto.documentName ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{proyecto.documentName}</p>
                          <p className="text-sm text-muted-foreground">Documento principal del proyecto</p>
                        </div>
                      </div>
                      {canDownload(proyecto.semilleroId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDescargarDocumento(proyecto.documentName!)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No hay documentos disponibles</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

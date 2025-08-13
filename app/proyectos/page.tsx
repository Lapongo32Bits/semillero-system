"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, Calendar, Users, DollarSign, MoreHorizontal, Eye, Download } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { dataService, type Project } from "@/lib/data-service"

export default function ProyectosPage() {
  const { user, selectedSemillero, canDownload, canCreateProject } = useAuth()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState<string[]>([])
  const [proyectos, setProyectos] = useState<Project[]>([])

  useEffect(() => {
    dataService.initializeMockData()
    loadProyectos()
  }, [])

  const loadProyectos = () => {
    const allProjects = dataService.getProjects()
    setProyectos(allProjects)
  }

  const getCategoriaFromSemillero = (semilleroName: string): string => {
    if (semilleroName.includes("Inteligencia Artificial") || semilleroName.includes("Blockchain")) return "Tecnología"
    if (semilleroName.includes("Sostenibilidad") || semilleroName.includes("Medio Ambiente")) return "Ambiental"
    if (semilleroName.includes("Fintech")) return "Finanzas"
    if (semilleroName.includes("Biotecnología") || semilleroName.includes("Médica")) return "Medicina"
    return "Otros"
  }

  // Filter projects by selected semillero
  const getProyectosBySemillero = () => {
    if (user?.role === "administrador") {
      return proyectos // Admin can see all projects
    }

    if (!selectedSemillero) {
      return []
    }

    return proyectos.filter((proyecto) => proyecto.semilleroId === selectedSemillero.id)
  }

  const proyectosFiltrados = getProyectosBySemillero().filter((proyecto) => {
    const matchesSearch =
      proyecto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filtroEstado.length === 0 || filtroEstado.includes(proyecto.status)
    const categoria = getCategoriaFromSemillero(proyecto.semilleroName)
    const matchesCategoria = filtroCategoria.length === 0 || filtroCategoria.includes(categoria)

    return matchesSearch && matchesEstado && matchesCategoria
  })

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

  const handleVerProyecto = (id: string) => {
    router.push(`/proyectos/${id}`)
  }

  const handleDescargarDocumento = (proyecto: Project) => {
    if (proyecto.documentName) {
      const link = document.createElement("a")
      link.href = "#"
      link.download = proyecto.documentName
      link.click()
      console.log(`Descargando documento: ${proyecto.documentName}`)
    }
  }

  const handleNuevoProyecto = () => {
    router.push("/proyectos/nuevo")
  }

  const handleEstadoFilter = (estado: string, checked: boolean) => {
    if (checked) {
      setFiltroEstado([...filtroEstado, estado])
    } else {
      setFiltroEstado(filtroEstado.filter((e) => e !== estado))
    }
  }

  const handleCategoriaFilter = (categoria: string, checked: boolean) => {
    if (checked) {
      setFiltroCategoria([...filtroCategoria, categoria])
    } else {
      setFiltroCategoria(filtroCategoria.filter((c) => c !== categoria))
    }
  }

  const limpiarFiltros = () => {
    setFiltroEstado([])
    setFiltroCategoria([])
    setSearchTerm("")
  }

  const proyectosMostrados = getProyectosBySemillero()

  return (
    <ProtectedRoute requiredSection="proyectos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Proyectos</h1>
            <p className="text-muted-foreground">
              Planificación, seguimiento y evaluación de proyectos de investigación
            </p>
          </div>
          {canCreateProject() && (
            <Button onClick={handleNuevoProyecto}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          )}
        </div>

        {selectedSemillero && user?.role !== "administrador" && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Semillero actual:</span> {selectedSemillero.name}
              {user.semilleroId !== selectedSemillero.id && (
                <span className="text-muted-foreground ml-2">(Solo lectura)</span>
              )}
            </p>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {(filtroEstado.length > 0 || filtroCategoria.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {filtroEstado.length + filtroCategoria.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-semibold">Estado del Proyecto</div>
              <DropdownMenuCheckboxItem
                checked={filtroEstado.includes("en-progreso")}
                onCheckedChange={(checked) => handleEstadoFilter("en-progreso", checked)}
              >
                En progreso
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filtroEstado.includes("planificacion")}
                onCheckedChange={(checked) => handleEstadoFilter("planificacion", checked)}
              >
                Planificación
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filtroEstado.includes("completado")}
                onCheckedChange={(checked) => handleEstadoFilter("completado", checked)}
              >
                Completado
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filtroEstado.includes("pausado")}
                onCheckedChange={(checked) => handleEstadoFilter("pausado", checked)}
              >
                Pausado
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <div className="px-2 py-1.5 text-sm font-semibold">Categoría</div>
              <DropdownMenuCheckboxItem
                checked={filtroCategoria.includes("Tecnología")}
                onCheckedChange={(checked) => handleCategoriaFilter("Tecnología", checked)}
              >
                Tecnología
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filtroCategoria.includes("Ambiental")}
                onCheckedChange={(checked) => handleCategoriaFilter("Ambiental", checked)}
              >
                Ambiental
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filtroCategoria.includes("Finanzas")}
                onCheckedChange={(checked) => handleCategoriaFilter("Finanzas", checked)}
              >
                Finanzas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filtroCategoria.includes("Medicina")}
                onCheckedChange={(checked) => handleCategoriaFilter("Medicina", checked)}
              >
                Medicina
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={limpiarFiltros}>Limpiar filtros</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proyectosMostrados.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSemillero ? `En ${selectedSemillero.name}` : "Total general"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proyectosMostrados.filter((p) => p.status === "en-progreso").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {proyectosMostrados.length > 0
                  ? Math.round(
                      (proyectosMostrados.filter((p) => p.status === "en-progreso").length /
                        proyectosMostrados.length) *
                        100,
                    )
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proyectosMostrados.filter((p) => p.status === "completado").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {proyectosMostrados.length > 0
                  ? Math.round(
                      (proyectosMostrados.filter((p) => p.status === "completado").length / proyectosMostrados.length) *
                        100,
                    )
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${proyectosMostrados.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{selectedSemillero ? "Del semillero" : "Total general"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de proyectos */}
        <div className="space-y-4">
          {proyectosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {proyectosMostrados.length === 0
                    ? "No hay proyectos en este semillero."
                    : "No se encontraron proyectos que coincidan con los filtros."}
                </p>
              </CardContent>
            </Card>
          ) : (
            proyectosFiltrados.map((proyecto) => (
              <Card key={proyecto.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">{proyecto.title}</CardTitle>
                        <Badge variant={getStatusColor(proyecto.status)}>{getStatusLabel(proyecto.status)}</Badge>
                        {/* Show semillero badge for admin */}
                        {user?.role === "administrador" && <Badge variant="outline">{proyecto.semilleroName}</Badge>}
                      </div>
                      <CardDescription className="max-w-2xl">{proyecto.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVerProyecto(proyecto.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Proyecto
                        </DropdownMenuItem>
                        {canDownload(proyecto.semilleroId) && proyecto.documentName && (
                          <DropdownMenuItem onClick={() => handleDescargarDocumento(proyecto)}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Documento
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progreso */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso del proyecto</span>
                      <span className="font-medium">{proyecto.progress}%</span>
                    </div>
                    <Progress value={proyecto.progress} className="h-2" />
                  </div>

                  {/* Información del proyecto */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(proyecto.startDate).toLocaleDateString()} -{" "}
                        {new Date(proyecto.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${proyecto.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{proyecto.team.length} investigadores</span>
                    </div>
                  </div>

                  {/* Equipo */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Equipo de investigación:</h4>
                    <div className="flex flex-wrap gap-2">
                      {proyecto.team.map((investigador, index) => (
                        <Badge key={index} variant="secondary">
                          {investigador}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

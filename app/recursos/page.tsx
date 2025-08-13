"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Package, DollarSign, Monitor, CheckCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { dataService, type Resource, type Project } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

interface Recurso {
  id: string
  nombre: string
  categoria: "Computación" | "Laboratorio" | "Mobiliario" | "Software" | "Otros"
  estado: "Disponible" | "En uso" | "Mantenimiento"
  ubicacion: string
  asignadoA?: string
  proyectoId?: string
  proyectoNombre?: string
  fechaAdquisicion: string
  costo: number
  descripcion: string
  semilleroId: string
}

export default function RecursosPage() {
  const { user, selectedSemillero, canManageResources } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Recurso | null>(null)
  const [recursos, setRecursos] = useState<Resource[]>([])
  const [proyectos, setProyectos] = useState<Project[]>([])
  const [newResource, setNewResource] = useState({
    nombre: "",
    categoria: "Computación" as const,
    estado: "Disponible" as const,
    ubicacion: "",
    proyectoId: "",
    costo: 0,
    descripcion: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allResources = dataService.getResources()
    const allProjects = dataService.getProjects()
    setRecursos(allResources)
    setProyectos(allProjects)
  }

  // Filter projects by current semillero
  const proyectosDelSemillero = proyectos.filter((p) => !selectedSemillero || p.semilleroId === selectedSemillero.id)

  const getRecursosBySemillero = (): Resource[] => {
    if (user?.role === "administrador") {
      return recursos // Admin can see all resources
    }

    if (!selectedSemillero) {
      return []
    }

    return recursos.filter((recurso) => recurso.semilleroId === selectedSemillero.id)
  }

  const recursosMostrados = getRecursosBySemillero()

  const recursosFiltrados = recursosMostrados.filter(
    (recurso) =>
      recurso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "default"
      case "en-uso":
        return "secondary"
      case "mantenimiento":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getEstadoLabel = (status: string): string => {
    switch (status) {
      case "disponible":
        return "Disponible"
      case "en-uso":
        return "En uso"
      case "mantenimiento":
        return "Mantenimiento"
      default:
        return status
    }
  }

  const handleCreateResource = async () => {
    if (!newResource.nombre || !newResource.ubicacion || !selectedSemillero || !user) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    const proyecto = proyectosDelSemillero.find((p) => p.id === newResource.proyectoId)

    try {
      const newResourceData = dataService.saveResource({
        name: newResource.nombre,
        type: newResource.categoria.toLowerCase() as "equipo" | "presupuesto" | "personal",
        status: newResource.estado.toLowerCase().replace(" ", "-") as "disponible" | "en-uso" | "mantenimiento",
        projectId: newResource.proyectoId,
        projectName: proyecto?.title || "",
        semilleroId: selectedSemillero.id,
        assignedTo: newResource.estado === "En uso" ? user.name : undefined,
        description: newResource.descripcion,
        createdBy: user.id,
      })

      toast({
        title: "Recurso creado",
        description: `El recurso "${newResource.nombre}" ha sido creado exitosamente`,
      })

      loadData()
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el recurso",
        variant: "destructive",
      })
    }
  }

  const handleEditResource = (recurso: Resource) => {
    setEditingResource(recurso as any)
    setNewResource({
      nombre: recurso.name,
      categoria: "Computación", // Map from resource type
      estado: recurso.status === "disponible" ? "Disponible" : recurso.status === "en-uso" ? "En uso" : "Mantenimiento",
      ubicacion: "Lab. Sistemas", // Default location
      proyectoId: recurso.projectId,
      costo: 0, // Default cost
      descripcion: recurso.description,
    })
    setIsDialogOpen(true)
  }

  const handleUpdateResource = async () => {
    if (!editingResource || !newResource.nombre || !newResource.ubicacion) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    const proyecto = proyectosDelSemillero.find((p) => p.id === newResource.proyectoId)

    try {
      const success = dataService.updateResource(editingResource.id, {
        name: newResource.nombre,
        status: newResource.estado.toLowerCase().replace(" ", "-") as "disponible" | "en-uso" | "mantenimiento",
        projectId: newResource.proyectoId,
        projectName: proyecto?.title || "",
        description: newResource.descripcion,
      })

      if (success) {
        toast({
          title: "Recurso actualizado",
          description: `El recurso "${newResource.nombre}" ha sido actualizado exitosamente`,
        })
        loadData()
        resetForm()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el recurso",
        variant: "destructive",
      })
    }
  }

  const handleDeleteResource = async (recursoId: string) => {
    try {
      const success = dataService.deleteResource(recursoId)
      if (success) {
        toast({
          title: "Recurso eliminado",
          description: "El recurso ha sido eliminado exitosamente",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el recurso",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingResource(null)
    setNewResource({
      nombre: "",
      categoria: "Computación",
      estado: "Disponible",
      ubicacion: "",
      proyectoId: "",
      costo: 0,
      descripcion: "",
    })
    setIsDialogOpen(false)
  }

  const canManage = canManageResources(selectedSemillero?.id)

  return (
    <ProtectedRoute requiredSection="recursos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Recursos</h1>
            <p className="text-muted-foreground">Administración y asignación de recursos físicos ligados a proyectos</p>
          </div>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingResource(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Recurso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingResource ? "Editar Recurso" : "Agregar Nuevo Recurso"}</DialogTitle>
                  <DialogDescription>
                    {editingResource
                      ? "Modifica la información del recurso."
                      : "Ingresa la información del nuevo recurso para el semillero."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre del recurso</Label>
                    <Input
                      id="nombre"
                      value={newResource.nombre}
                      onChange={(e) => setNewResource({ ...newResource, nombre: e.target.value })}
                      placeholder="Ej: Laptop Dell Precision"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={newResource.categoria}
                      onValueChange={(value: any) => setNewResource({ ...newResource, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computación">Computación</SelectItem>
                        <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                        <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={newResource.estado}
                      onValueChange={(value: any) => setNewResource({ ...newResource, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="En uso">En uso</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={newResource.ubicacion}
                      onChange={(e) => setNewResource({ ...newResource, ubicacion: e.target.value })}
                      placeholder="Ej: Laboratorio de Sistemas"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proyecto">Proyecto asociado (opcional)</Label>
                    <Select
                      value={newResource.proyectoId}
                      onValueChange={(value) => setNewResource({ ...newResource, proyectoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin proyecto asignado</SelectItem>
                        {proyectosDelSemillero.map((proyecto) => (
                          <SelectItem key={proyecto.id} value={proyecto.id}>
                            {proyecto.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="costo">Costo (USD)</Label>
                    <Input
                      id="costo"
                      type="number"
                      value={newResource.costo}
                      onChange={(e) =>
                        setNewResource({ ...newResource, costo: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newResource.descripcion}
                      onChange={(e) => setNewResource({ ...newResource, descripcion: e.target.value })}
                      placeholder="Descripción detallada del recurso"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={editingResource ? handleUpdateResource : handleCreateResource}>
                    {editingResource ? "Actualizar" : "Crear"} Recurso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {selectedSemillero && user?.role !== "administrador" && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Semillero actual:</span> {selectedSemillero.name}
              {!canManage && <span className="text-muted-foreground ml-2">(Solo lectura)</span>}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recursos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recursos Totales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recursosMostrados.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSemillero ? `En ${selectedSemillero.name}` : "Total general"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proyectosDelSemillero.length}</div>
              <p className="text-xs text-muted-foreground">Con recursos asignados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Uso</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recursosMostrados.filter((r) => r.status === "en-uso").length}</div>
              <p className="text-xs text-muted-foreground">
                {recursosMostrados.length > 0
                  ? Math.round(
                      (recursosMostrados.filter((r) => r.status === "en-uso").length / recursosMostrados.length) * 100,
                    )
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recursosMostrados.filter((r) => r.status === "disponible").length}
              </div>
              <p className="text-xs text-muted-foreground">Listos para usar</p>
            </CardContent>
          </Card>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {recursosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {recursosMostrados.length === 0
                    ? "No hay recursos registrados en este semillero."
                    : "No se encontraron recursos que coincidan con la búsqueda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            recursosFiltrados.map((recurso) => (
              <Card key={recurso.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">{recurso.name}</CardTitle>
                        <Badge variant={getEstadoColor(recurso.status)}>{getEstadoLabel(recurso.status)}</Badge>
                        <Badge variant="outline">{recurso.type}</Badge>
                      </div>
                      <CardDescription>{recurso.description}</CardDescription>
                      {recurso.projectName && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-muted-foreground">Proyecto:</span>
                          <Badge variant="secondary">{recurso.projectName}</Badge>
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditResource(recurso)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteResource(recurso.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Asignado a</p>
                      <p className="text-sm text-muted-foreground">{recurso.assignedTo || "No asignado"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Creado por</p>
                      <p className="text-sm text-muted-foreground">{recurso.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Fecha de creación</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(recurso.createdAt).toLocaleDateString()}
                      </p>
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

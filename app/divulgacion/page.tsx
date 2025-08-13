"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Search,
  FileText,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  Download,
  Share,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataService, type Project, type Event, type Collaboration } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

export default function DivulgacionPage() {
  const { user, canDownload } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    type: "conferencia" as "conferencia" | "taller" | "seminario" | "congreso",
    organizer: "",
  })

  const [newCollab, setNewCollab] = useState({
    title: "",
    institution: "",
    description: "",
    status: "activa" as "activa" | "finalizada" | "pendiente",
    startDate: "",
    endDate: "",
    contact: "",
    email: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    dataService.initializeMockData()
    const allProjects = dataService.getProjects()
    const allEvents = dataService.getEvents()
    const allCollaborations = dataService.getCollaborations()
    setProjects(allProjects)
    setEvents(allEvents)
    setCollaborations(allCollaborations)
  }

  const proyectosFiltrados = projects.filter(
    (proyecto) =>
      proyecto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.semilleroName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.team.some((member) => member.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const canManageContent = user?.role === "administrador" || user?.role === "profesor"
  const isVisitor = user?.role === "visitante"

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completado":
        return "default"
      case "en-progreso":
        return "secondary"
      case "planificacion":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getEstadoLabel = (status: string): string => {
    switch (status) {
      case "completado":
        return "Completado"
      case "en-progreso":
        return "En progreso"
      case "planificacion":
        return "Planificación"
      case "pausado":
        return "Pausado"
      default:
        return status
    }
  }

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case "Alto":
        return "destructive"
      case "Medio":
        return "default"
      case "Bajo":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const handleViewDetails = (proyecto: Project) => {
    setSelectedProject(proyecto)
    setShowProjectModal(true)
  }

  const handleDownload = (proyecto: Project) => {
    if (proyecto.documentName) {
      const link = document.createElement("a")
      link.href = "#"
      link.download = proyecto.documentName
      link.click()
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${proyecto.documentName}`,
      })
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !user) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    try {
      const eventData = dataService.saveEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        type: newEvent.type,
        organizer: newEvent.organizer || user.name,
        createdBy: user.id,
      })

      toast({
        title: "Evento creado",
        description: `El evento "${newEvent.title}" ha sido creado exitosamente`,
      })

      loadData()
      resetEventForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive",
      })
    }
  }

  const handleCreateCollaboration = async () => {
    if (!newCollab.title || !newCollab.institution || !user) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    try {
      const collabData = dataService.saveCollaboration({
        title: newCollab.title,
        institution: newCollab.institution,
        description: newCollab.description,
        status: newCollab.status,
        startDate: newCollab.startDate,
        endDate: newCollab.endDate,
        contact: newCollab.contact,
        email: newCollab.email,
        createdBy: user.id,
      })

      toast({
        title: "Colaboración creada",
        description: `La colaboración con "${newCollab.institution}" ha sido creada exitosamente`,
      })

      loadData()
      resetCollabForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la colaboración",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      type: event.type,
      organizer: event.organizer,
    })
    setIsEventDialogOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const success = dataService.deleteEvent(eventId)
      if (success) {
        toast({
          title: "Evento eliminado",
          description: "El evento ha sido eliminado exitosamente",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive",
      })
    }
  }

  const handleEditCollaboration = (collab: Collaboration) => {
    setEditingCollab(collab)
    setNewCollab({
      title: collab.title,
      institution: collab.institution,
      description: collab.description,
      status: collab.status,
      startDate: collab.startDate,
      endDate: collab.endDate || "",
      contact: collab.contact,
      email: collab.email,
    })
    setIsCollabDialogOpen(true)
  }

  const handleDeleteCollaboration = async (collabId: string) => {
    try {
      const success = dataService.deleteCollaboration(collabId)
      if (success) {
        toast({
          title: "Colaboración eliminada",
          description: "La colaboración ha sido eliminada exitosamente",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la colaboración",
        variant: "destructive",
      })
    }
  }

  const handleViewCollaborationDetails = (colaboracion: Collaboration) => {
    setSelectedCollaboration(colaboracion)
    setShowCollaborationModal(true)
  }

  const handleViewEventDetails = (evento: Event) => {
    setSelectedEvent(evento)
    setShowEventModal(true)
  }

  const resetEventForm = () => {
    setNewEvent({
      title: "",
      description: "",
      date: "",
      location: "",
      type: "conferencia",
      organizer: "",
    })
    setEditingEvent(null)
    setIsEventDialogOpen(false)
  }

  const resetCollabForm = () => {
    setNewCollab({
      title: "",
      institution: "",
      description: "",
      status: "activa",
      startDate: "",
      endDate: "",
      contact: "",
      email: "",
    })
    setEditingCollab(null)
    setIsCollabDialogOpen(false)
  }

  return (
    <ProtectedRoute requiredSection="divulgacion">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Divulgación y Visibilidad</h1>
            <p className="text-muted-foreground">
              Plataforma pública para mostrar trabajos de todos los semilleros y atraer colaboraciones
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Vista pública:</span> Aquí se muestran todos los proyectos y trabajos de todos
            los semilleros de investigación.
            {user?.role === "visitante" && (
              <span className="text-muted-foreground ml-2">(Solo puedes ver detalles, no descargar documentos)</span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos, autores, semilleros..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Métricas de visibilidad */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicaciones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">De todos los semilleros</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">Programados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboraciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collaborations.length}</div>
              <p className="text-xs text-muted-foreground">Instituciones aliadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(projects.flatMap((p) => p.team)).size}</div>
              <p className="text-xs text-muted-foreground">Investigadores activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="publicaciones" className="space-y-4">
          <TabsList>
            <TabsTrigger value="publicaciones">Publicaciones</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="colaboraciones">Colaboraciones</TabsTrigger>
          </TabsList>

          <TabsContent value="publicaciones" className="space-y-4">
            <div className="grid gap-4">
              {proyectosFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No se encontraron proyectos que coincidan con la búsqueda.</p>
                  </CardContent>
                </Card>
              ) : (
                proyectosFiltrados.map((proyecto) => (
                  <Card key={proyecto.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg leading-tight">{proyecto.title}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {proyecto.team.map((autor, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {autor}
                              </Badge>
                            ))}
                          </div>
                          <CardDescription>
                            {new Date(proyecto.startDate).toLocaleDateString()} • Proyecto de Investigación
                            <Badge variant="secondary" className="ml-2">
                              {proyecto.semilleroName}
                            </Badge>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge variant={getEstadoColor(proyecto.status)}>{getEstadoLabel(proyecto.status)}</Badge>
                          {!isVisitor && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(proyecto)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                {canDownload() && proyecto.documentName && (
                                  <DropdownMenuItem onClick={() => handleDownload(proyecto)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar Documento
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Share className="h-4 w-4 mr-2" />
                                  Compartir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {isVisitor && (
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(proyecto)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{proyecto.description}</p>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Progreso</p>
                          <p className="text-sm text-muted-foreground">{proyecto.progress}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Presupuesto</p>
                          <p className="text-sm text-muted-foreground">${proyecto.budget.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Equipo</p>
                          <p className="text-sm text-muted-foreground">{proyecto.team.length} miembros</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="eventos" className="space-y-4">
            {canManageContent && (
              <div className="flex justify-end space-x-2 mb-4">
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingEvent(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
                      <DialogDescription>
                        {editingEvent
                          ? "Modifica la información del evento."
                          : "Crea un nuevo evento para divulgación."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="event-title">Título del evento</Label>
                        <Input
                          id="event-title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Ej: Congreso Internacional de IA"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="event-description">Descripción</Label>
                        <Textarea
                          id="event-description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Descripción del evento"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="event-date">Fecha</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="event-type">Tipo</Label>
                          <Select
                            value={newEvent.type}
                            onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conferencia">Conferencia</SelectItem>
                              <SelectItem value="taller">Taller</SelectItem>
                              <SelectItem value="seminario">Seminario</SelectItem>
                              <SelectItem value="congreso">Congreso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="event-location">Ubicación</Label>
                        <Input
                          id="event-location"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder="Ej: Auditorio Principal"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="event-organizer">Organizador</Label>
                        <Input
                          id="event-organizer"
                          value={newEvent.organizer}
                          onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                          placeholder="Nombre del organizador"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={resetEventForm}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateEvent}>{editingEvent ? "Actualizar" : "Crear"} Evento</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            <div className="grid gap-4">
              {events.map((evento) => (
                <Card key={evento.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{evento.title}</CardTitle>
                        <CardDescription>
                          {new Date(evento.date).toLocaleDateString()} • {evento.location}
                          <Badge variant="outline" className="ml-2">
                            {evento.type}
                          </Badge>
                        </CardDescription>
                      </div>
                      {canManageContent && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditEvent(evento)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteEvent(evento.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{evento.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">Organizador:</span> {evento.organizer}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleViewEventDetails(evento)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colaboraciones" className="space-y-4">
            {canManageContent && (
              <div className="flex justify-end space-x-2 mb-4">
                <Dialog open={isCollabDialogOpen} onOpenChange={setIsCollabDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCollab(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Colaboración
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{editingCollab ? "Editar Colaboración" : "Crear Nueva Colaboración"}</DialogTitle>
                      <DialogDescription>
                        {editingCollab
                          ? "Modifica la información de la colaboración."
                          : "Crea una nueva colaboración institucional."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="collab-title">Título</Label>
                        <Input
                          id="collab-title"
                          value={newCollab.title}
                          onChange={(e) => setNewCollab({ ...newCollab, title: e.target.value })}
                          placeholder="Ej: Proyecto Conjunto de Investigación"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="collab-institution">Institución</Label>
                        <Input
                          id="collab-institution"
                          value={newCollab.institution}
                          onChange={(e) => setNewCollab({ ...newCollab, institution: e.target.value })}
                          placeholder="Ej: Universidad Nacional"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="collab-description">Descripción</Label>
                        <Textarea
                          id="collab-description"
                          value={newCollab.description}
                          onChange={(e) => setNewCollab({ ...newCollab, description: e.target.value })}
                          placeholder="Descripción de la colaboración"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="collab-start">Fecha de inicio</Label>
                          <Input
                            id="collab-start"
                            type="date"
                            value={newCollab.startDate}
                            onChange={(e) => setNewCollab({ ...newCollab, startDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="collab-end">Fecha de fin (opcional)</Label>
                          <Input
                            id="collab-end"
                            type="date"
                            value={newCollab.endDate}
                            onChange={(e) => setNewCollab({ ...newCollab, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="collab-contact">Contacto</Label>
                          <Input
                            id="collab-contact"
                            value={newCollab.contact}
                            onChange={(e) => setNewCollab({ ...newCollab, contact: e.target.value })}
                            placeholder="Nombre del contacto"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="collab-email">Email</Label>
                          <Input
                            id="collab-email"
                            type="email"
                            value={newCollab.email}
                            onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                            placeholder="contacto@institucion.edu"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="collab-status">Estado</Label>
                        <Select
                          value={newCollab.status}
                          onValueChange={(value: any) => setNewCollab({ ...newCollab, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activa">Activa</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="finalizada">Finalizada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={resetCollabForm}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateCollaboration}>
                        {editingCollab ? "Actualizar" : "Crear"} Colaboración
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            <div className="grid gap-4">
              {collaborations.map((colaboracion) => (
                <Card key={colaboracion.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{colaboracion.title}</CardTitle>
                        <CardDescription>
                          {colaboracion.institution} • {new Date(colaboracion.startDate).toLocaleDateString()}
                          {colaboracion.endDate && ` - ${new Date(colaboracion.endDate).toLocaleDateString()}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={colaboracion.status === "activa" ? "default" : "secondary"}>
                          {colaboracion.status}
                        </Badge>
                        {canManageContent && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCollaboration(colaboracion)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCollaboration(colaboracion.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{colaboracion.description}</p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCollaborationDetails(colaboracion)}>
                        Ver Detalles
                      </Button>
                      {!isVisitor && (
                        <Button size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para detalles de colaboración */}
      {showCollaborationModal && selectedCollaboration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedCollaboration.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCollaborationModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-600 dark:text-gray-300">Institución</h4>
                <p>{selectedCollaboration.institution}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-600 dark:text-gray-300">Descripción</h4>
                <p>{selectedCollaboration.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-600 dark:text-gray-300">Estado</h4>
                <Badge variant={selectedCollaboration.status === "activa" ? "default" : "secondary"}>
                  {selectedCollaboration.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-600 dark:text-gray-300">Contacto</h4>
                <p>
                  {selectedCollaboration.contact} - {selectedCollaboration.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para detalles de evento */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Detalles completos del evento</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Fecha</h4>
                  <p>
                    {new Date(selectedEvent.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Tipo</h4>
                  <Badge variant="outline">{selectedEvent.type}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Ubicación</h4>
                <p>{selectedEvent.location}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Organizador</h4>
                <p>{selectedEvent.organizer}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Descripción</h4>
                <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Información de contacto</h4>
                <p className="text-sm text-muted-foreground">
                  Para más información sobre este evento, contacta al organizador: {selectedEvent.organizer}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para detalles del proyecto */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedProject?.title}</DialogTitle>
            <DialogDescription>Detalles completos del proyecto de investigación</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Semillero</h4>
                  <Badge variant="secondary">{selectedProject.semilleroName}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Estado</h4>
                  <Badge variant={getEstadoColor(selectedProject.status)}>
                    {getEstadoLabel(selectedProject.status)}
                  </Badge>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción</h4>
                <p className="text-sm leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Fechas y progreso */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Fecha de inicio</h4>
                  <p className="text-sm">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Fecha de fin</h4>
                  <p className="text-sm">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Progreso</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Presupuesto */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Presupuesto</h4>
                <p className="text-lg font-semibold">${selectedProject.budget.toLocaleString()}</p>
              </div>

              {/* Equipo de investigación */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Equipo de investigación</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Documento */}
              {selectedProject.documentName && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Documento del proyecto</p>
                        <p className="text-xs text-muted-foreground">{selectedProject.documentName}</p>
                      </div>
                    </div>
                    {canDownload() && (
                      <Button size="sm" onClick={() => handleDownload(selectedProject)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Información del proyecto</h4>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <p>• Este proyecto forma parte del semillero de investigación {selectedProject.semilleroName}</p>
                  <p>• Cuenta con un equipo de {selectedProject.team.length} investigadores</p>
                  <p>
                    • Duración estimada:{" "}
                    {Math.ceil(
                      (new Date(selectedProject.endDate).getTime() - new Date(selectedProject.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    días
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectModal(false)}>
              Cerrar
            </Button>
            {selectedProject && canDownload() && selectedProject.documentName && (
              <Button onClick={() => handleDownload(selectedProject)}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Documento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { MessageSquare, Calendar, Bell, Send, Clock, Reply, Video } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { dataService, type Message, type Meeting } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

export default function ComunicacionPage() {
  const { user, selectedSemillero, semilleros } = useAuth()
  const { toast } = useToast()
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])

  const [newMessage, setNewMessage] = useState({
    mensaje: "",
    tipo: "general" as const,
    esGeneral: true,
    semilleroId: "",
  })

  const [newMeeting, setNewMeeting] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    esGeneral: true,
    semilleroId: "",
    enlaceVideo: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allMessages = dataService.getMessages()
    const allMeetings = dataService.getMeetings()
    setMessages(allMessages)
    setMeetings(allMeetings)
  }

  const getMensajesFiltrados = (): Message[] => {
    if (user?.role === "administrador") {
      return messages // Admin can see all messages
    }

    if (!selectedSemillero) {
      return messages.filter((m) => m.isGeneral) // Only general messages if no semillero selected
    }

    return messages.filter((m) => m.isGeneral || m.semilleroId === selectedSemillero.id)
  }

  const getReunionesFiltradas = (): Meeting[] => {
    if (user?.role === "administrador") {
      return meetings // Admin can see all meetings
    }

    if (!selectedSemillero) {
      return meetings.filter((r) => r.isGeneral) // Only general meetings if no semillero selected
    }

    return meetings.filter((r) => r.isGeneral || r.semilleroId === selectedSemillero.id)
  }

  const mensajes = getMensajesFiltrados()
  const reuniones = getReunionesFiltradas()

  const handleCreateMessage = async () => {
    if (!newMessage.mensaje.trim() || !user) {
      toast({
        title: "Error",
        description: "El mensaje no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    const semillero = semilleros.find((s) => s.id === newMessage.semilleroId)

    try {
      const messageData = dataService.saveMessage({
        title: `Mensaje de ${user.name}`,
        content: newMessage.mensaje,
        author: user.name,
        authorId: user.id,
        semilleroId: newMessage.esGeneral ? undefined : newMessage.semilleroId,
        isGeneral: newMessage.esGeneral,
      })

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado exitosamente",
      })

      loadData()
      resetMessageForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    }
  }

  const handleCreateMeeting = async () => {
    if (!newMeeting.titulo.trim() || !newMeeting.fecha || !newMeeting.hora || !user) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    try {
      const meetingData = dataService.saveMeeting({
        title: newMeeting.titulo,
        description: newMeeting.descripcion,
        date: newMeeting.fecha,
        time: newMeeting.hora,
        location: newMeeting.enlaceVideo || "Por definir",
        semilleroId: newMeeting.esGeneral ? undefined : newMeeting.semilleroId,
        isGeneral: newMeeting.esGeneral,
        organizer: user.name,
        organizerId: user.id,
        attendees: [user.name],
      })

      toast({
        title: "Reunión programada",
        description: `La reunión "${newMeeting.titulo}" ha sido programada exitosamente`,
      })

      loadData()
      resetMeetingForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo programar la reunión",
        variant: "destructive",
      })
    }
  }

  const handleReply = async (messageId: string) => {
    if (!replyText.trim() || !user) {
      toast({
        title: "Error",
        description: "La respuesta no puede estar vacía",
        variant: "destructive",
      })
      return
    }

    try {
      const success = dataService.addReply(messageId, {
        content: replyText,
        author: user.name,
        authorId: user.id,
      })

      if (success) {
        toast({
          title: "Respuesta enviada",
          description: "Tu respuesta ha sido enviada exitosamente",
        })
        loadData()
        setReplyingTo(null)
        setReplyText("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive",
      })
    }
  }

  const resetMessageForm = () => {
    setNewMessage({
      mensaje: "",
      tipo: "general",
      esGeneral: true,
      semilleroId: "",
    })
    setIsMessageDialogOpen(false)
  }

  const resetMeetingForm = () => {
    setNewMeeting({
      titulo: "",
      descripcion: "",
      fecha: "",
      hora: "",
      esGeneral: true,
      semilleroId: "",
      enlaceVideo: "",
    })
    setIsMeetingDialogOpen(false)
  }

  return (
    <ProtectedRoute requiredSection="comunicacion">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comunicación y Colaboración</h1>
            <p className="text-muted-foreground">Plataforma de comunicación interna y colaboración entre miembros</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nueva Reunión
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Programar Nueva Reunión</DialogTitle>
                  <DialogDescription>Crea una nueva reunión para tu semillero o general para todos.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título de la reunión</Label>
                    <Input
                      id="titulo"
                      value={newMeeting.titulo}
                      onChange={(e) => setNewMeeting({ ...newMeeting, titulo: e.target.value })}
                      placeholder="Ej: Revisión mensual del proyecto"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newMeeting.descripcion}
                      onChange={(e) => setNewMeeting({ ...newMeeting, descripcion: e.target.value })}
                      placeholder="Agenda y objetivos de la reunión"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={newMeeting.fecha}
                        onChange={(e) => setNewMeeting({ ...newMeeting, fecha: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hora">Hora</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={newMeeting.hora}
                        onChange={(e) => setNewMeeting({ ...newMeeting, hora: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="enlace">Enlace de video (opcional)</Label>
                    <Input
                      id="enlace"
                      value={newMeeting.enlaceVideo}
                      onChange={(e) => setNewMeeting({ ...newMeeting, enlaceVideo: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="esGeneral"
                      checked={newMeeting.esGeneral}
                      onChange={(e) => setNewMeeting({ ...newMeeting, esGeneral: e.target.checked })}
                    />
                    <Label htmlFor="esGeneral">Reunión general (todos los semilleros)</Label>
                  </div>
                  {!newMeeting.esGeneral && (
                    <div className="grid gap-2">
                      <Label htmlFor="semillero">Semillero</Label>
                      <Select
                        value={newMeeting.semilleroId}
                        onValueChange={(value) => setNewMeeting({ ...newMeeting, semilleroId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar semillero" />
                        </SelectTrigger>
                        <SelectContent>
                          {semilleros.map((semillero) => (
                            <SelectItem key={semillero.id} value={semillero.id}>
                              {semillero.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateMeeting}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Programar Reunión
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nuevo Mensaje
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Enviar Nuevo Mensaje</DialogTitle>
                  <DialogDescription>Comparte información con tu semillero o con todos los miembros.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mensaje">Mensaje</Label>
                    <Textarea
                      id="mensaje"
                      value={newMessage.mensaje}
                      onChange={(e) => setNewMessage({ ...newMessage, mensaje: e.target.value })}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="esGeneralMsg"
                      checked={newMessage.esGeneral}
                      onChange={(e) => setNewMessage({ ...newMessage, esGeneral: e.target.checked })}
                    />
                    <Label htmlFor="esGeneralMsg">Mensaje general (todos los semilleros)</Label>
                  </div>
                  {!newMessage.esGeneral && (
                    <div className="grid gap-2">
                      <Label htmlFor="semilleroMsg">Semillero</Label>
                      <Select
                        value={newMessage.semilleroId}
                        onValueChange={(value) => setNewMessage({ ...newMessage, semilleroId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar semillero" />
                        </SelectTrigger>
                        <SelectContent>
                          {semilleros.map((semillero) => (
                            <SelectItem key={semillero.id} value={semillero.id}>
                              {semillero.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedSemillero && user?.role !== "administrador" && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Semillero actual:</span> {selectedSemillero.name}
              <span className="text-muted-foreground ml-2">(Viendo mensajes generales y de este semillero)</span>
            </p>
          </div>
        )}

        {/* Estadísticas de comunicación */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mensajes.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSemillero ? `En ${selectedSemillero.name}` : "Total general"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reuniones Programadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reuniones.length}</div>
              <p className="text-xs text-muted-foreground">Próximas reuniones</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respuestas</CardTitle>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mensajes.reduce((sum, m) => sum + m.replies.length, 0)}</div>
              <p className="text-xs text-muted-foreground">Total de respuestas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set([...mensajes.map((m) => m.authorId), ...reuniones.map((r) => r.organizerId)]).size}
              </div>
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="mensajes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mensajes">Mensajes ({mensajes.length})</TabsTrigger>
            <TabsTrigger value="reuniones">Reuniones ({reuniones.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="mensajes" className="space-y-4">
            {mensajes.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay mensajes disponibles.</p>
                </CardContent>
              </Card>
            ) : (
              mensajes.map((mensaje) => (
                <Card key={mensaje.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{mensaje.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{mensaje.author}</h4>
                            <Badge variant={mensaje.isGeneral ? "default" : "secondary"}>
                              {mensaje.isGeneral ? "General" : "Semillero"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(mensaje.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{mensaje.content}</p>

                    {/* Respuestas */}
                    {mensaje.replies.length > 0 && (
                      <div className="space-y-3 border-l-2 border-muted pl-4">
                        <h5 className="text-sm font-medium">Respuestas ({mensaje.replies.length})</h5>
                        {mensaje.replies.map((respuesta) => (
                          <div key={respuesta.id} className="flex items-start space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{respuesta.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{respuesta.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(respuesta.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{respuesta.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulario de respuesta */}
                    {replyingTo === mensaje.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Escribe tu respuesta..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleReply(mensaje.id)}>
                            <Send className="h-3 w-3 mr-1" />
                            Responder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setReplyingTo(mensaje.id)}>
                        <Reply className="h-3 w-3 mr-1" />
                        Responder
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reuniones" className="space-y-4">
            {reuniones.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay reuniones programadas.</p>
                </CardContent>
              </Card>
            ) : (
              reuniones.map((reunion) => (
                <Card key={reunion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{reunion.title}</CardTitle>
                          <Badge variant={reunion.isGeneral ? "default" : "secondary"}>
                            {reunion.isGeneral ? "General" : "Semillero"}
                          </Badge>
                        </div>
                        <CardDescription>{reunion.description}</CardDescription>
                      </div>
                      {reunion.location.includes("http") && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={reunion.location} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Unirse
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium">Fecha y hora</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reunion.date).toLocaleDateString()} a las {reunion.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Organizador</p>
                        <p className="text-sm text-muted-foreground">{reunion.organizer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Participantes</p>
                        <p className="text-sm text-muted-foreground">{reunion.attendees.length} confirmados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

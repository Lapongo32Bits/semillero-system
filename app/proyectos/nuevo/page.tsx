"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ArrowLeft, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { dataService } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

export default function NuevoProyectoPage() {
  const { user, selectedSemillero, canCreateProject } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [investigadores, setInvestigadores] = useState<string[]>([])
  const [nuevoInvestigador, setNuevoInvestigador] = useState("")
  const [documentos, setDocumentos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    estado: "planificacion",
    fechaInicio: "",
    fechaFin: "",
    presupuesto: "",
    progreso: "0",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!canCreateProject()) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para crear proyectos",
        variant: "destructive",
      })
      router.push("/proyectos")
      return
    }

    setIsLoading(false)
  }, [user, canCreateProject, router, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddInvestigador = () => {
    if (nuevoInvestigador.trim() && !investigadores.includes(nuevoInvestigador.trim())) {
      setInvestigadores([...investigadores, nuevoInvestigador.trim()])
      setNuevoInvestigador("")
    }
  }

  const handleRemoveInvestigador = (investigador: string) => {
    setInvestigadores(investigadores.filter((i) => i !== investigador))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setDocumentos([...documentos, ...files])
  }

  const handleRemoveDocument = (index: number) => {
    setDocumentos(documentos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no válido",
        variant: "destructive",
      })
      return
    }

    const semilleroToUse = selectedSemillero || {
      id: user.semilleroId || "1",
      name: user.semilleroName || "Semillero por defecto",
    }

    setIsSubmitting(true)

    try {
      const newProject = dataService.saveProject({
        title: formData.titulo,
        description: formData.descripcion,
        status: formData.estado as "planificacion" | "en-progreso" | "completado" | "pausado",
        progress: Number.parseInt(formData.progreso),
        budget: Number.parseFloat(formData.presupuesto),
        startDate: formData.fechaInicio,
        endDate: formData.fechaFin,
        semilleroId: semilleroToUse.id,
        semilleroName: semilleroToUse.name,
        team: investigadores.length > 0 ? investigadores : [user.name],
        document: documentos.length > 0 ? documentos[0] : null,
        documentName: documentos.length > 0 ? documentos[0].name : undefined,
        createdBy: user.id,
      })

      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente",
      })

      router.push("/proyectos")
    } catch (error) {
      console.error("Error al crear proyecto:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acceso Restringido</h1>
          <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Proyecto</h1>
          <p className="text-muted-foreground">Crear un nuevo proyecto de investigación</p>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Semillero:</span>{" "}
          {selectedSemillero?.name || user.semilleroName || "Semillero por defecto"}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Usuario:</span> {user.name} ({user.role})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos principales del proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título del Proyecto</Label>
                <Input
                  id="titulo"
                  placeholder="Ingrese el título del proyecto"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describa los objetivos y alcance del proyecto"
                  className="min-h-[100px]"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleInputChange("categoria", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="ambiental">Ambiental</SelectItem>
                      <SelectItem value="finanzas">Finanzas</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado Inicial</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planificacion">Planificación</SelectItem>
                      <SelectItem value="en-progreso">En Progreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cronograma y presupuesto */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma y Presupuesto</CardTitle>
              <CardDescription>Fechas y recursos del proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha de Finalización</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presupuesto">Presupuesto (USD)</Label>
                <Input
                  id="presupuesto"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="100"
                  value={formData.presupuesto}
                  onChange={(e) => handleInputChange("presupuesto", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progreso">Progreso Inicial (%)</Label>
                <Input
                  id="progreso"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={formData.progreso}
                  onChange={(e) => handleInputChange("progreso", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipo de investigación */}
        <Card>
          <CardHeader>
            <CardTitle>Equipo de Investigación</CardTitle>
            <CardDescription>Agregar investigadores al proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nombre del investigador"
                value={nuevoInvestigador}
                onChange={(e) => setNuevoInvestigador(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInvestigador())}
              />
              <Button type="button" onClick={handleAddInvestigador}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {investigadores.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {investigadores.map((investigador, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {investigador}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveInvestigador(investigador)} />
                  </Badge>
                ))}
              </div>
            )}

            {investigadores.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Si no agregas investigadores, serás agregado automáticamente como miembro del equipo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos del Proyecto</CardTitle>
            <CardDescription>Subir documentos relacionados con el proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">
                  Seleccionar Archivos
                </Button>
              </Label>
            </div>

            {documentos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
                {documentos.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{doc.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDocument(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Proyecto"}
          </Button>
        </div>
      </form>
    </div>
  )
}

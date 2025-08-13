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
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function EditarProyectoPage({ params }: { params: { id: string } }) {
  const { user, selectedSemillero } = useAuth()
  const router = useRouter()
  const [investigadores, setInvestigadores] = useState<string[]>([])
  const [nuevoInvestigador, setNuevoInvestigador] = useState("")
  const [documentos, setDocumentos] = useState<File[]>([])

  // Mock data - en una app real vendría de una API
  const proyectoExistente = {
    id: Number.parseInt(params.id),
    titulo: "Inteligencia Artificial en Educación Superior",
    descripcion: "Desarrollo de herramientas de IA para mejorar el proceso de enseñanza-aprendizaje",
    categoria: "tecnologia",
    estado: "en-progreso",
    fechaInicio: "2024-01-15",
    fechaFin: "2024-12-15",
    presupuesto: 25000,
    progreso: 75,
    investigadores: ["Dr. García", "Ing. López", "Est. Martínez"],
  }

  useEffect(() => {
    setInvestigadores(proyectoExistente.investigadores)
  }, [])

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Aquí iría la lógica para actualizar el proyecto
    console.log("Proyecto actualizado")
    router.push(`/proyectos/${params.id}`)
  }

  return (
    <ProtectedRoute requiredSection="proyectos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Proyecto</h1>
            <p className="text-muted-foreground">Modificar información del proyecto de investigación</p>
          </div>
        </div>

        {selectedSemillero && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Semillero:</span> {selectedSemillero.name}
            </p>
          </div>
        )}

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
                    defaultValue={proyectoExistente.titulo}
                    placeholder="Ingrese el título del proyecto"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    defaultValue={proyectoExistente.descripcion}
                    placeholder="Describa los objetivos y alcance del proyecto"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select defaultValue={proyectoExistente.categoria} required>
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
                    <Label htmlFor="estado">Estado</Label>
                    <Select defaultValue={proyectoExistente.estado}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planificacion">Planificación</SelectItem>
                        <SelectItem value="en-progreso">En Progreso</SelectItem>
                        <SelectItem value="evaluacion">Evaluación</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
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
                    <Input id="fechaInicio" type="date" defaultValue={proyectoExistente.fechaInicio} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha de Finalización</Label>
                    <Input id="fechaFin" type="date" defaultValue={proyectoExistente.fechaFin} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presupuesto">Presupuesto (USD)</Label>
                  <Input
                    id="presupuesto"
                    type="number"
                    defaultValue={proyectoExistente.presupuesto}
                    placeholder="0"
                    min="0"
                    step="100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progreso">Progreso (%)</Label>
                  <Input
                    id="progreso"
                    type="number"
                    defaultValue={proyectoExistente.progreso}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipo de investigación */}
          <Card>
            <CardHeader>
              <CardTitle>Equipo de Investigación</CardTitle>
              <CardDescription>Agregar o modificar investigadores del proyecto</CardDescription>
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
            </CardContent>
          </Card>

          {/* Documentos adicionales */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Adicionales</CardTitle>
              <CardDescription>Subir nuevos documentos al proyecto</CardDescription>
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
                  <h4 className="text-sm font-medium">Nuevos archivos:</h4>
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
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}

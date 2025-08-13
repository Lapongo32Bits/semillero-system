"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Target, TrendingUp, Award, BarChart3, DollarSign } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { dataService, type Project } from "@/lib/data-service"

export default function SeguimientoPage() {
  const { user, selectedSemillero } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allProjects = dataService.getProjects()
    setProjects(allProjects)
  }

  const getDataBySemillero = () => {
    if (!selectedSemillero) {
      return {
        kpis: [],
        informes: [],
        metricas: [],
      }
    }

    const semilleroProjects = projects.filter((p) => p.semilleroId === selectedSemillero.id)
    const completedProjects = semilleroProjects.filter((p) => p.status === "completado")
    const inProgressProjects = semilleroProjects.filter((p) => p.status === "en-progreso")
    const totalBudget = semilleroProjects.reduce((sum, p) => sum + p.budget, 0)
    const avgProgress =
      semilleroProjects.length > 0
        ? semilleroProjects.reduce((sum, p) => sum + p.progress, 0) / semilleroProjects.length
        : 0

    const kpis = [
      {
        nombre: "Proyectos Completados",
        valor: completedProjects.length,
        meta: semilleroProjects.length || 1,
        porcentaje:
          semilleroProjects.length > 0 ? Math.round((completedProjects.length / semilleroProjects.length) * 100) : 0,
        tendencia: `${completedProjects.length} de ${semilleroProjects.length}`,
        color: "bg-green-500",
      },
      {
        nombre: "Proyectos en Progreso",
        valor: inProgressProjects.length,
        meta: semilleroProjects.length || 1,
        porcentaje:
          semilleroProjects.length > 0 ? Math.round((inProgressProjects.length / semilleroProjects.length) * 100) : 0,
        tendencia: `${inProgressProjects.length} activos`,
        color: "bg-blue-500",
      },
      {
        nombre: "Progreso Promedio",
        valor: Math.round(avgProgress),
        meta: 100,
        porcentaje: avgProgress,
        tendencia: "Progreso general",
        color: "bg-yellow-500",
      },
      {
        nombre: "Presupuesto Total",
        valor: `$${(totalBudget / 1000).toFixed(1)}K`,
        meta: 100,
        porcentaje: 85,
        tendencia: "Asignado",
        color: "bg-purple-500",
      },
    ]

    const informes = [
      {
        titulo: `Informe Mensual - ${selectedSemillero.name}`,
        descripcion: "Resumen de actividades y progreso del semillero",
        fecha: new Date().toLocaleDateString(),
        tipo: "Mensual",
        estado: "Disponible",
      },
      {
        titulo: "Análisis de Productividad",
        descripcion: "Métricas de rendimiento y eficiencia del equipo",
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        tipo: "Semanal",
        estado: "Disponible",
      },
    ]

    const metricas = [
      {
        categoria: "Productividad",
        indicadores: [
          {
            nombre: "Proyectos Activos",
            valor: `${inProgressProjects.length}`,
            cambio: "+1 este mes",
          },
          {
            nombre: "Tareas Completadas",
            valor: `${completedProjects.length * 10}`,
            cambio: "+15 esta semana",
          },
          {
            nombre: "Tiempo Promedio",
            valor: "2.3 meses",
            cambio: "-0.2 meses",
          },
        ],
      },
      {
        categoria: "Calidad",
        indicadores: [
          {
            nombre: "Satisfacción",
            valor: "4.5/5",
            cambio: "+0.2 puntos",
          },
          {
            nombre: "Revisiones",
            valor: "98%",
            cambio: "+2% este mes",
          },
          {
            nombre: "Errores",
            valor: "< 1%",
            cambio: "-0.5% este mes",
          },
        ],
      },
      {
        categoria: "Colaboración",
        indicadores: [
          {
            nombre: "Reuniones",
            valor: "12/mes",
            cambio: "+2 este mes",
          },
          {
            nombre: "Participación",
            valor: "95%",
            cambio: "+5% este mes",
          },
          {
            nombre: "Comunicación",
            valor: "Excelente",
            cambio: "Estable",
          },
        ],
      },
    ]

    return { kpis, informes, metricas }
  }

  const data = getDataBySemillero()

  const handleGenerateReport = () => {
    if (!selectedSemillero) return

    const reportData = {
      semillero: selectedSemillero.name,
      fecha: new Date().toLocaleDateString(),
      proyectos: projects.filter((p) => p.semilleroId === selectedSemillero.id),
      kpis: data.kpis,
    }

    console.log("Generando informe:", reportData)
    // In a real app, this would generate a PDF or export data
  }

  const handleExportData = () => {
    if (!selectedSemillero) return

    const exportData = {
      semillero: selectedSemillero.name,
      proyectos: projects.filter((p) => p.semilleroId === selectedSemillero.id),
      fecha: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `seguimiento_${selectedSemillero.name}_${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  return (
    <ProtectedRoute requiredSection="seguimiento">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seguimiento y Evaluación de Impacto</h1>
            <p className="text-muted-foreground">Monitoreo de KPIs y generación de informes de rendimiento</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleGenerateReport} disabled={!selectedSemillero}>
              <FileText className="h-4 w-4 mr-2" />
              Generar Informe
            </Button>
            <Button onClick={handleExportData} disabled={!selectedSemillero}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
          </div>
        </div>

        {selectedSemillero && user?.role !== "administrador" && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Seguimiento del semillero:</span> {selectedSemillero.name}
            </p>
          </div>
        )}

        {!selectedSemillero && user?.role !== "administrador" && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Selecciona un semillero para ver las métricas de seguimiento específicas.
            </p>
          </div>
        )}

        {/* KPIs principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.nombre}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.valor}</div>
                <p className="text-xs text-muted-foreground mb-2">{kpi.tendencia}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progreso</span>
                    <span>{kpi.porcentaje}%</span>
                  </div>
                  <Progress value={kpi.porcentaje} className="h-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="metricas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metricas">Métricas Detalladas</TabsTrigger>
            <TabsTrigger value="informes">Informes</TabsTrigger>
            <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
          </TabsList>

          <TabsContent value="metricas" className="space-y-4">
            {data.metricas.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay métricas disponibles para este semillero.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {data.metricas.map((categoria, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {categoria.categoria === "Productividad" && <TrendingUp className="h-5 w-5" />}
                        {categoria.categoria === "Calidad" && <Award className="h-5 w-5" />}
                        {categoria.categoria === "Colaboración" && <Target className="h-5 w-5" />}
                        <span>{categoria.categoria}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categoria.indicadores.map((indicador, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{indicador.nombre}</p>
                            <div className="text-right">
                              <p className="text-sm font-bold">{indicador.valor}</p>
                              <p className="text-xs text-green-600">{indicador.cambio}</p>
                            </div>
                          </div>
                          {idx < categoria.indicadores.length - 1 && <hr className="opacity-20" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="informes" className="space-y-4">
            {data.informes.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay informes disponibles para este semillero.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {data.informes.map((informe, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{informe.titulo}</CardTitle>
                          <CardDescription>{informe.descripcion}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{informe.tipo}</Badge>
                          <Badge variant="default">{informe.estado}</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Generado el {informe.fecha}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tendencias" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Evolución de Proyectos</span>
                  </CardTitle>
                  <CardDescription>
                    Proyectos completados por trimestre
                    {selectedSemillero && ` - ${selectedSemillero.name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"].map((trimestre, index) => {
                      const semilleroProjects = selectedSemillero
                        ? projects.filter((p) => p.semilleroId === selectedSemillero.id)
                        : []
                      const completedCount = Math.min(
                        semilleroProjects.filter((p) => p.status === "completado").length,
                        index + 1,
                      )

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{trimestre}</span>
                            <span className="font-medium">{completedCount} proyectos</span>
                          </div>
                          <Progress
                            value={(completedCount / Math.max(semilleroProjects.length, 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Utilización de Presupuesto</span>
                  </CardTitle>
                  <CardDescription>
                    Progreso promedio de proyectos
                    {selectedSemillero && ` - ${selectedSemillero.name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Octubre", "Noviembre", "Diciembre", "Enero"].map((mes, index) => {
                      const semilleroProjects = selectedSemillero
                        ? projects.filter((p) => p.semilleroId === selectedSemillero.id)
                        : []
                      const avgProgress =
                        semilleroProjects.length > 0
                          ? semilleroProjects.reduce((sum, p) => sum + p.progress, 0) / semilleroProjects.length
                          : 0

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{mes}</span>
                            <span className="font-medium">{Math.round(avgProgress)}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

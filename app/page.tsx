"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FolderOpen, TrendingUp, MessageSquare, Award, Calendar, DollarSign, Target } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { user, selectedSemillero } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === "visitante") {
      router.push("/divulgacion")
    }
  }, [user, router])

  if (user?.role === "visitante") {
    return null
  }

  const getDataBySemillero = () => {
    if (!selectedSemillero) {
      return {
        proyectosActivos: 0,
        investigadores: 0,
        presupuestoUtilizado: 0,
        publicaciones: 0,
        proyectosRecientes: [],
        actividades: [],
      }
    }

    // Mock data based on semillero
    const dataBySemill = {
      "1": {
        proyectosActivos: 8,
        investigadores: 12,
        presupuestoUtilizado: 75,
        publicaciones: 6,
        proyectosRecientes: [
          {
            title: "Inteligencia Artificial en Educación Superior",
            status: "En progreso",
            progress: 75,
            team: "Dr. García, Ing. López, Est. Martínez",
          },
          {
            title: "Machine Learning para Análisis Educativo",
            status: "Planificación",
            progress: 30,
            team: "Dr. García, Est. Rodríguez",
          },
          {
            title: "Chatbots Educativos Inteligentes",
            status: "Evaluación",
            progress: 85,
            team: "Ing. López, Est. Gómez",
          },
        ],
        actividades: [
          {
            action: "Nuevo proyecto de IA registrado",
            user: "Dr. García",
            time: "Hace 2 horas",
            icon: FolderOpen,
          },
          {
            action: "Recurso GPU asignado",
            user: "Dr. García",
            time: "Hace 4 horas",
            icon: Target,
          },
          {
            action: "Reunión de seguimiento IA",
            user: "Dr. García",
            time: "Hace 1 día",
            icon: Calendar,
          },
        ],
      },
      "2": {
        proyectosActivos: 5,
        investigadores: 8,
        presupuestoUtilizado: 60,
        publicaciones: 4,
        proyectosRecientes: [
          {
            title: "Sostenibilidad Ambiental en Espacios Urbanos",
            status: "En progreso",
            progress: 65,
            team: "Dra. Martínez, Arq. Rodríguez",
          },
          {
            title: "Análisis de Calidad del Aire",
            status: "Planificación",
            progress: 20,
            team: "Dra. Martínez, Est. López",
          },
        ],
        actividades: [
          {
            action: "Estudio ambiental completado",
            user: "Dra. Martínez",
            time: "Hace 3 horas",
            icon: Award,
          },
          {
            action: "Equipos de medición asignados",
            user: "Dra. Martínez",
            time: "Hace 1 día",
            icon: Target,
          },
        ],
      },
      "3": {
        proyectosActivos: 6,
        investigadores: 10,
        presupuestoUtilizado: 80,
        publicaciones: 5,
        proyectosRecientes: [
          {
            title: "Blockchain en Sistemas Financieros",
            status: "Evaluación",
            progress: 90,
            team: "Ing. Pérez, Eco. Silva, Dr. Ramírez",
          },
          {
            title: "Criptomonedas y Regulación",
            status: "En progreso",
            progress: 55,
            team: "Ing. Pérez, Est. Torres",
          },
        ],
        actividades: [
          {
            action: "Prototipo blockchain desplegado",
            user: "Ing. Pérez",
            time: "Hace 1 hora",
            icon: FolderOpen,
          },
          {
            action: "Análisis financiero actualizado",
            user: "Eco. Silva",
            time: "Hace 5 horas",
            icon: TrendingUp,
          },
        ],
      },
      "4": {
        proyectosActivos: 9,
        investigadores: 15,
        presupuestoUtilizado: 70,
        publicaciones: 8,
        proyectosRecientes: [
          {
            title: "Biotecnología Médica Avanzada",
            status: "En progreso",
            progress: 60,
            team: "Dr. Silva, Dra. Torres, Est. Morales",
          },
          {
            title: "Terapias Génicas Innovadoras",
            status: "Planificación",
            progress: 25,
            team: "Dr. Silva, Est. Vargas",
          },
        ],
        actividades: [
          {
            action: "Ensayo clínico aprobado",
            user: "Dr. Silva",
            time: "Hace 2 horas",
            icon: Award,
          },
          {
            action: "Laboratorio equipado",
            user: "Dr. Silva",
            time: "Hace 6 horas",
            icon: Target,
          },
        ],
      },
    }

    return dataBySemill[selectedSemillero.id as keyof typeof dataBySemill] || dataBySemill["1"]
  }

  const data = getDataBySemillero()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema de Información para Semilleros de Investigación - Universidad Libre Seccional Cali
          </p>
          {selectedSemillero && user?.role !== "administrador" && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Vista del semillero:</span> {selectedSemillero.name}
              </p>
            </div>
          )}
        </div>

        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.proyectosActivos}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSemillero ? `En ${selectedSemillero.name}` : "Total general"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.investigadores}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSemillero ? "Miembros activos" : "Total general"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Utilizado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.presupuestoUtilizado}%</div>
              <p className="text-xs text-muted-foreground">
                {selectedSemillero ? "Del presupuesto asignado" : "Promedio general"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicaciones</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.publicaciones}</div>
              <p className="text-xs text-muted-foreground">{selectedSemillero ? "Este año" : "Total general"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Proyectos recientes */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Proyectos Recientes</CardTitle>
              <CardDescription>
                {selectedSemillero
                  ? `Últimos proyectos de ${selectedSemillero.name}`
                  : "Últimos proyectos de investigación registrados"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.proyectosRecientes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay proyectos recientes para mostrar
                </p>
              ) : (
                data.proyectosRecientes.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{project.title}</h4>
                      <Badge
                        variant={
                          project.status === "En progreso"
                            ? "default"
                            : project.status === "Planificación"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.team}</p>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actividades recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
              <CardDescription>
                {selectedSemillero ? `Actividades en ${selectedSemillero.name}` : "Últimas acciones en el sistema"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.actividades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay actividades recientes</p>
              ) : (
                data.actividades.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Módulos del sistema */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Módulos del Sistema</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Gestión de Proyectos",
                description: "Planificación, seguimiento y evaluación de proyectos de investigación",
                icon: FolderOpen,
                href: "/proyectos",
              },
              {
                title: "Gestión de Recursos",
                description: "Administración y asignación de recursos físicos, financieros y humanos",
                icon: Target,
                href: "/recursos",
              },
              {
                title: "Comunicación",
                description: "Plataforma de comunicación interna y colaboración entre miembros",
                icon: MessageSquare,
                href: "/comunicacion",
              },
              {
                title: "Seguimiento e Impacto",
                description: "Monitoreo de KPIs y generación de informes de rendimiento",
                icon: TrendingUp,
                href: "/seguimiento",
              },
              {
                title: "Divulgación",
                description: "Plataforma externa para mostrar trabajos y atraer colaboraciones",
                icon: Award,
                href: "/divulgacion",
              },
            ].map((module, index) => {
              const Icon = module.icon
              return (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{module.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

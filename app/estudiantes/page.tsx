"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Search, UserPlus, CheckCircle, XCircle, Clock } from "lucide-react"

export default function EstudiantesPage() {
  const { user, semilleros, selectedSemillero, getStudentsBySemillero, createStudent, updateStudentStatus } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    semilleroId: selectedSemillero?.id || "",
    semilleroName: selectedSemillero?.name || "",
    status: "pendiente" as const,
  })
  const [selectedSemilleroId, setSelectedSemilleroId] = useState(selectedSemillero?.id || "")

  // Obtener estudiantes del semillero seleccionado
  const students = getStudentsBySemillero(selectedSemilleroId)

  // Filtrar estudiantes por término de búsqueda
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Agrupar estudiantes por estado
  const activeStudents = filteredStudents.filter((student) => student.status === "activo")
  const pendingStudents = filteredStudents.filter((student) => student.status === "pendiente")
  const inactiveStudents = filteredStudents.filter((student) => student.status === "inactivo")

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewStudent({ ...newStudent, [name]: value })
  }

  // Manejar cambio de semillero
  const handleSemilleroChange = (value: string) => {
    const selectedSemillero = semilleros.find((s) => s.id === value)
    if (selectedSemillero) {
      setNewStudent({
        ...newStudent,
        semilleroId: selectedSemillero.id,
        semilleroName: selectedSemillero.name,
      })
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await createStudent(newStudent)
    if (success) {
      setNewStudent({
        name: "",
        email: "",
        semilleroId: selectedSemillero?.id || "",
        semilleroName: selectedSemillero?.name || "",
        status: "pendiente",
      })
      setIsDialogOpen(false)
    }
  }

  // Manejar cambio de estado de estudiante
  const handleStatusChange = async (studentId: string, status: "activo" | "inactivo" | "pendiente") => {
    await updateStudentStatus(studentId, status)
  }

  // Obtener color de badge según estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activo":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )
      case "inactivo":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        )
      case "pendiente":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute requiredSection="estudiantes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Estudiantes</h1>
            <p className="text-muted-foreground">Administra los estudiantes de los semilleros de investigación</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
                <DialogDescription>
                  Completa el formulario para registrar un nuevo estudiante en el semillero.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" name="name" value={newStudent.name} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newStudent.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="semillero">Semillero</Label>
                    <Select value={newStudent.semilleroId} onValueChange={handleSemilleroChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un semillero" />
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
                </div>
                <DialogFooter>
                  <Button type="submit">Registrar Estudiante</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Selector de semillero y búsqueda */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="semillero-filter">Filtrar por Semillero</Label>
            <Select value={selectedSemilleroId} onValueChange={setSelectedSemilleroId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona un semillero" />
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
          <div>
            <Label htmlFor="search">Buscar Estudiante</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nombre o correo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingStudents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Inactivos</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveStudents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de estudiantes por pestañas */}
        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todos">Todos ({filteredStudents.length})</TabsTrigger>
            <TabsTrigger value="activos">Activos ({activeStudents.length})</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes ({pendingStudents.length})</TabsTrigger>
            <TabsTrigger value="inactivos">Inactivos ({inactiveStudents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4">
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No se encontraron estudiantes.
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} onStatusChange={handleStatusChange} />
              ))
            )}
          </TabsContent>

          <TabsContent value="activos" className="space-y-4">
            {activeStudents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay estudiantes activos.
                </CardContent>
              </Card>
            ) : (
              activeStudents.map((student) => (
                <StudentCard key={student.id} student={student} onStatusChange={handleStatusChange} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pendientes" className="space-y-4">
            {pendingStudents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay estudiantes pendientes.
                </CardContent>
              </Card>
            ) : (
              pendingStudents.map((student) => (
                <StudentCard key={student.id} student={student} onStatusChange={handleStatusChange} />
              ))
            )}
          </TabsContent>

          <TabsContent value="inactivos" className="space-y-4">
            {inactiveStudents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay estudiantes inactivos.
                </CardContent>
              </Card>
            ) : (
              inactiveStudents.map((student) => (
                <StudentCard key={student.id} student={student} onStatusChange={handleStatusChange} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

// Componente de tarjeta de estudiante
interface StudentCardProps {
  student: {
    id: string
    name: string
    email: string
    semilleroId: string
    semilleroName: string
    status: "activo" | "inactivo" | "pendiente"
  }
  onStatusChange: (studentId: string, status: "activo" | "inactivo" | "pendiente") => void
}

function StudentCard({ student, onStatusChange }: StudentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activo":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )
      case "inactivo":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        )
      case "pendiente":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{student.name}</CardTitle>
            <CardDescription>{student.email}</CardDescription>
          </div>
          {getStatusBadge(student.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Semillero:</p>
            <p className="text-sm text-muted-foreground">{student.semilleroName}</p>
          </div>
          <div className="flex space-x-2">
            {student.status !== "activo" && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                onClick={() => onStatusChange(student.id, "activo")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Activar
              </Button>
            )}
            {student.status !== "pendiente" && (
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => onStatusChange(student.id, "pendiente")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pendiente
              </Button>
            )}
            {student.status !== "inactivo" && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => onStatusChange(student.id, "inactivo")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Desactivar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

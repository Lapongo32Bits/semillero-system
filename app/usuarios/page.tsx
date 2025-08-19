"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, MoreHorizontal, UserPlus, Users, GraduationCap, Shield, Eye } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  name: string
  email: string
  role: "administrador" | "profesor" | "estudiante" | "visitante"
  semilleroId?: string
  semilleroName?: string
  status: "activo" | "inactivo" | "pendiente"
  createdAt: string
}

export default function UsuariosPage() {
  const { user, semilleros, createStudent, students, updateStudentStatus } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "estudiante" as "administrador" | "profesor" | "estudiante" | "visitante",
    semilleroId: "",
    password: "",
    confirmPassword: "",
  })
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "estudiante" as "administrador" | "profesor" | "estudiante" | "visitante",
    semilleroId: "",
  })

  useEffect(() => {
    loadUsuarios()
  }, [students])

  const loadUsuarios = () => {
    // Mock data for system users (admin, professors, visitors)
    const systemUsers: Usuario[] = [
      {
        id: "1",
        name: "Admin Sistema",
        email: "admin@unilibre.edu.co",
        role: "administrador",
        status: "activo",
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        name: "Dr. García Martínez",
        email: "garcia@unilibre.edu.co",
        role: "profesor",
        semilleroId: "1",
        semilleroName: "Inteligencia Artificial y Educación",
        status: "activo",
        createdAt: "2024-01-15",
      },
      {
        id: "5",
        name: "Dra. Martínez López",
        email: "martinez@unilibre.edu.co",
        role: "profesor",
        semilleroId: "2",
        semilleroName: "Sostenibilidad y Medio Ambiente",
        status: "activo",
        createdAt: "2024-01-20",
      },
      {
        id: "6",
        name: "Ing. Pérez Ramírez",
        email: "perez@unilibre.edu.co",
        role: "profesor",
        semilleroId: "3",
        semilleroName: "Blockchain y Fintech",
        status: "activo",
        createdAt: "2024-01-25",
      },
      {
        id: "7",
        name: "Dr. Silva Torres",
        email: "silva@unilibre.edu.co",
        role: "profesor",
        semilleroId: "4",
        semilleroName: "Biotecnología Médica",
        status: "activo",
        createdAt: "2024-01-30",
      },
      {
        id: "4",
        name: "Visitante Externo",
        email: "visitante@external.com",
        role: "visitante",
        status: "activo",
        createdAt: "2024-03-15",
      },
    ]

    // Convert students to usuarios format
    const studentUsers: Usuario[] = students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      role: "estudiante" as const,
      semilleroId: student.semilleroId,
      semilleroName: student.semilleroName,
      status: student.status,
      createdAt: new Date().toISOString().split("T")[0],
    }))

    // Combine system users with students
    setUsuarios([...systemUsers, ...studentUsers])
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "administrador":
        return Shield
      case "profesor":
        return GraduationCap
      case "estudiante":
        return Users
      case "visitante":
        return Eye
      default:
        return Users
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "administrador":
        return "destructive"
      case "profesor":
        return "default"
      case "estudiante":
        return "secondary"
      case "visitante":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "activo":
        return "default"
      case "pendiente":
        return "secondary"
      case "inactivo":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    // For students, semillero is required
    if (newUser.role === "estudiante" && !newUser.semilleroId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un semillero para el estudiante",
        variant: "destructive",
      })
      return
    }

    const semillero = semilleros.find((s) => s.id === newUser.semilleroId)

    if (newUser.role === "estudiante") {
      const success = await createStudent({
        name: newUser.name,
        email: newUser.email,
        semilleroId: newUser.semilleroId,
        semilleroName: semillero?.name || "",
        status: "activo",
      })

      if (success) {
        toast({
          title: "Usuario creado",
          description: `El estudiante ${newUser.name} ha sido creado exitosamente`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el usuario",
          variant: "destructive",
        })
      }
    } else {
      // For other roles, just show success message (in real app, would call API)
      toast({
        title: "Usuario creado",
        description: `El usuario ${newUser.name} ha sido creado exitosamente`,
      })
    }

    // Reset form
    setNewUser({
      name: "",
      email: "",
      role: "estudiante",
      semilleroId: "",
    })
    setIsDialogOpen(false)
  }

  const handleViewProfile = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setIsProfileDialogOpen(true)
  }

  const handleEditUser = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setEditUser({
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      semilleroId: usuario.semilleroId || "",
      password: "",
      confirmPassword: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editUser.name || !editUser.email || !editUser.role) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validación de contraseñas si se proporcionan
    if (editUser.password && editUser.password !== editUser.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (editUser.password && editUser.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to update the user
    toast({
      title: "Usuario actualizado",
      description: `La información de ${editUser.name} ha sido actualizada exitosamente`,
    })

    setIsEditDialogOpen(false)
    setSelectedUser(null)
    // Reload users to reflect changes
    loadUsuarios()
  }

  const handleStatusChange = async (usuarioId: string, newStatus: "activo" | "inactivo" | "pendiente") => {
    // Find if this is a student
    const student = students.find((s) => s.id === usuarioId)
    if (student && user) {
      const success = await updateStudentStatus(usuarioId, newStatus)
      if (success) {
        toast({
          title: "Estado actualizado",
          description: `El estado del usuario ha sido actualizado a ${newStatus}`,
        })
      }
    } else {
      // For other user types (in real app, would call API)
      toast({
        title: "Estado actualizado",
        description: `El estado del usuario ha sido actualizado a ${newStatus}`,
      })
      loadUsuarios()
    }
  }

  const usuariosPorRol = {
    todos: usuariosFiltrados,
    administradores: usuariosFiltrados.filter((u) => u.role === "administrador"),
    profesores: usuariosFiltrados.filter((u) => u.role === "profesor"),
    estudiantes: usuariosFiltrados.filter((u) => u.role === "estudiante"),
    visitantes: usuariosFiltrados.filter((u) => u.role === "visitante"),
  }

  return (
    <ProtectedRoute requiredSection="usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administración de usuarios del sistema de semilleros</p>
          </div>
          {(user?.role === "administrador" || user?.role === "profesor") && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>Ingresa la información del nuevo usuario del sistema.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="juan@unilibre.edu.co"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.role === "administrador" && (
                          <>
                            <SelectItem value="administrador">Administrador</SelectItem>
                            <SelectItem value="profesor">Profesor</SelectItem>
                          </>
                        )}
                        <SelectItem value="estudiante">Estudiante</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(newUser.role === "estudiante" || newUser.role === "profesor") && (
                    <div className="grid gap-2">
                      <Label htmlFor="semillero">Semillero</Label>
                      <Select
                        value={newUser.semilleroId}
                        onValueChange={(value) => setNewUser({ ...newUser, semilleroId: value })}
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
                  <Button type="submit" onClick={handleCreateUser}>
                    Crear Usuario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
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
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.length}</div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuariosPorRol.estudiantes.length}</div>
              <p className="text-xs text-muted-foreground">
                {usuarios.length > 0 ? Math.round((usuariosPorRol.estudiantes.length / usuarios.length) * 100) : 0}% del
                total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profesores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuariosPorRol.profesores.length}</div>
              <p className="text-xs text-muted-foreground">
                {usuarios.length > 0 ? Math.round((usuariosPorRol.profesores.length / usuarios.length) * 100) : 0}% del
                total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.status === "activo").length}</div>
              <p className="text-xs text-muted-foreground">
                {usuarios.length > 0
                  ? Math.round((usuarios.filter((u) => u.status === "activo").length / usuarios.length) * 100)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todos">Todos ({usuariosPorRol.todos.length})</TabsTrigger>
            <TabsTrigger value="administradores">Administradores ({usuariosPorRol.administradores.length})</TabsTrigger>
            <TabsTrigger value="profesores">Profesores ({usuariosPorRol.profesores.length})</TabsTrigger>
            <TabsTrigger value="estudiantes">Estudiantes ({usuariosPorRol.estudiantes.length})</TabsTrigger>
            <TabsTrigger value="visitantes">Visitantes ({usuariosPorRol.visitantes.length})</TabsTrigger>
          </TabsList>

          {Object.entries(usuariosPorRol).map(([key, usuarios]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {usuarios.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No se encontraron usuarios en esta categoría.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {usuarios.map((usuario) => {
                    const RoleIcon = getRoleIcon(usuario.role)
                    return (
                      <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <RoleIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{usuario.name}</CardTitle>
                                <CardDescription>{usuario.email}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getRoleBadgeVariant(usuario.role)}>{usuario.role}</Badge>
                              <Badge variant={getStatusBadgeVariant(usuario.status)}>{usuario.status}</Badge>
                              {(user?.role === "administrador" || user?.role === "profesor") && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewProfile(usuario)}>
                                      Ver Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditUser(usuario)}>
                                      Editar Usuario
                                    </DropdownMenuItem>
                                    {usuario.status === "activo" ? (
                                      <DropdownMenuItem onClick={() => handleStatusChange(usuario.id, "inactivo")}>
                                        Desactivar
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleStatusChange(usuario.id, "activo")}>
                                        Activar
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {usuario.semilleroName && (
                          <CardContent>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>Semillero:</span>
                              <Badge variant="outline">{usuario.semilleroName}</Badge>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Perfil de Usuario</DialogTitle>
              <DialogDescription>Información detallada del usuario seleccionado.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    {(() => {
                      const RoleIcon = getRoleIcon(selectedUser.role)
                      return <RoleIcon className="h-8 w-8" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Rol:</span>
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>{selectedUser.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estado:</span>
                    <Badge variant={getStatusBadgeVariant(selectedUser.status)}>{selectedUser.status}</Badge>
                  </div>
                  {selectedUser.semilleroName && (
                    <div className="flex justify-between">
                      <span className="font-medium">Semillero:</span>
                      <Badge variant="outline">{selectedUser.semilleroName}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Fecha de registro:</span>
                    <span className="text-muted-foreground">{selectedUser.createdAt}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>Modifica la información del usuario seleccionado.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Correo electrónico</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="juan@unilibre.edu.co"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Nueva contraseña (opcional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Dejar vacío para mantener la actual"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  id="edit-confirm-password"
                  type="password"
                  value={editUser.confirmPassword}
                  onChange={(e) => setEditUser({ ...editUser, confirmPassword: e.target.value })}
                  placeholder="Confirmar nueva contraseña"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={editUser.role} onValueChange={(value: any) => setEditUser({ ...editUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.role === "administrador" && (
                      <>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="profesor">Profesor</SelectItem>
                      </>
                    )}
                    <SelectItem value="estudiante">Estudiante</SelectItem>
                    <SelectItem value="visitante">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(editUser.role === "estudiante" || editUser.role === "profesor") && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-semillero">Semillero</Label>
                  <Select
                    value={editUser.semilleroId}
                    onValueChange={(value) => setEditUser({ ...editUser, semilleroId: value })}
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
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}

"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Search, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SemillerosPage() {
  const { user, semilleros, canAccess, createSemillero, updateSemillero, deleteSemillero } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSemillero, setEditingSemillero] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newSemillero, setNewSemillero] = useState({
    name: "",
    description: "",
    coordinatorId: "",
  })

  // Solo admin y profesores pueden acceder
  if (!user || !canAccess("semilleros")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    )
  }

  const filteredSemilleros = semilleros.filter(
    (semillero) =>
      semillero.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semillero.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateSemillero = async () => {
    if (!newSemillero.name || !newSemillero.description || !newSemillero.coordinatorId) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const coordinator = mockProfessors.find((p) => p.id === newSemillero.coordinatorId)
    if (!coordinator) {
      toast({
        title: "Error",
        description: "Coordinador no válido",
        variant: "destructive",
      })
      return
    }

    const success = await createSemillero({
      name: newSemillero.name,
      description: newSemillero.description,
      coordinatorId: newSemillero.coordinatorId,
      coordinator: coordinator.name,
      members: 0,
    })

    if (success) {
      toast({
        title: "Semillero creado",
        description: `El semillero "${newSemillero.name}" ha sido creado exitosamente.`,
      })
      setNewSemillero({ name: "", description: "", coordinatorId: "" })
      setIsCreateDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear el semillero",
        variant: "destructive",
      })
    }
  }

  const handleEditSemillero = (semillero: any) => {
    setEditingSemillero(semillero)
    setNewSemillero({
      name: semillero.name,
      description: semillero.description,
      coordinatorId: semillero.coordinatorId,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateSemillero = async () => {
    if (!newSemillero.name || !newSemillero.description || !newSemillero.coordinatorId || !editingSemillero) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const coordinator = mockProfessors.find((p) => p.id === newSemillero.coordinatorId)
    if (!coordinator) {
      toast({
        title: "Error",
        description: "Coordinador no válido",
        variant: "destructive",
      })
      return
    }

    const success = await updateSemillero(editingSemillero.id, {
      name: newSemillero.name,
      description: newSemillero.description,
      coordinatorId: newSemillero.coordinatorId,
      coordinator: coordinator.name,
    })

    if (success) {
      toast({
        title: "Semillero actualizado",
        description: `El semillero "${newSemillero.name}" ha sido actualizado exitosamente.`,
      })
      setNewSemillero({ name: "", description: "", coordinatorId: "" })
      setEditingSemillero(null)
      setIsEditDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el semillero",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSemillero = async (semillero: any) => {
    const success = await deleteSemillero(semillero.id)

    if (success) {
      toast({
        title: "Semillero eliminado",
        description: `El semillero "${semillero.name}" ha sido eliminado exitosamente.`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el semillero",
        variant: "destructive",
      })
    }
  }

  const mockProfessors = [
    { id: "2", name: "Dr. García Martínez" },
    { id: "5", name: "Dra. Martínez López" },
    { id: "6", name: "Ing. Pérez Ramírez" },
    { id: "7", name: "Dr. Silva Torres" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Semilleros</h1>
          <p className="text-muted-foreground">Administra los semilleros de investigación de la universidad</p>
        </div>

        {user.role === "administrador" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Semillero
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Semillero</DialogTitle>
                <DialogDescription>
                  Completa la información para crear un nuevo semillero de investigación.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del Semillero</Label>
                  <Input
                    id="name"
                    value={newSemillero.name}
                    onChange={(e) => setNewSemillero({ ...newSemillero, name: e.target.value })}
                    placeholder="Ej: Inteligencia Artificial y Educación"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newSemillero.description}
                    onChange={(e) => setNewSemillero({ ...newSemillero, description: e.target.value })}
                    placeholder="Describe el enfoque y objetivos del semillero"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coordinator">Coordinador</Label>
                  <Select
                    value={newSemillero.coordinatorId}
                    onValueChange={(value) => setNewSemillero({ ...newSemillero, coordinatorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesor coordinador" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProfessors.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSemillero}>Crear Semillero</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Semillero</DialogTitle>
            <DialogDescription>Modifica la información del semillero de investigación.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre del Semillero</Label>
              <Input
                id="edit-name"
                value={newSemillero.name}
                onChange={(e) => setNewSemillero({ ...newSemillero, name: e.target.value })}
                placeholder="Ej: Inteligencia Artificial y Educación"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={newSemillero.description}
                onChange={(e) => setNewSemillero({ ...newSemillero, description: e.target.value })}
                placeholder="Describe el enfoque y objetivos del semillero"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-coordinator">Coordinador</Label>
              <Select
                value={newSemillero.coordinatorId}
                onValueChange={(value) => setNewSemillero({ ...newSemillero, coordinatorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor coordinador" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfessors.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSemillero}>Actualizar Semillero</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar semilleros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSemilleros.map((semillero) => (
          <Card key={semillero.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{semillero.name}</CardTitle>
                  <CardDescription className="text-sm">Coordinador: {semillero.coordinator}</CardDescription>
                </div>
                {user.role === "administrador" && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSemillero(semillero)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el semillero "
                            {semillero.name}" y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSemillero(semillero)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{semillero.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{semillero.members} miembros</span>
                </div>
                <Badge variant="secondary">Activo</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSemilleros.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron semilleros que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  )
}

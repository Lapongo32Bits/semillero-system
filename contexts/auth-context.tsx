"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { dataService } from "@/lib/data-service"

export type UserRole = "administrador" | "profesor" | "estudiante" | "visitante"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  semilleroId?: string
  semilleroName?: string
  avatar?: string
}

export interface Semillero {
  id: string
  name: string
  description: string
  coordinatorId: string // Changed from coordinator string to coordinatorId
  coordinator: string
  members: number
}

export interface Student {
  id: string
  name: string
  email: string
  semilleroId: string
  semilleroName: string
  status: "activo" | "inactivo" | "pendiente"
  createdBy: string
}

interface AuthContextType {
  user: User | null
  semilleros: Semillero[]
  students: Student[]
  selectedSemillero: Semillero | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  selectSemillero: (semillero: Semillero) => void
  canAccess: (section: string, semilleroId?: string) => boolean
  canDownload: (semilleroId?: string) => boolean
  canCreateProject: () => boolean // Added function to check if user can create projects
  canManageResources: (semilleroId?: string) => boolean // Added function to check resource management
  isLoading: boolean
  createStudent: (studentData: Omit<Student, "id" | "createdBy">) => Promise<boolean>
  getStudentsBySemillero: (semilleroId: string) => Student[]
  updateStudentStatus: (studentId: string, status: "activo" | "inactivo" | "pendiente") => Promise<boolean>
  createSemillero: (semilleroData: Omit<Semillero, "id">) => Promise<boolean>
  updateSemillero: (id: string, updates: Partial<Semillero>) => Promise<boolean>
  deleteSemillero: (id: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock data para demostración
const mockSemilleros: Semillero[] = [
  {
    id: "1",
    name: "Inteligencia Artificial y Educación",
    description: "Investigación en IA aplicada a procesos educativos",
    coordinatorId: "2",
    coordinator: "Dr. García Martínez",
    members: 12,
  },
  {
    id: "2",
    name: "Sostenibilidad y Medio Ambiente",
    description: "Estudios de impacto ambiental y sostenibilidad urbana",
    coordinatorId: "5",
    coordinator: "Dra. Martínez López",
    members: 8,
  },
  {
    id: "3",
    name: "Blockchain y Fintech",
    description: "Tecnologías blockchain aplicadas a sistemas financieros",
    coordinatorId: "6",
    coordinator: "Ing. Pérez Ramírez",
    members: 10,
  },
  {
    id: "4",
    name: "Biotecnología Médica",
    description: "Investigación en biotecnología aplicada a la medicina",
    coordinatorId: "7",
    coordinator: "Dr. Silva Torres",
    members: 15,
  },
]

const mockUsers = [
  {
    id: "1",
    name: "Admin Sistema",
    email: "admin@unilibre.edu.co",
    password: "admin123",
    role: "administrador" as UserRole,
  },
  {
    id: "2",
    name: "Dr. García Martínez",
    email: "garcia@unilibre.edu.co",
    password: "prof123",
    role: "profesor" as UserRole,
    semilleroId: "1", // Asignado al semillero de IA
    semilleroName: "Inteligencia Artificial y Educación",
  },
  {
    id: "3",
    name: "María Estudiante",
    email: "maria@unilibre.edu.co",
    password: "est123",
    role: "estudiante" as UserRole,
    semilleroId: "1", // Students can only be in one semillero
    semilleroName: "Inteligencia Artificial y Educación",
  },
  {
    id: "4",
    name: "Visitante Externo",
    email: "visitante@external.com",
    password: "visit123",
    role: "visitante" as UserRole,
  },
  {
    id: "5",
    name: "Dra. Martínez López",
    email: "martinez@unilibre.edu.co",
    password: "prof123",
    role: "profesor" as UserRole,
    semilleroId: "2", // Asignado al semillero de Sostenibilidad
    semilleroName: "Sostenibilidad y Medio Ambiente",
  },
  {
    id: "6",
    name: "Ing. Pérez Ramírez",
    email: "perez@unilibre.edu.co",
    password: "prof123",
    role: "profesor" as UserRole,
    semilleroId: "3", // Asignado al semillero de Blockchain
    semilleroName: "Blockchain y Fintech",
  },
  {
    id: "7",
    name: "Dr. Silva Torres",
    email: "silva@unilibre.edu.co",
    password: "prof123",
    role: "profesor" as UserRole,
    semilleroId: "4", // Asignado al semillero de Biotecnología
    semilleroName: "Biotecnología Médica",
  },
]

// Mock data para estudiantes
const mockStudents: Student[] = [
  {
    id: "1",
    name: "Carlos Rodríguez",
    email: "carlos@unilibre.edu.co",
    semilleroId: "1",
    semilleroName: "Inteligencia Artificial y Educación",
    status: "activo",
    createdBy: "2", // ID del Dr. García
  },
  {
    id: "2",
    name: "Ana Martínez",
    email: "ana@unilibre.edu.co",
    semilleroId: "1",
    semilleroName: "Inteligencia Artificial y Educación",
    status: "activo",
    createdBy: "2",
  },
  {
    id: "3",
    name: "María Estudiante",
    email: "maria@unilibre.edu.co",
    semilleroId: "1",
    semilleroName: "Inteligencia Artificial y Educación",
    status: "activo",
    createdBy: "2",
  },
  {
    id: "4",
    name: "Luis Pérez",
    email: "luis@unilibre.edu.co",
    semilleroId: "2",
    semilleroName: "Sostenibilidad y Medio Ambiente",
    status: "pendiente",
    createdBy: "1",
  },
  {
    id: "5",
    name: "Sofía Gómez",
    email: "sofia@unilibre.edu.co",
    semilleroId: "3",
    semilleroName: "Blockchain y Fintech",
    status: "inactivo",
    createdBy: "1",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [selectedSemillero, setSelectedSemillero] = useState<Semillero | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [semilleros, setSemilleros] = useState<Semillero[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const router = useRouter()

  const loadSemilleros = (): Semillero[] => {
    try {
      const saved = localStorage.getItem("semillero_semilleros")
      return saved ? JSON.parse(saved) : mockSemilleros
    } catch {
      return mockSemilleros
    }
  }

  const saveSemilleros = (semillerosData: Semillero[]) => {
    try {
      localStorage.setItem("semillero_semilleros", JSON.stringify(semillerosData))
      setSemilleros(semillerosData)
    } catch (error) {
      console.error("Error saving semilleros:", error)
    }
  }

  const loadStudents = (): Student[] => {
    try {
      const saved = localStorage.getItem("semillero_students")
      return saved ? JSON.parse(saved) : mockStudents
    } catch {
      return mockStudents
    }
  }

  const saveStudents = (studentsData: Student[]) => {
    try {
      localStorage.setItem("semillero_students", JSON.stringify(studentsData))
      setStudents(studentsData)
    } catch (error) {
      console.error("Error saving students:", error)
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const savedSemillero = localStorage.getItem("selectedSemillero")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedSemillero) {
      setSelectedSemillero(JSON.parse(savedSemillero))
    }

    // Cargar semilleros y estudiantes
    setSemilleros(loadSemilleros())
    setStudents(loadStudents())

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (mockUser) {
      const userData: User = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        semilleroId: mockUser.semilleroId,
        semilleroName: mockUser.semilleroName,
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      dataService.initializeMockData()

      if ((userData.role === "estudiante" || userData.role === "profesor") && userData.semilleroId) {
        const loadedSemilleros = loadSemilleros()
        const userSemillero = loadedSemilleros.find((s) => s.id === userData.semilleroId)
        if (userSemillero) {
          setSelectedSemillero(userSemillero)
          localStorage.setItem("selectedSemillero", JSON.stringify(userSemillero))
        }
      }

      if (userData.role === "visitante") {
        router.push("/divulgacion")
      }

      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    setSelectedSemillero(null)
    localStorage.removeItem("user")
    localStorage.removeItem("selectedSemillero")
    router.push("/login")
  }

  const selectSemillero = (semillero: Semillero) => {
    const updatedUser = user
      ? {
          ...user,
          semilleroId: semillero.id,
          semilleroName: semillero.name,
        }
      : null

    setUser(updatedUser)
    setSelectedSemillero(semillero)

    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
    localStorage.setItem("selectedSemillero", JSON.stringify(semillero))
  }

  const canAccess = (section: string, semilleroId?: string): boolean => {
    if (!user) return false

    // Administrador tiene acceso completo
    if (user.role === "administrador") return true

    // Visitante solo puede ver divulgación
    if (user.role === "visitante") {
      return section === "divulgacion"
    }

    if (user.role === "estudiante") {
      const restrictedSections = ["usuarios", "configuracion"]
      if (restrictedSections.includes(section)) {
        return false
      }
    }

    // Para profesores y estudiantes
    if (user.role === "profesor" || user.role === "estudiante") {
      // Si no se especifica semillero, usar el seleccionado
      const targetSemillero = semilleroId || user.semilleroId

      // Acceso completo a su propio semillero
      if (targetSemillero === user.semilleroId) {
        return true
      }

      // En otros semilleros, solo pueden ver proyectos y recursos (no comunicación ni seguimiento)
      if (targetSemillero !== user.semilleroId) {
        return section === "proyectos" || section === "recursos" || section === "divulgacion"
      }
    }

    return false
  }

  const canDownload = (semilleroId?: string): boolean => {
    if (!user) return false

    // Administrador puede descargar todo
    if (user.role === "administrador") return true

    // Visitante no puede descargar nada
    if (user.role === "visitante") return false

    if (!semilleroId) return true // For divulgacion section

    // Solo pueden descargar de su propio semillero
    const targetSemillero = semilleroId || user.semilleroId
    return targetSemillero === user.semilleroId
  }

  const canCreateProject = (): boolean => {
    if (!user) return false
    return user.role === "estudiante"
  }

  const canManageResources = (semilleroId?: string): boolean => {
    if (!user) return false

    // Admin can manage all resources
    if (user.role === "administrador") return true

    // Only professors can manage resources of their semillero
    if (user.role === "profesor") {
      const targetSemillero = semilleroId || user.semilleroId
      return targetSemillero === user.semilleroId
    }

    return false
  }

  // Función para crear un nuevo estudiante
  const createStudent = async (studentData: Omit<Student, "id" | "createdBy">): Promise<boolean> => {
    if (!user || (user.role !== "profesor" && user.role !== "administrador")) {
      return false
    }

    try {
      // En una implementación real, aquí se haría una llamada a la API
      const newStudent: Student = {
        ...studentData,
        id: Date.now().toString(),
        createdBy: user.id,
      }

      const updatedStudents = [...students, newStudent]
      saveStudents(updatedStudents)
      return true
    } catch (error) {
      console.error("Error al crear estudiante:", error)
      return false
    }
  }

  // Función para obtener estudiantes por semillero
  const getStudentsBySemillero = (semilleroId: string): Student[] => {
    if (!user) return []

    // Administrador puede ver todos los estudiantes de cualquier semillero
    if (user.role === "administrador") {
      return students.filter((student) => student.semilleroId === semilleroId)
    }

    // Profesor solo puede ver estudiantes de su semillero
    if (user.role === "profesor" && user.semilleroId === semilleroId) {
      return students.filter((student) => student.semilleroId === semilleroId)
    }

    return []
  }

  // Función para actualizar el estado de un estudiante
  const updateStudentStatus = async (
    studentId: string,
    status: "activo" | "inactivo" | "pendiente",
  ): Promise<boolean> => {
    if (!user || (user.role !== "profesor" && user.role !== "administrador")) {
      return false
    }

    try {
      // En una implementación real, aquí se haría una llamada a la API
      const updatedStudents = students.map((student) => {
        if (student.id === studentId) {
          return { ...student, status }
        }
        return student
      })

      saveStudents(updatedStudents)
      return true
    } catch (error) {
      console.error("Error al actualizar estado del estudiante:", error)
      return false
    }
  }

  const createSemillero = async (semilleroData: Omit<Semillero, "id">): Promise<boolean> => {
    if (!user || (user.role !== "administrador" && user.role !== "profesor")) {
      return false
    }

    try {
      const newSemillero: Semillero = {
        ...semilleroData,
        id: Date.now().toString(),
      }

      const updatedSemilleros = [...semilleros, newSemillero]
      saveSemilleros(updatedSemilleros)
      return true
    } catch (error) {
      console.error("Error al crear semillero:", error)
      return false
    }
  }

  const updateSemillero = async (id: string, updates: Partial<Semillero>): Promise<boolean> => {
    if (!user || user.role !== "administrador") {
      return false
    }

    try {
      const updatedSemilleros = semilleros.map((s) => (s.id === id ? { ...s, ...updates } : s))
      saveSemilleros(updatedSemilleros)
      return true
    } catch (error) {
      console.error("Error al actualizar semillero:", error)
      return false
    }
  }

  const deleteSemillero = async (id: string): Promise<boolean> => {
    if (!user || user.role !== "administrador") {
      return false
    }

    try {
      const updatedSemilleros = semilleros.filter((s) => s.id !== id)
      saveSemilleros(updatedSemilleros)
      return true
    } catch (error) {
      console.error("Error al eliminar semillero:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        semilleros,
        students,
        selectedSemillero,
        login,
        logout,
        selectSemillero,
        canAccess,
        canDownload,
        canCreateProject,
        canManageResources,
        isLoading,
        createStudent,
        getStudentsBySemillero,
        updateStudentStatus,
        createSemillero,
        updateSemillero,
        deleteSemillero,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export interface Project {
  id: string
  title: string
  description: string
  status: "planificacion" | "en-progreso" | "completado" | "pausado"
  progress: number
  budget: number
  startDate: string
  endDate: string
  semilleroId: string
  semilleroName: string
  team: string[]
  document?: File | null
  documentName?: string
  createdBy: string
  createdAt: string
}

export interface Resource {
  id: string
  name: string
  type: "equipo" | "presupuesto" | "personal"
  status: "disponible" | "en-uso" | "mantenimiento"
  projectId: string
  projectName: string
  semilleroId: string
  assignedTo?: string
  description: string
  createdBy: string
  createdAt: string
}

export interface Message {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  semilleroId?: string
  isGeneral: boolean
  createdAt: string
  replies: Reply[]
}

export interface Reply {
  id: string
  content: string
  author: string
  authorId: string
  createdAt: string
}

export interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  semilleroId?: string
  isGeneral: boolean
  organizer: string
  organizerId: string
  attendees: string[]
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: "conferencia" | "taller" | "seminario" | "congreso"
  organizer: string
  createdBy: string
  createdAt: string
}

export interface Collaboration {
  id: string
  title: string
  institution: string
  description: string
  status: "activa" | "finalizada" | "pendiente"
  startDate: string
  endDate?: string
  contact: string
  email: string
  createdBy: string
  createdAt: string
}

class DataService {
  private getStorageKey(type: string): string {
    return `semillero_${type}`
  }

  private getData<T>(type: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(type))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error loading ${type}:`, error)
      return []
    }
  }

  private saveData<T>(type: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(type), JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${type}:`, error)
    }
  }

  // Projects
  getProjects(): Project[] {
    return this.getData<Project>("projects")
  }

  saveProject(project: Omit<Project, "id" | "createdAt">): Project {
    const projects = this.getProjects()
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    projects.push(newProject)
    this.saveData("projects", projects)
    return newProject
  }

  updateProject(id: string, updates: Partial<Project>): boolean {
    const projects = this.getProjects()
    const index = projects.findIndex((p) => p.id === id)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates }
      this.saveData("projects", projects)
      return true
    }
    return false
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects()
    const filtered = projects.filter((p) => p.id !== id)
    this.saveData("projects", filtered)
    return filtered.length < projects.length
  }

  // Resources
  getResources(): Resource[] {
    return this.getData<Resource>("resources")
  }

  saveResource(resource: Omit<Resource, "id" | "createdAt">): Resource {
    const resources = this.getResources()
    const newResource: Resource = {
      ...resource,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    resources.push(newResource)
    this.saveData("resources", resources)
    return newResource
  }

  updateResource(id: string, updates: Partial<Resource>): boolean {
    const resources = this.getResources()
    const index = resources.findIndex((r) => r.id === id)
    if (index !== -1) {
      resources[index] = { ...resources[index], ...updates }
      this.saveData("resources", resources)
      return true
    }
    return false
  }

  deleteResource(id: string): boolean {
    const resources = this.getResources()
    const filtered = resources.filter((r) => r.id !== id)
    this.saveData("resources", filtered)
    return filtered.length < resources.length
  }

  // Messages
  getMessages(): Message[] {
    return this.getData<Message>("messages")
  }

  saveMessage(message: Omit<Message, "id" | "createdAt" | "replies">): Message {
    const messages = this.getMessages()
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      replies: [],
    }
    messages.push(newMessage)
    this.saveData("messages", messages)
    return newMessage
  }

  addReply(messageId: string, reply: Omit<Reply, "id" | "createdAt">): boolean {
    const messages = this.getMessages()
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex !== -1) {
      const newReply: Reply = {
        ...reply,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      messages[messageIndex].replies.push(newReply)
      this.saveData("messages", messages)
      return true
    }
    return false
  }

  // Meetings
  getMeetings(): Meeting[] {
    return this.getData<Meeting>("meetings")
  }

  saveMeeting(meeting: Omit<Meeting, "id" | "createdAt">): Meeting {
    const meetings = this.getMeetings()
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    meetings.push(newMeeting)
    this.saveData("meetings", meetings)
    return newMeeting
  }

  updateMeeting(id: string, updates: Partial<Meeting>): boolean {
    const meetings = this.getMeetings()
    const index = meetings.findIndex((m) => m.id === id)
    if (index !== -1) {
      meetings[index] = { ...meetings[index], ...updates }
      this.saveData("meetings", meetings)
      return true
    }
    return false
  }

  deleteMeeting(id: string): boolean {
    const meetings = this.getMeetings()
    const filtered = meetings.filter((m) => m.id !== id)
    this.saveData("meetings", filtered)
    return filtered.length < meetings.length
  }

  // Events
  getEvents(): Event[] {
    return this.getData<Event>("events")
  }

  saveEvent(event: Omit<Event, "id" | "createdAt">): Event {
    const events = this.getEvents()
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    events.push(newEvent)
    this.saveData("events", events)
    return newEvent
  }

  updateEvent(id: string, updates: Partial<Event>): boolean {
    const events = this.getEvents()
    const index = events.findIndex((e) => e.id === id)
    if (index !== -1) {
      events[index] = { ...events[index], ...updates }
      this.saveData("events", events)
      return true
    }
    return false
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents()
    const filtered = events.filter((e) => e.id !== id)
    this.saveData("events", filtered)
    return filtered.length < events.length
  }

  // Collaborations
  getCollaborations(): Collaboration[] {
    return this.getData<Collaboration>("collaborations")
  }

  saveCollaboration(collaboration: Omit<Collaboration, "id" | "createdAt">): Collaboration {
    const collaborations = this.getCollaborations()
    const newCollaboration: Collaboration = {
      ...collaboration,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    collaborations.push(newCollaboration)
    this.saveData("collaborations", collaborations)
    return newCollaboration
  }

  updateCollaboration(id: string, updates: Partial<Collaboration>): boolean {
    const collaborations = this.getCollaborations()
    const index = collaborations.findIndex((c) => c.id === id)
    if (index !== -1) {
      collaborations[index] = { ...collaborations[index], ...updates }
      this.saveData("collaborations", collaborations)
      return true
    }
    return false
  }

  deleteCollaboration(id: string): boolean {
    const collaborations = this.getCollaborations()
    const filtered = collaborations.filter((c) => c.id !== id)
    this.saveData("collaborations", filtered)
    return filtered.length < collaborations.length
  }

  // Initialize with mock data if empty
  initializeMockData(): void {
    if (this.getProjects().length === 0) {
      const mockProjects: Project[] = [
        {
          id: "1",
          title: "Sistema de Recomendación Educativa",
          description: "Desarrollo de un sistema de IA para recomendar contenido educativo personalizado",
          status: "en-progreso",
          progress: 65,
          budget: 15000,
          startDate: "2024-01-15",
          endDate: "2024-06-30",
          semilleroId: "1",
          semilleroName: "Inteligencia Artificial y Educación",
          team: ["Dr. García Martínez", "María Estudiante", "Carlos Rodríguez"],
          documentName: "propuesta_sistema_recomendacion.pdf",
          createdBy: "3",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          title: "Análisis de Huella de Carbono Universitaria",
          description: "Estudio del impacto ambiental de las actividades universitarias",
          status: "planificacion",
          progress: 25,
          budget: 8000,
          startDate: "2024-03-01",
          endDate: "2024-08-15",
          semilleroId: "2",
          semilleroName: "Sostenibilidad y Medio Ambiente",
          team: ["Dra. Martínez López", "Luis Pérez"],
          createdBy: "3",
          createdAt: "2024-02-20T14:30:00Z",
        },
        {
          id: "3",
          title: "Plataforma de Aprendizaje Adaptativo",
          description: "Desarrollo de una plataforma que se adapta al ritmo de aprendizaje del estudiante",
          status: "completado",
          progress: 100,
          budget: 12000,
          startDate: "2023-09-01",
          endDate: "2024-01-30",
          semilleroId: "1",
          semilleroName: "Inteligencia Artificial y Educación",
          team: ["Dr. García Martínez", "María Estudiante", "Ana Torres"],
          documentName: "plataforma_adaptativa_final.pdf",
          createdBy: "3",
          createdAt: "2023-09-01T08:00:00Z",
        },
      ]
      this.saveData("projects", mockProjects)
    }

    if (this.getResources().length === 0) {
      const mockResources: Resource[] = [
        {
          id: "1",
          name: "Servidor de Procesamiento",
          type: "equipo",
          status: "en-uso",
          projectId: "1",
          projectName: "Sistema de Recomendación Educativa",
          semilleroId: "1",
          assignedTo: "María Estudiante",
          description: "Servidor dedicado para procesamiento de algoritmos de IA",
          createdBy: "2",
          createdAt: "2024-01-20T10:00:00Z",
        },
        {
          id: "2",
          name: "Presupuesto Investigación Q1",
          type: "presupuesto",
          status: "disponible",
          projectId: "2",
          projectName: "Análisis de Huella de Carbono",
          semilleroId: "2",
          description: "Presupuesto asignado para el primer trimestre de investigación",
          createdBy: "2",
          createdAt: "2024-02-01T14:00:00Z",
        },
      ]
      this.saveData("resources", mockResources)
    }

    if (this.getMessages().length === 0) {
      const mockMessages: Message[] = [
        {
          id: "1",
          title: "Reunión Semanal - Avances del Proyecto",
          content: "Recordatorio de la reunión semanal para revisar avances del sistema de recomendación educativa.",
          author: "Dr. García Martínez",
          authorId: "2",
          semilleroId: "1",
          isGeneral: false,
          createdAt: "2024-01-22T09:00:00Z",
          replies: [
            {
              id: "1",
              content: "Perfecto, estaré presente con el reporte de avances.",
              author: "María Estudiante",
              authorId: "3",
              createdAt: "2024-01-22T10:30:00Z",
            },
          ],
        },
        {
          id: "2",
          title: "Convocatoria General - Congreso de Investigación",
          content: "Se abre la convocatoria para participar en el congreso anual de investigación universitaria.",
          author: "Administrador Sistema",
          authorId: "1",
          isGeneral: true,
          createdAt: "2024-01-25T16:00:00Z",
          replies: [],
        },
      ]
      this.saveData("messages", mockMessages)
    }

    if (this.getMeetings().length === 0) {
      const mockMeetings: Meeting[] = [
        {
          id: "1",
          title: "Revisión de Avances - Sistema IA",
          description: "Reunión para revisar el progreso del sistema de recomendación educativa",
          date: "2024-02-15",
          time: "14:00",
          location: "Sala de Juntas 201",
          semilleroId: "1",
          isGeneral: false,
          organizer: "Dr. García Martínez",
          organizerId: "2",
          attendees: ["María Estudiante", "Carlos Rodríguez"],
          createdAt: "2024-01-30T11:00:00Z",
        },
      ]
      this.saveData("meetings", mockMeetings)
    }

    if (this.getEvents().length === 0) {
      const mockEvents: Event[] = [
        {
          id: "1",
          title: "Congreso Internacional de IA",
          description: "Presentación de avances en inteligencia artificial aplicada a la educación",
          date: "2024-05-15",
          location: "Auditorio Principal",
          type: "congreso",
          organizer: "Semillero IA y Educación",
          createdBy: "2",
          createdAt: "2024-01-10T09:00:00Z",
        },
        {
          id: "2",
          title: "Taller de Sostenibilidad",
          description: "Taller práctico sobre metodologías de investigación en sostenibilidad",
          date: "2024-03-20",
          location: "Laboratorio de Ciencias",
          type: "taller",
          organizer: "Semillero Sostenibilidad",
          createdBy: "2",
          createdAt: "2024-02-01T15:00:00Z",
        },
      ]
      this.saveData("events", mockEvents)
    }

    if (this.getCollaborations().length === 0) {
      const mockCollaborations: Collaboration[] = [
        {
          id: "1",
          title: "Proyecto Conjunto con Universidad Nacional",
          institution: "Universidad Nacional de Colombia",
          description: "Investigación colaborativa en sistemas inteligentes para educación",
          status: "activa",
          startDate: "2024-01-01",
          contact: "Dr. Rodríguez",
          email: "rodriguez@unal.edu.co",
          createdBy: "1",
          createdAt: "2023-12-15T16:00:00Z",
        },
        {
          id: "2",
          title: "Alianza con Ministerio de Ambiente",
          institution: "Ministerio de Ambiente y Desarrollo Sostenible",
          description: "Colaboración en proyectos de investigación ambiental universitaria",
          status: "pendiente",
          startDate: "2024-04-01",
          contact: "Ing. Martínez",
          email: "martinez@minambiente.gov.co",
          createdBy: "1",
          createdAt: "2024-01-15T12:00:00Z",
        },
      ]
      this.saveData("collaborations", mockCollaborations)
    }
  }
}

export const dataService = new DataService()

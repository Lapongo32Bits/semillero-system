"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, MessageCircle, Phone, Mail, FileText, Users } from "lucide-react"

export default function AyudaPage() {
  const { user } = useAuth()

  const faqsByRole = {
    estudiante: [
      {
        question: "¿Cómo puedo crear un nuevo proyecto?",
        answer:
          "Ve a la sección 'Proyectos' y haz clic en '+ Nuevo Proyecto'. Completa todos los campos requeridos y sube la documentación necesaria.",
      },
      {
        question: "¿Puedo ver proyectos de otros semilleros?",
        answer:
          "Sí, puedes ver proyectos de otros semilleros en la sección 'Proyectos', pero solo podrás descargar documentos de tu propio semillero.",
      },
      {
        question: "¿Cómo participo en las comunicaciones del semillero?",
        answer:
          "En la sección 'Comunicación' puedes ver mensajes, responder y participar en reuniones programadas de tu semillero.",
      },
    ],
    profesor: [
      {
        question: "¿Cómo gestiono los recursos de mi semillero?",
        answer:
          "En la sección 'Recursos' puedes crear, editar y asignar recursos a proyectos específicos de tu semillero.",
      },
      {
        question: "¿Cómo creo nuevos usuarios?",
        answer:
          "Ve a 'Usuarios' y haz clic en 'Nuevo Usuario'. Puedes crear otros profesores y estudiantes, asignando el semillero correspondiente.",
      },
      {
        question: "¿Puedo tener varios semilleros?",
        answer:
          "Sí, un profesor puede coordinar múltiples semilleros. Usa el selector de semillero para cambiar entre ellos.",
      },
    ],
    administrador: [
      {
        question: "¿Cómo creo un nuevo semillero?",
        answer:
          "Ve a 'Semilleros' y haz clic en 'Nuevo Semillero'. Asigna un coordinador y completa la información básica.",
      },
      {
        question: "¿Puedo ver datos de todos los semilleros?",
        answer:
          "Sí, como administrador tienes acceso completo a todos los semilleros, proyectos, recursos y usuarios del sistema.",
      },
    ],
    visitante: [
      {
        question: "¿Qué puedo ver como visitante?",
        answer:
          "Puedes acceder a la sección 'Divulgación' para ver todos los proyectos publicados de todos los semilleros.",
      },
      {
        question: "¿Puedo descargar documentos?",
        answer: "No, como visitante solo puedes ver los detalles de los proyectos pero no descargar documentos.",
      },
    ],
  }

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Correo Electrónico",
      value: "soporte.semilleros@unilibre.edu.co",
      description: "Respuesta en 24-48 horas",
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Teléfono",
      value: "+57 (2) 555-0123",
      description: "Lunes a Viernes, 8:00 AM - 5:00 PM",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "Chat en Vivo",
      value: "Disponible en horario laboral",
      description: "Respuesta inmediata",
    },
  ]

  const guides = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Manual de Usuario",
      description: "Guía completa para usar el sistema",
      badge: "PDF",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Políticas de Uso",
      description: "Términos y condiciones del sistema",
      badge: "Documento",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Gestión de Semilleros",
      description: "Cómo administrar tu semillero efectivamente",
      badge: "Guía",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centro de Ayuda</h1>
        <p className="text-muted-foreground">Encuentra respuestas a tus preguntas y obtén soporte técnico</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Preguntas Frecuentes
            </CardTitle>
            <CardDescription>
              Respuestas a las preguntas más comunes según tu rol:{" "}
              <Badge variant="secondary">{user?.role || "visitante"}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqsByRole[user?.role || "visitante"]?.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contacto y Soporte
            </CardTitle>
            <CardDescription>Múltiples canales para obtener ayuda personalizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactInfo.map((contact, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">{contact.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{contact.title}</h4>
                  <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{contact.value}</p>
                  <p className="text-xs text-muted-foreground">{contact.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentación y Guías
          </CardTitle>
          <CardDescription>Recursos adicionales para aprovechar al máximo el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {guides.map((guide, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              >
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">{guide.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{guide.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {guide.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿No encuentras lo que buscas?</CardTitle>
          <CardDescription>Nuestro equipo de soporte está aquí para ayudarte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Enviar Consulta
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat en Vivo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

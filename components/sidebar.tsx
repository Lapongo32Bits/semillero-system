"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Home,
  FolderOpen,
  Target,
  MessageSquare,
  TrendingUp,
  Award,
  Users,
  HelpCircle,
  LogOut,
  Shield,
  User,
  GraduationCap,
  Eye,
  Building2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Proyectos",
    href: "/proyectos",
    icon: FolderOpen,
  },
  {
    name: "Recursos",
    href: "/recursos",
    icon: Target,
  },
  {
    name: "Comunicación",
    href: "/comunicacion",
    icon: MessageSquare,
  },
  {
    name: "Seguimiento",
    href: "/seguimiento",
    icon: TrendingUp,
  },
  {
    name: "Divulgación",
    href: "/divulgacion",
    icon: Award,
  },
  {
    name: "Semilleros",
    href: "/semilleros",
    icon: Building2,
  },
  {
    name: "Usuarios",
    href: "/usuarios",
    icon: Users,
  },
  {
    name: "Ayuda",
    href: "/ayuda",
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, selectedSemillero, logout, canAccess } = useAuth()

  if (!user) return null

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "administrador":
        return Shield
      case "profesor":
        return GraduationCap
      case "estudiante":
        return User
      case "visitante":
        return Eye
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon(user.role)

  const filteredNavigation = navigation.filter((item) => {
    const section = item.href.replace("/", "") || "dashboard"

    if (item.href === "/usuarios" && user.role === "estudiante") {
      return false
    }

    if (item.href === "/semilleros" && user.role === "estudiante") {
      return false
    }

    return canAccess(section)
  })

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo/Header */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SI</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Semilleros</h2>
            <p className="text-xs text-muted-foreground">Universidad Libre</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2", isActive && "bg-secondary")}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        {(selectedSemillero || (user.role === "estudiante" && user.semilleroName)) && (
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Semillero Actual:</p>
            <p className="truncate">{selectedSemillero?.name || user.semilleroName}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <RoleIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

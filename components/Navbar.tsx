"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Settings, ImageIcon, FileText, Sun, Moon, ZoomIn, Contrast } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAccessibility } from "@/components/AccesibilityProvider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/configuracion", label: "Configuración", icon: Settings },
  { href: "/adaptador", label: "Adaptador", icon: ImageIcon },
  { href: "/docs", label: "Documentación", icon: FileText },
]

export function Navbar() {
  const pathname = usePathname()
  const { fontSize, setFontSize, highContrast, setHighContrast, isDarkMode, setIsDarkMode } = useAccessibility()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cycleFontSize = () => {
    const sizes: ("normal" | "large" | "extra-large")[] = ["normal", "large", "extra-large"]
    const currentIndex = sizes.indexOf(fontSize)
    const nextIndex = (currentIndex + 1) % sizes.length
    setFontSize(sizes[nextIndex])
  }

  const fontSizeLabels = {
    normal: "Normal",
    large: "Grande",
    "extra-large": "Muy grande",
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav
          className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8"
          aria-label="Navegación principal"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 min-h-[44px]" aria-label="Cromatizate - Ir a inicio">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
              <span className="text-xl font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">Cromatizate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium transition-colors min-h-[44px]",
                    "hover:bg-secondary focus-visible:bg-secondary",
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Accessibility Controls with Tooltips */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={cycleFontSize}
                  className="h-11 w-11 bg-transparent"
                  aria-label={`Tamaño de texto: ${fontSizeLabels[fontSize]}. Clic para cambiar.`}
                >
                  <ZoomIn className="h-5 w-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tamaño: {fontSizeLabels[fontSize]}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHighContrast(!highContrast)}
                  className="h-11 w-11"
                  aria-label={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
                  aria-pressed={highContrast}
                >
                  <Contrast className="h-5 w-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{highContrast ? "Desactivar" : "Activar"} alto contraste</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="h-11 w-11"
                  aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Moon className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modo {isDarkMode ? "claro" : "oscuro"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Mobile Menu using Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 md:hidden bg-transparent"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navegación</SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />
                <nav aria-label="Menú móvil">
                  <ul className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                              "hover:bg-secondary focus-visible:bg-secondary",
                              isActive ? "bg-secondary text-foreground" : "text-muted-foreground",
                            )}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <Icon className="h-6 w-6" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    </TooltipProvider>
  )
}

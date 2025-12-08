"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BookOpen, Settings, Code, Shield, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const sections = [
  {
    id: "introduccion",
    title: "Introducción",
    icon: BookOpen,
    items: [
      { id: "que-es", title: "¿Qué es Cromatizate?" },
      { id: "inicio-rapido", title: "Inicio rápido" },
      { id: "tipos-daltonismo", title: "Tipos de daltonismo" },
    ],
  },
  {
    id: "configuracion",
    title: "Configuración",
    icon: Settings,
    items: [
      { id: "perfil-vision", title: "Perfil de visión" },
      { id: "ajustes", title: "Ajustes de visualización" },
      { id: "preferencias", title: "Preferencias" },
    ],
  },
  {
    id: "api",
    title: "API",
    icon: Code,
    items: [
      { id: "endpoints", title: "Endpoints" },
      { id: "autenticacion", title: "Autenticación" },
      { id: "ejemplos", title: "Ejemplos de uso" },
    ],
  },
  {
    id: "accesibilidad",
    title: "Accesibilidad",
    icon: Shield,
    items: [
      { id: "wcag", title: "Cumplimiento WCAG" },
      { id: "teclado", title: "Navegación por teclado" },
      { id: "lectores", title: "Lectores de pantalla" },
    ],
  },
  {
    id: "ayuda",
    title: "Ayuda",
    icon: HelpCircle,
    items: [
      { id: "faq", title: "Preguntas frecuentes" },
      { id: "soporte", title: "Soporte técnico" },
      { id: "comunidad", title: "Comunidad" },
    ],
  },
]

export function DocsSidebar() {
  const [activeItem, setActiveItem] = useState("que-es")

  return (
    <aside className="lg:w-72 lg:flex-shrink-0" aria-label="Navegación de documentación">
      <nav className="lg:sticky lg:top-24">
        <h2 className="sr-only">Secciones de documentación</h2>
        <Accordion type="multiple" defaultValue={["introduccion"]} className="w-full">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <AccordionItem key={section.id} value={section.id} className="border-none">
                <AccordionTrigger className="h-12 px-4 text-base font-medium hover:no-underline hover:bg-secondary rounded-lg">
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{section.title}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="ml-8 mr-2 mt-1.5">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`#${item.id}`}
                          onClick={() => setActiveItem(item.id)}
                          className={cn(
                            "block px-4 py-2 rounded-lg text-base transition-colors min-h-[44px] flex items-center",
                            activeItem === item.id
                              ? "bg-secondary text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                          )}
                          aria-current={activeItem === item.id ? "page" : undefined}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </nav>
    </aside>
  )
}

import Link from "next/link"
import { Home, Settings, ImageIcon, FileText, Mail, Github, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const navLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/configuracion", label: "Configuración", icon: Settings },
  { href: "/adaptador", label: "Adaptador", icon: ImageIcon },
  { href: "/docs", label: "Documentación", icon: FileText },
]

const resourceLinks = [
  { href: "/docs", label: "Guía de uso" },
  { href: "/docs#api", label: "API" },
  { href: "/docs#accesibilidad", label: "Accesibilidad" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30" role="contentinfo" aria-label="Pie de página">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 min-h-[44px] w-fit"
              aria-label="Cromatizate - Ir a inicio"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
                <span className="text-xl font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold text-foreground">Cromatizate</span>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
              Haciendo el contenido visual accesible para todas las personas con daltonismo.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Enlaces de navegación">
            <h3 className="text-lg font-bold text-foreground mb-4">Navegación</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Recursos">
            <h3 className="text-lg font-bold text-foreground mb-4">Recursos</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                  >
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contacto@chromadapt.com"
                  className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  <span>contacto@chromadapt.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/chromadapt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                >
                  <Github className="h-5 w-5" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-muted-foreground">
            © {new Date().getFullYear()} Cromatizate. Todos los derechos reservados.
          </p>
          <p className="text-base text-muted-foreground">Diseñado con accesibilidad como prioridad.</p>
        </div>
      </div>
    </footer>
  )
}

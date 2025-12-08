import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Settings } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-background" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge using shadcn */}
          <Badge variant="secondary" className="px-4 py-2 text-base font-medium gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
            Accesibilidad impulsada por IA
          </Badge>

          {/* Main Heading */}
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance"
          >
            Contenido visual adaptado para <span className="text-accent">daltonismo</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
            Nuestra plataforma usa inteligencia artificial semántica para adaptar imágenes y colores a las necesidades
            visuales de cada persona.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-medium gap-2 w-full sm:w-auto">
              <Link href="/adaptador">
                <span>Probar adaptación</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg font-medium gap-2 w-full sm:w-auto bg-transparent"
            >
              <Link href="/configuracion">
                <Settings className="h-5 w-5" aria-hidden="true" />
                <span>Configurar mi visión</span>
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border mt-12"
            role="list"
            aria-label="Estadísticas de impacto"
          >
            <div className="text-center p-4" role="listitem">
              <p className="text-3xl md:text-4xl font-bold text-foreground">300M+</p>
              <p className="text-base text-muted-foreground mt-1">Personas con daltonismo</p>
            </div>
            <div className="text-center p-4" role="listitem">
              <p className="text-3xl md:text-4xl font-bold text-foreground">8%</p>
              <p className="text-base text-muted-foreground mt-1">Hombres afectados</p>
            </div>
            <div className="text-center p-4" role="listitem">
              <p className="text-3xl md:text-4xl font-bold text-foreground">99.9%</p>
              <p className="text-base text-muted-foreground mt-1">Precisión de adaptación</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

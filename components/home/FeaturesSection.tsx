import { Shield, Brain, Sliders, Eye, Keyboard, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Accesibilidad total",
    description:
      "Diseñado siguiendo las pautas WCAG 2.1 nivel AAA. Navegación por teclado, lectores de pantalla y alto contraste.",
  },
  {
    icon: Brain,
    title: "IA semántica",
    description:
      "Nuestro agente comprende el contexto de cada imagen para adaptar colores sin perder significado visual.",
  },
  {
    icon: Sliders,
    title: "Personalización completa",
    description: "Ajusta intensidad, contraste y saturación según tus preferencias. Tu experiencia, tus reglas.",
  },
  {
    icon: Eye,
    title: "Múltiples tipos de daltonismo",
    description: "Soporte para protanopia, deuteranopia, tritanopia y otros tipos de deficiencia de color.",
  },
  {
    icon: Keyboard,
    title: "100% navegable por teclado",
    description: "Cada función accesible sin necesidad de ratón. Atajos de teclado para usuarios avanzados.",
  },
  {
    icon: FileText,
    title: "Descripciones textuales",
    description: "Opción de generar descripciones alternativas de imágenes para máxima accesibilidad.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30" aria-labelledby="features-heading">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Características principales
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Herramientas pensadas para hacer tu experiencia visual más accesible y personalizada.
          </p>
        </div>

        {/* Features Grid */}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          role="list"
          aria-label="Lista de características"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="bg-card border-border shadow-sm hover:shadow-md transition-shadow"
                role="listitem"
              >
                <CardHeader className="pb-3">
                  <div
                    className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3"
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

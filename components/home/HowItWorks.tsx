import { Search, Palette, Brain } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  {
    icon: Search,
    title: "1. Detectar",
    description: "Subimos tu imagen y nuestro sistema analiza todos los colores y elementos visuales presentes.",
    details: "Identificación automática de paletas de colores problemáticas",
  },
  {
    icon: Brain,
    title: "2. Analizar Semántica",
    description: "La IA comprende el contexto y significado de cada elemento para preservar la información visual.",
    details: "Comprensión del propósito comunicativo de cada color",
  },
  {
    icon: Palette,
    title: "3. Adaptar",
    description: "Transformamos los colores usando algoritmos especializados para tu tipo de daltonismo.",
    details: "Resultados personalizados según tus necesidades",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Cómo funciona
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un proceso simple en tres pasos para hacer tu contenido visual accesible.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto" role="list" aria-label="Pasos del proceso">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Card
                key={step.title}
                className="bg-card border-border shadow-sm hover:shadow-md transition-shadow"
                role="listitem"
              >
                <CardHeader className="pb-4">
                  <div
                    className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl font-bold text-card-foreground">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground/80 pt-2 border-t border-border">{step.details}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

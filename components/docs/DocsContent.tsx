import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Info, Lightbulb } from "lucide-react"

export function DocsContent() {
  return (
    <article className="flex-1 max-w-3xl">
      {/* Introduction */}
      <section id="que-es" className="scroll-mt-24 mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">¿Qué es Cromatizate?</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Cromatizate es una plataforma web que adapta dinámicamente el contenido visual (imágenes, colores, elementos
          de interfaz) para diferentes tipos de daltonismo utilizando un agente de inteligencia artificial semántica.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Nuestra tecnología no solo modifica colores de forma arbitraria, sino que comprende el contexto y significado
          de cada elemento visual para preservar la información mientras la hace accesible.
        </p>

        <Alert>
          <Info className="h-5 w-5" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Esta plataforma está diseñada siguiendo las pautas WCAG 2.1 nivel AAA para garantizar la máxima
            accesibilidad.
          </AlertDescription>
        </Alert>
      </section>

      <Separator className="my-8" />

      {/* Quick Start */}
      <section id="inicio-rapido" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Inicio rápido</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Comenzar a usar Cromatizate es muy sencillo. Sigue estos pasos:
        </p>

        <ol className="space-y-6 mb-8">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              1
            </span>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Configura tu perfil de visión</h3>
              <p className="text-base text-muted-foreground">
                Ve a la página de Configuración y selecciona tu tipo de daltonismo. Ajusta los parámetros según tus
                preferencias.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              2
            </span>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Sube una imagen</h3>
              <p className="text-base text-muted-foreground">
                En la página del Adaptador, arrastra una imagen o pega una URL para comenzar el proceso de adaptación.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              3
            </span>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Descarga el resultado</h3>
              <p className="text-base text-muted-foreground">
                Una vez procesada, descarga la versión adaptada de tu imagen con los metadatos de accesibilidad
                incluidos.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <Separator className="my-8" />

      {/* Types of Color Blindness */}
      <section id="tipos-daltonismo" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Tipos de daltonismo</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          El daltonismo afecta la percepción de los colores de diferentes maneras. Cromatizate soporta los siguientes
          tipos:
        </p>

        <div className="space-y-4">
          {[
            {
              name: "Protanopia",
              description: "Ausencia de sensibilidad al rojo. Afecta aproximadamente al 1% de los hombres.",
            },
            {
              name: "Deuteranopia",
              description: "Ausencia de sensibilidad al verde. Es el tipo más común, afectando al 6% de los hombres.",
            },
            {
              name: "Tritanopia",
              description: "Ausencia de sensibilidad al azul. Es raro y afecta a menos del 0.01% de la población.",
            },
            {
              name: "Acromatopsia",
              description: "Incapacidad total para percibir colores. Solo se ven tonos de gris.",
            },
          ].map((type) => (
            <Card key={type.name} className="bg-card border-border">
              <CardContent className="flex gap-4 p-4">
                <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-bold text-card-foreground mb-1">{type.name}</h3>
                  <p className="text-base text-muted-foreground">{type.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* WCAG Compliance */}
      <section id="wcag" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Cumplimiento WCAG</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Cromatizate está diseñado para cumplir con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 nivel
          AAA, el estándar más alto de accesibilidad.
        </p>

        <Card className="bg-secondary/50 border-border mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" aria-hidden="true" />
              <span>Características de accesibilidad implementadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Contraste de color mínimo 7:1 para texto normal (AAA)",
                "Tamaño mínimo de texto de 18px",
                "Objetivos táctiles de al menos 44x44 píxeles",
                "Navegación completa por teclado",
                "Soporte para lectores de pantalla con ARIA",
                "No dependencia del color para transmitir información",
                "Modo de alto contraste disponible",
                "Textos alternativos para todas las imágenes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-base text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* Keyboard Navigation */}
      <section id="teclado" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Navegación por teclado</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Toda la plataforma es 100% navegable usando solo el teclado. Aquí están los atajos principales:
        </p>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-bold text-foreground">Tecla</th>
                    <th className="text-left py-3 px-4 font-bold text-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "Tab", action: "Navegar al siguiente elemento interactivo" },
                    { key: "Shift + Tab", action: "Navegar al elemento anterior" },
                    { key: "Enter / Space", action: "Activar botón o enlace" },
                    { key: "Escape", action: "Cerrar menú o modal" },
                    { key: "Flechas", action: "Navegar dentro de menús y sliders" },
                  ].map((row) => (
                    <tr key={row.key} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <kbd className="px-2 py-1 bg-secondary rounded text-sm font-mono">{row.key}</kbd>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>

        <div className="space-y-6">
          {[
            {
              question: "¿Es gratuito usar Cromatizate?",
              answer:
                "Sí, Cromatizate ofrece un plan gratuito con funcionalidades básicas. Para uso profesional y API, ofrecemos planes de pago.",
            },
            {
              question: "¿Mis imágenes se almacenan en sus servidores?",
              answer:
                "No. Las imágenes se procesan en tiempo real y no se almacenan en nuestros servidores. Tu privacidad es nuestra prioridad.",
            },
            {
              question: "¿Puedo usar Cromatizate en mi aplicación?",
              answer:
                "Sí, ofrecemos una API REST que puedes integrar en tu aplicación. Consulta la sección de API para más detalles.",
            },
            {
              question: "¿Funciona en dispositivos móviles?",
              answer:
                "Sí, Cromatizate es totalmente responsive y funciona en cualquier dispositivo con un navegador moderno.",
            },
          ].map((faq) => (
            <Card key={faq.question} className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-card-foreground mb-3">{faq.question}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </article>
  )
}

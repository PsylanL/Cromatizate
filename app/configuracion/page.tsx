import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ConfigurationPanel } from "@/components/configuracion/ConfigPanel"

export const metadata = {
  title: "Configuración | Cromatizate",
  description: "Configura tu tipo de daltonismo y preferencias de visualización para una experiencia personalizada.",
}

export default function ConfiguracionPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Configuración de visión
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Personaliza cómo Cromatizate adapta el contenido visual a tus necesidades.
            </p>
          </div>

          <ConfigurationPanel />
        </div>
      </main>
      <Footer />
    </>
  )
}

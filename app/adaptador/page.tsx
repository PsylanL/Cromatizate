import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { AdapterPanel } from "@/components/adaptador/AdapterPanel"

export const metadata = {
  title: "Adaptador de Imágenes | Cromatizate",
  description: "Adapta tus imágenes para diferentes tipos de daltonismo y descarga versiones accesibles.",
}

export default function AdaptadorPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Adaptador de imágenes</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sube una imagen o pega una URL para adaptarla a tu tipo de daltonismo.
            </p>
          </div>

          <AdapterPanel />
        </div>
      </main>
      <Footer />
    </>
  )
}

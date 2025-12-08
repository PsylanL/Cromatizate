import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { DocsSidebar } from "@/components/docs/DocsSidebar"
import { DocsContent } from "@/components/docs/DocsContent"

export const metadata = {
  title: "Documentación | Cromatizate",
  description: "Guía completa de uso de Cromatizate, incluyendo API, accesibilidad y mejores prácticas.",
}

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <DocsSidebar />
            <DocsContent />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

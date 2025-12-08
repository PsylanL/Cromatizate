"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, LinkIcon, Eye, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DemoSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setUploadedImage(urlInput)
    }
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 2000)
  }

  return (
    <section className="py-20 lg:py-28 bg-background" aria-labelledby="demo-heading">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 id="demo-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Demo rápida
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sube una imagen o pega una URL para ver la adaptación en acción.
          </p>
        </div>

        {/* Demo Card */}
        <Card className="max-w-4xl mx-auto bg-card border-border shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 mb-6">
                <TabsTrigger value="upload" className="h-12 text-base gap-2">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  <span>Subir imagen</span>
                </TabsTrigger>
                <TabsTrigger value="url" className="h-12 text-base gap-2">
                  <LinkIcon className="h-5 w-5" aria-hidden="true" />
                  <span>Pegar URL</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Haz clic para subir una imagen o arrastra y suelta"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                    aria-label="Seleccionar archivo de imagen"
                  />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                  <p className="text-lg font-medium text-foreground mb-2">Arrastra una imagen aquí</p>
                  <p className="text-base text-muted-foreground">o haz clic para seleccionar un archivo</p>
                  <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WEBP hasta 10MB</p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="image-url" className="text-base font-medium">
                    URL de la imagen
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="h-12 text-base"
                    />
                    <Button onClick={handleUrlSubmit} className="h-12 px-6" disabled={!urlInput.trim()}>
                      <span>Cargar</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Area */}
            {uploadedImage && (
              <div className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2" role="group" aria-label="Comparación de imágenes">
                  {/* Original */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Eye className="h-5 w-5" aria-hidden="true" />
                      <span>Original</span>
                    </h3>
                    <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Imagen original subida por el usuario"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Adapted */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Eye className="h-5 w-5" aria-hidden="true" />
                      <span>Adaptada</span>
                    </h3>
                    <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border relative">
                      {isProcessing ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-accent"
                            aria-label="Procesando imagen"
                          ></div>
                        </div>
                      ) : (
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Imagen adaptada para daltonismo"
                          className="w-full h-full object-contain"
                          style={{ filter: "hue-rotate(40deg) saturate(1.2)" }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary border border-border" role="status">
                  <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p className="text-base text-muted-foreground">
                    <strong className="text-foreground">Nota:</strong> Esta es una demostración. Para una adaptación
                    personalizada, configura tu tipo de daltonismo en la página de configuración.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={simulateProcessing} className="h-12 flex-1 text-base gap-2" disabled={isProcessing}>
                    <Eye className="h-5 w-5" aria-hidden="true" />
                    <span>Procesar de nuevo</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex-1 text-base gap-2 bg-transparent">
                    <Download className="h-5 w-5" aria-hidden="true" />
                    <span>Descargar adaptada</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

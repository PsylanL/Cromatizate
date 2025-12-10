"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Upload, LinkIcon, Download, Eye, Code, ArrowLeftRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const colorBlindnessTypes = [
  { id: "protanopia", name: "Protanopia" },
  { id: "deuteranopia", name: "Deuteranopia" },
  { id: "tritanopia", name: "Tritanopia" },
  { id: "protanomaly", name: "Protanomalía" },
  { id: "deuteranomaly", name: "Deuteranomalía" },
  { id: "tritanomaly", name: "Tritanomalía" },
  { id: "achromatopsia", name: "Acromatopsia" },
]

export function AdapterPanel() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [adaptationType, setAdaptationType] = useState("deuteranopia")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showComparison, setShowComparison] = useState(true)
  const [imageName, setImageName] = useState("")
  const [aiCaption, setAiCaption] = useState("")
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedSettings = localStorage.getItem("Cromatizate-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.type && settings.type !== "normal") {
        setAdaptationType(settings.type)
      }
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageName(file.name)
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
      setImageName(urlInput.split("/").pop() || "imagen")
    }
  }

  /**
   * Convierte una URL de imagen a base64
   */
  const urlToBase64 = useCallback(async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error converting URL to base64:', error)
      return null
    }
  }, [])

  /**
   * Obtiene la descripción de IA para una imagen
   */
  const fetchAICaption = useCallback(async (image: string) => {
    setIsGeneratingCaption(true)
    setAiCaption("") // Limpiar descripción anterior
    
    try {
      let base64Image = image
      
      // Si es una URL (no base64), convertirla primero
      if (image.startsWith('http://') || image.startsWith('https://')) {
        const converted = await urlToBase64(image)
        if (!converted) {
          throw new Error('No se pudo convertir la URL a base64')
        }
        base64Image = converted
      }
      
      // Llamar al endpoint del agente de caption
      const response = await fetch("/api/agents/caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      })
      
      const data = await response.json()
      
      if (data.success && data.caption) {
        setAiCaption(data.caption)
      } else {
        console.warn('No se pudo generar descripción de IA:', data.error || 'Unknown error')
        setAiCaption("") // Si falla, dejar vacío para usar la descripción por defecto
      }
    } catch (error) {
      console.error('Error fetching AI caption:', error)
      setAiCaption("") // Si falla, dejar vacío para usar la descripción por defecto
    } finally {
      setIsGeneratingCaption(false)
    }
  }, [urlToBase64])

  // Llamar al agente de caption cuando se carga una imagen
  useEffect(() => {
    if (uploadedImage) {
      void fetchAICaption(uploadedImage)
    } else {
      // Si no hay imagen, limpiar la descripción
      setAiCaption("")
    }
  }, [uploadedImage, fetchAICaption])

  const getAdaptationFilter = () => {
    const hueRotations: Record<string, number> = {
      protanopia: 40,
      deuteranopia: -40,
      tritanopia: 180,
      protanomaly: 20,
      deuteranomaly: -20,
      tritanomaly: 90,
      achromatopsia: 0,
    }

    const filters = [`hue-rotate(${hueRotations[adaptationType] || 0}deg)`]

    if (adaptationType === "achromatopsia") {
      filters.push("grayscale(100%)")
    }

    return filters.join(" ")
  }

  const processImage = () => {
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 1500)
  }

  // Memoizar el JSON-LD para que se regenere solo cuando cambien las dependencias
  const jsonLd = useMemo(() => {
    // Si NO hay imagen cargada, retornar objeto vacío
    if (!uploadedImage) {
      return JSON.stringify({}, null, 2)
    }

    // Obtener el nombre legible del tipo de daltonismo
    const adaptationTypeName = colorBlindnessTypes.find((t) => t.id === adaptationType)?.name || adaptationType

    // Usar descripción de IA si está disponible, sino usar la descripción por defecto
    const description = aiCaption || `Imagen adaptada para ${adaptationTypeName}`

    // Construir el objeto JSON-LD con todos los campos requeridos
    const jsonLdObject: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "name": imageName || "imagen",
      "contentUrl": uploadedImage,
      "image": uploadedImage,
      "representativeOfPage": true,
      "description": description,
      "accessibilityFeature": [
        "colorAdaptation",
        `${adaptationType}Simulation`
      ],
      "accessibilityHazard": "none",
      "inLanguage": "es",
      "creator": {
        "@type": "Organization",
        "name": "Cromatizate"
      },
      "dateModified": new Date().toISOString()
    }

    // Agregar descripción generada por IA si está disponible
    if (aiCaption) {
      jsonLdObject["aiGeneratedDescription"] = aiCaption
    }

    return JSON.stringify(jsonLdObject, null, 2)
  }, [uploadedImage, imageName, adaptationType, aiCaption])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Upload Section */}
      <Card className="bg-card border-border">
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
                    Cargar
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image Processing Section */}
      {uploadedImage && (
        <>
          {/* Controls */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="adaptation-type" className="text-base font-medium">
                    Tipo de adaptación
                  </Label>
                  <Select value={adaptationType} onValueChange={setAdaptationType}>
                    <SelectTrigger id="adaptation-type" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorBlindnessTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="text-base">
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={processImage} className="h-12 px-6 text-base gap-2" disabled={isProcessing}>
                  <RefreshCw className={`h-5 w-5 ${isProcessing ? "animate-spin" : ""}`} aria-hidden="true" />
                  <span>{isProcessing ? "Procesando..." : "Procesar"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                  className="h-12 px-6 text-base gap-2"
                  aria-pressed={showComparison}
                >
                  <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
                  <span>{showComparison ? "Vista única" : "Comparar"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Image Comparison */}
          <div
            className={`grid gap-6 ${showComparison ? "lg:grid-cols-2" : ""}`}
            role="group"
            aria-label="Comparación de imágenes"
          >
            {/* Original */}
            {showComparison && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Eye className="h-5 w-5" aria-hidden="true" />
                    <span>Imagen original</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Imagen original subida por el usuario"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adapted */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Eye className="h-5 w-5" aria-hidden="true" />
                  <span>Imagen adaptada</span>
                  <Badge variant="secondary" className="ml-2">
                    {colorBlindnessTypes.find((t) => t.id === adaptationType)?.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border relative">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                      <div
                        className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-accent"
                        aria-label="Procesando imagen"
                      ></div>
                    </div>
                  ) : (
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt={`Imagen adaptada para ${colorBlindnessTypes.find((t) => t.id === adaptationType)?.name}`}
                      className="w-full h-full object-contain"
                      style={{ filter: getAdaptationFilter() }}
                    />
                  )}
                </div>
                <Button variant="outline" className="w-full h-12 text-base gap-2 bg-transparent">
                  <Download className="h-5 w-5" aria-hidden="true" />
                  <span>Descargar versión accesible</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* JSON-LD Metadata */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Code className="h-5 w-5" aria-hidden="true" />
                <span>Metadatos JSON-LD</span>
                {isGeneratingCaption && (
                  <Badge variant="secondary" className="ml-2">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" aria-hidden="true" />
                    Generando descripción con IA...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-sm text-muted-foreground font-mono">
                <code>{jsonLd}</code>
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

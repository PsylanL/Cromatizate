"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Save, RotateCcw, Check } from "lucide-react"

const colorBlindnessTypes = [
  {
    id: "normal",
    name: "Visión normal",
    description: "Sin adaptación de daltonismo",
  },
  {
    id: "protanopia",
    name: "Protanopia",
    description: "Dificultad para percibir el color rojo",
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia",
    description: "Dificultad para percibir el color verde",
  },
  {
    id: "tritanopia",
    name: "Tritanopia",
    description: "Dificultad para percibir el color azul",
  },
  {
    id: "protanomaly",
    name: "Protanomalía",
    description: "Sensibilidad reducida al rojo",
  },
  {
    id: "deuteranomaly",
    name: "Deuteranomalía",
    description: "Sensibilidad reducida al verde",
  },
  {
    id: "tritanomaly",
    name: "Tritanomalía",
    description: "Sensibilidad reducida al azul",
  },
  {
    id: "achromatopsia",
    name: "Acromatopsia",
    description: "Incapacidad total para percibir colores",
  },
]

export function ConfigurationPanel() {
  const [selectedType, setSelectedType] = useState("normal")
  const [intensity, setIntensity] = useState([70])
  const [contrast, setContrast] = useState([100])
  const [saturation, setSaturation] = useState([100])
  const [textDescriptions, setTextDescriptions] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load from Supabase FIRST (source of truth - Agente de Perfilado)
    const loadFromBackend = async () => {
      try {
        const response = await fetch('/api/users/preferences', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('📥 Loading from Supabase (source of truth):', data)
          
          if (data.success && data.data) {
            const prefs = data.data.preferences || {}
            
            // Load colorProfile - check both colorProfile and preferences.type
            const savedType = data.data.colorProfile || prefs.type || "normal"
            console.log('🎨 Setting type from backend:', savedType)
            
            // Apply preferences from backend (source of truth)
            setSelectedType(savedType)
            setIntensity([prefs.intensity ?? 70])
            setContrast([prefs.contrast ?? 100])
            setSaturation([prefs.saturation ?? 100])
            
            if (data.data.labelPreference) {
              setTextDescriptions(data.data.labelPreference === 'enabled')
            } else if (prefs.textDescriptions !== undefined) {
              setTextDescriptions(prefs.textDescriptions)
            } else {
              setTextDescriptions(false)
            }
            
            // Cache in localStorage for fast access and offline support
            const cachedSettings = {
              type: savedType,
              intensity: prefs.intensity ?? 70,
              contrast: prefs.contrast ?? 100,
              saturation: prefs.saturation ?? 100,
              textDescriptions: prefs.textDescriptions ?? false
            }
            localStorage.setItem("Cromatizate-settings", JSON.stringify(cachedSettings))
            console.log('💾 Cached in localStorage:', cachedSettings)
            
            return // Successfully loaded from backend
          }
        } else {
          console.warn('⚠️ Backend response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Error loading from backend:', error)
      }
      
      // Fallback to localStorage if backend fails (offline mode)
      console.log('📦 Falling back to localStorage cache')
      const savedSettings = localStorage.getItem("Cromatizate-settings")
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          console.log('📦 Loading from localStorage (fallback):', settings)
          setSelectedType(settings.type || "normal")
          setIntensity([settings.intensity || 70])
          setContrast([settings.contrast || 100])
          setSaturation([settings.saturation || 100])
          setTextDescriptions(settings.textDescriptions || false)
        } catch (error) {
          console.error('❌ Invalid localStorage JSON:', error)
        }
      }
    }
    
    loadFromBackend()
  }, [])

  const handleSave = async () => {
    const settings = {
      type: selectedType,
      intensity: intensity[0],
      contrast: contrast[0],
      saturation: saturation[0],
      textDescriptions,
    }
    
    // Save to Supabase FIRST (source of truth - Agente de Perfilado)
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          colorProfile: selectedType === 'normal' ? null : selectedType,
          contrastLevel: `${contrast[0]}%`,
          labelPreference: textDescriptions ? 'enabled' : 'disabled',
          preferences: {
            intensity: intensity[0],
            saturation: saturation[0],
            contrast: contrast[0],
            textDescriptions,
            type: selectedType // Always keep type in preferences for easy retrieval
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Failed to save to Supabase:', errorData)
        // Show error to user - this is critical for the Agente de Perfilado
        alert('Error al guardar preferencias. Por favor, intenta de nuevo.')
        return
      }
      
      const responseData = await response.json()
      console.log('✅ Saved to Supabase (source of truth):', responseData)
      
      // Cache in localStorage AFTER successful save (for fast access and offline)
      localStorage.setItem("Cromatizate-settings", JSON.stringify(settings))
      console.log('💾 Cached in localStorage:', settings)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('❌ Error saving to Supabase:', error)
      alert('Error de conexión al guardar preferencias. Verifica tu conexión e intenta de nuevo.')
      // Don't cache if save failed - keep localStorage in sync with backend
    }
  }

  const handleReset = () => {
    setSelectedType("normal")
    setIntensity([70])
    setContrast([100])
    setSaturation([100])
    setTextDescriptions(false)
  }

  const getPreviewFilter = () => {
    const filters = []

    if (selectedType !== "normal") {
      const hueRotations: Record<string, number> = {
        protanopia: 40,
        deuteranopia: -40,
        tritanopia: 180,
        protanomaly: 20,
        deuteranomaly: -20,
        tritanomaly: 90,
        achromatopsia: 0,
      }
      filters.push(`hue-rotate(${hueRotations[selectedType] || 0}deg)`)
    }

    if (selectedType === "achromatopsia") {
      filters.push(`grayscale(100%)`)
    }

    filters.push(`contrast(${contrast[0]}%)`)
    filters.push(`saturate(${saturation[0]}%)`)

    return filters.join(" ")
  }

  return (
    <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-2">
      {/* Settings Panel */}
      <div className="space-y-6">
        {/* Color Blindness Type */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <Eye className="h-5 w-5" aria-hidden="true" />
              <span>Tipo de daltonismo</span>
            </CardTitle>
            <CardDescription className="text-base">Selecciona el tipo que mejor describe tu visión</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedType}
              onValueChange={setSelectedType}
              className="space-y-3"
              aria-label="Tipo de daltonismo"
            >
              {colorBlindnessTypes.map((type) => (
                <div key={type.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1 h-5 w-5" />
                  <Label htmlFor={type.id} className="flex flex-col cursor-pointer">
                    <span className="text-base font-medium text-foreground">{type.name}</span>
                    <span className="text-sm text-muted-foreground">{type.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Adjustments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-card-foreground">Ajustes de visualización</CardTitle>
            <CardDescription className="text-base">Personaliza la intensidad de la adaptación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Intensity */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="intensity" className="text-base font-medium">
                  Intensidad de adaptación
                </Label>
                <Badge variant="secondary">{intensity[0]}%</Badge>
              </div>
              <Slider
                id="intensity"
                value={intensity}
                onValueChange={setIntensity}
                min={0}
                max={100}
                step={5}
                className="w-full"
                aria-label={`Intensidad de adaptación: ${intensity[0]}%`}
              />
            </div>

            {/* Contrast */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="contrast" className="text-base font-medium">
                  Contraste
                </Label>
                <Badge variant="secondary">{contrast[0]}%</Badge>
              </div>
              <Slider
                id="contrast"
                value={contrast}
                onValueChange={setContrast}
                min={50}
                max={150}
                step={5}
                className="w-full"
                aria-label={`Contraste: ${contrast[0]}%`}
              />
            </div>

            {/* Saturation */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="saturation" className="text-base font-medium">
                  Saturación
                </Label>
                <Badge variant="secondary">{saturation[0]}%</Badge>
              </div>
              <Slider
                id="saturation"
                value={saturation}
                onValueChange={setSaturation}
                min={0}
                max={200}
                step={5}
                className="w-full"
                aria-label={`Saturación: ${saturation[0]}%`}
              />
            </div>

            <Separator />

            {/* Text Descriptions */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label htmlFor="text-descriptions" className="text-base font-medium">
                  Descripciones textuales
                </Label>
                <p className="text-sm text-muted-foreground">Genera descripciones alternativas de imágenes</p>
              </div>
              <Switch
                id="text-descriptions"
                checked={textDescriptions}
                onCheckedChange={setTextDescriptions}
                aria-label="Activar descripciones textuales"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1 h-12 text-base gap-2">
            {saved ? (
              <>
                <Check className="h-5 w-5" aria-hidden="true" />
                <span>Guardado</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" aria-hidden="true" />
                <span>Guardar configuración</span>
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" className="h-12 text-base gap-2 bg-transparent">
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            <span>Restablecer</span>
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-6">
        <Card className="bg-card border-border sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-card-foreground">Vista previa</CardTitle>
            <CardDescription className="text-base">Así se verán las imágenes con tu configuración</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sample Image */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-foreground">Imagen de muestra</h3>
              <div
                className="aspect-video rounded-lg overflow-hidden border border-border"
                style={{ filter: getPreviewFilter() }}
              >
                <img
                  src="/colorful-landscape-with-flowers.jpg"
                  alt="Imagen de muestra con paisaje colorido adaptada según tu configuración"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Color Palette Preview */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-foreground">Paleta de colores</h3>
              <div
                className="grid grid-cols-6 gap-2"
                style={{ filter: getPreviewFilter() }}
                role="img"
                aria-label="Vista previa de paleta de colores adaptada"
              >
                {["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"].map((color) => (
                  <div
                    key={color}
                    className="aspect-square rounded-lg border border-border"
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Current Settings Summary */}
            <div className="p-4 bg-secondary rounded-lg space-y-2">
              <h3 className="text-base font-bold text-foreground">Configuración actual</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Tipo:</strong> {colorBlindnessTypes.find((t) => t.id === selectedType)?.name}
                </li>
                <li>
                  <strong>Intensidad:</strong> {intensity[0]}%
                </li>
                <li>
                  <strong>Contraste:</strong> {contrast[0]}%
                </li>
                <li>
                  <strong>Saturación:</strong> {saturation[0]}%
                </li>
                <li>
                  <strong>Descripciones:</strong> {textDescriptions ? "Activadas" : "Desactivadas"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

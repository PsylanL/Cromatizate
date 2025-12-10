"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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

  // NORMALIZED: Load from backend - preferences.type is the single source of truth
  const loadFromBackend = async () => {
    try {
      const response = await fetch('/api/users/preferences', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📥 [BACKEND] Loading from Supabase (source of truth):', data)
        }
        
        if (data.success && data.data) {
          const prefs = data.data.preferences || {}
          
          // Check if preferences object is empty (new visitor or no preferences saved yet)
          const hasPreferences = Object.keys(prefs).length > 0 && prefs.type !== undefined
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📥 [BACKEND] Loaded preferences:', {
              hasPreferences,
              preferences: prefs,
              colorBlindness: data.data.colorBlindness,
              preferencesKeys: Object.keys(prefs),
              hasType: prefs.type !== undefined
            })
          }
          
          // Only apply preferences if they exist, otherwise fall through to localStorage
          if (hasPreferences) {
            // Frontend owns state - load raw preferences from backend
            const savedType = (prefs.type as string) || data.data.colorBlindness || "normal"
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🎨 [BACKEND] Applying preferences from backend:', savedType)
            }
            
            // Apply ALL preferences from backend (source of truth)
            setSelectedType(savedType)
            setIntensity([typeof prefs.intensity === 'number' ? prefs.intensity : 70])
            setContrast([typeof prefs.contrast === 'number' ? prefs.contrast : 100])
            setSaturation([typeof prefs.saturation === 'number' ? prefs.saturation : 100])
            setTextDescriptions(typeof prefs.textDescriptions === 'boolean' ? prefs.textDescriptions : false)
            
            // Cache in localStorage ONLY after successful backend load
            const cachedSettings = {
              type: savedType,
              intensity: typeof prefs.intensity === 'number' ? prefs.intensity : 70,
              contrast: typeof prefs.contrast === 'number' ? prefs.contrast : 100,
              saturation: typeof prefs.saturation === 'number' ? prefs.saturation : 100,
              textDescriptions: typeof prefs.textDescriptions === 'boolean' ? prefs.textDescriptions : false
            }
            localStorage.setItem("Cromatizate-settings", JSON.stringify(cachedSettings))
            
            if (process.env.NODE_ENV === 'development') {
              console.log('💾 [BACKEND] Cached in localStorage:', cachedSettings)
            }
            
            return true // Successfully loaded from backend
          } else {
            // No preferences in backend - will fall through to localStorage check
            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ [BACKEND] No valid preferences in backend (empty or missing type), will check localStorage')
            }
          }
        }
      } else {
        console.warn('⚠️ [BACKEND] Response not OK:', response.status)
      }
    } catch (error) {
      console.error('❌ [BACKEND] Error loading from backend:', error)
    }
    
    // Fallback to localStorage ONLY if backend fails (offline mode)
    console.log('📦 [FALLBACK] Falling back to localStorage cache')
    const savedSettings = localStorage.getItem("Cromatizate-settings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        console.log('📦 [FALLBACK] Loading from localStorage:', settings)
        setSelectedType(settings.type || "normal")
        setIntensity([settings.intensity || 70])
        setContrast([settings.contrast || 100])
        setSaturation([settings.saturation || 100])
        setTextDescriptions(settings.textDescriptions || false)
        return false // Loaded from fallback
      } catch (error) {
        console.error('❌ [FALLBACK] Invalid localStorage JSON:', error)
      }
    }
    
    return false // No data loaded
  }

  // Load on mount
  useEffect(() => {
    // Load preferences from backend on mount
    // setState is called inside async function, not synchronously
    void loadFromBackend()
  }, [])

  const handleSave = async () => {
    // Build complete preferences object with ALL fields
    const completePreferences = {
      type: selectedType, // NORMALIZED: Single source of truth
      intensity: intensity[0],
      contrast: contrast[0],
      saturation: saturation[0],
      textDescriptions,
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 [SAVE] Saving preferences:', completePreferences)
    }
    
    // Save to Supabase FIRST (source of truth - Agente de Perfilado)
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: completePreferences // Frontend sends complete preferences object
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [SAVE] Failed to save to Supabase:', errorData)
        alert('Error al guardar preferencias. Por favor, intenta de nuevo.')
        return
      }
      
      const responseData = await response.json()
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [SAVE] Saved to Supabase (source of truth):', responseData)
        console.log('✅ [SAVE] Response data preferences:', responseData.data?.preferences)
      }
      
      // Update UI from response - backend returns exactly what we sent
      if (responseData.success && responseData.data?.preferences) {
        const savedPrefs = responseData.data.preferences
        const savedType = typeof savedPrefs.type === "string" ? savedPrefs.type : selectedType
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [SAVE] Backend confirmed save:', savedPrefs)
        }
        
        // Update state from response (should match what we sent)
        setSelectedType(savedType)
        setIntensity([typeof savedPrefs.intensity === 'number' ? savedPrefs.intensity : intensity[0]])
        setContrast([typeof savedPrefs.contrast === 'number' ? savedPrefs.contrast : contrast[0]])
        setSaturation([typeof savedPrefs.saturation === 'number' ? savedPrefs.saturation : saturation[0]])
        setTextDescriptions(typeof savedPrefs.textDescriptions === 'boolean' ? savedPrefs.textDescriptions : textDescriptions)
        
        // Cache in localStorage
        localStorage.setItem("Cromatizate-settings", JSON.stringify(completePreferences))
        
        if (process.env.NODE_ENV === 'development') {
          console.log('💾 [SAVE] Cached in localStorage:', completePreferences)
        }
        
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        console.warn('⚠️ [SAVE] Response missing preferences')
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('❌ [SAVE] Error saving to Supabase:', error)
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
                <Image
                  src="/colorful-landscape-with-flowers.jpg.png"
                  alt="Imagen de muestra con paisaje colorido adaptada según tu configuración"
                  className="w-full h-full object-cover"
                  width={600}
                  height={400}
                  priority
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

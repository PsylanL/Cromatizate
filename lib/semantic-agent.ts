/**
 * Semantic Agent - Motor de Inferencias/Triple Store
 * 
 * Procesa contenido visual, infiere descripciones semánticas y genera
 * adaptaciones basadas en ontologías (daltonismo, colores, contenido visual)
 */

import { ColorBlindnessType, ADAPTATION_RULES } from './ontology-helpers'

export interface VisualContent {
  type: 'image' | 'color' | 'object' | 'text'
  source?: string
  colors?: string[]
  objects?: string[]
  metadata?: Record<string, unknown>
}

export interface ColorAnalysis {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name?: string
  accessibility?: {
    contrast: number
    problematicFor?: ColorBlindnessType[]
  }
}

export interface SemanticDescription {
  type: 'image' | 'color' | 'object'
  description: string
  alternativeText: string
  colorBlindnessAdaptations?: Record<ColorBlindnessType, string>
}

/**
 * Generate Visual Content Ontology (JSON-LD)
 * Define conceptos: Imagen, Color, Objeto, AtributoColor, DescripciónTextual
 */
export function generateVisualContentOntology(): Record<string, unknown> {
  return {
    "@context": {
      "@vocab": "https://schema.org/",
      "cromatizate": "https://cromatizate.example.org/vocab#",
      "accessibility": "https://www.w3.org/TR/wai-aria/#",
      "dcterms": "http://purl.org/dc/terms/"
    },
    "@type": "cromatizate:VisualContentOntology",
    "cromatizate:defines": [
      {
        "@type": "cromatizate:Image",
        "cromatizate:hasProperty": [
          "cromatizate:hasColor",
          "cromatizate:hasObject",
          "cromatizate:hasTextualDescription",
          "cromatizate:hasColorAttribute"
        ]
      },
      {
        "@type": "cromatizate:Color",
        "cromatizate:hasProperty": [
          "cromatizate:hexValue",
          "cromatizate:rgbValue",
          "cromatizate:accessibilityRating",
          "cromatizate:problematicFor"
        ]
      },
      {
        "@type": "cromatizate:Object",
        "cromatizate:hasProperty": [
          "cromatizate:name",
          "cromatizate:colorAttributes",
          "cromatizate:semanticRole"
        ]
      },
      {
        "@type": "cromatizate:ColorAttribute",
        "cromatizate:hasProperty": [
          "cromatizate:color",
          "cromatizate:meaning",
          "cromatizate:importance"
        ]
      },
      {
        "@type": "cromatizate:TextualDescription",
        "cromatizate:hasProperty": [
          "cromatizate:description",
          "cromatizate:alternativeText",
          "cromatizate:colorBlindnessAdaptations"
        ]
      }
    ],
    "dateModified": new Date().toISOString()
  }
}

/**
 * Analyze colors and detect accessibility issues
 */
export function analyzeColors(colors: string[]): ColorAnalysis[] {
  return colors.map(hex => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    
    // Detect problematic colors for different types of color blindness
    const problematicFor: ColorBlindnessType[] = []
    
    // Simple heuristics: red-green confusion
    if (isRedGreenConfusion(rgb)) {
      problematicFor.push('protanopia', 'deuteranopia', 'protanomaly', 'deuteranomaly')
    }
    
    // Blue-yellow confusion
    if (isBlueYellowConfusion(rgb)) {
      problematicFor.push('tritanopia', 'tritanomaly')
    }
    
    return {
      hex,
      rgb,
      hsl,
      accessibility: {
        contrast: calculateContrast(rgb, { r: 255, g: 255, b: 255 }), // vs white
        problematicFor
      }
    }
  })
}

/**
 * Infer semantic descriptions from visual content
 */
export function inferSemanticDescriptions(
  content: VisualContent,
  colorBlindnessType?: ColorBlindnessType
): SemanticDescription[] {
  const descriptions: SemanticDescription[] = []
  
  if (content.type === 'image' && content.colors && content.objects) {
    // Analyze colors
    const colorAnalysis = analyzeColors(content.colors)
    const problematicColors = colorAnalysis.filter(c => 
      c.accessibility?.problematicFor.includes(colorBlindnessType || 'deuteranopia')
    )
    
    // Generate description
    let description = `Imagen que contiene ${content.objects.length} objeto(s) principal(es)`
    if (content.colors.length > 0) {
      description += ` con una paleta de ${content.colors.length} colores`
    }
    
    if (problematicColors.length > 0 && colorBlindnessType) {
      description += `. Algunos colores pueden ser difíciles de distinguir para usuarios con ${colorBlindnessType}`
    }
    
    // Generate alternative text
    let alternativeText = content.objects.join(', ')
    if (content.colors.length > 0) {
      alternativeText += `. Colores principales: ${content.colors.slice(0, 3).join(', ')}`
    }
    
    // Generate adaptations for different color blindness types
    const adaptations: Record<string, string> = {}
    if (colorBlindnessType) {
      const rule = ADAPTATION_RULES[colorBlindnessType]
      adaptations[colorBlindnessType] = rule.textualDescription
    }
    
    descriptions.push({
      type: 'image',
      description,
      alternativeText,
      colorBlindnessAdaptations: adaptations as Record<ColorBlindnessType, string>
    })
  }
  
  if (content.type === 'color' && content.colors) {
    content.colors.forEach(hex => {
      const analysis = analyzeColors([hex])[0]
      const description = `Color ${hex}`
      let alternativeText = `Color hexadecimal ${hex}`
      
      if (analysis.accessibility?.problematicFor.length) {
        alternativeText += `. Puede ser problemático para: ${analysis.accessibility.problematicFor.join(', ')}`
      }
      
      descriptions.push({
        type: 'color',
        description,
        alternativeText
      })
    })
  }
  
  return descriptions
}

/**
 * Process visual content and generate semantic metadata (JSON-LD)
 */
export function processVisualContent(
  content: VisualContent,
  colorBlindnessType?: ColorBlindnessType
): Record<string, unknown> {
  const colorAnalysis = content.colors ? analyzeColors(content.colors) : []
  const semanticDescriptions = inferSemanticDescriptions(content, colorBlindnessType)
  
  // Generate JSON-LD metadata
  const jsonld: Record<string, unknown> = {
    "@context": {
      "@vocab": "https://schema.org/",
      "cromatizate": "https://cromatizate.example.org/vocab#",
      "accessibility": "https://www.w3.org/TR/wai-aria/#"
    },
    "@type": "cromatizate:VisualContent",
    "cromatizate:contentType": content.type,
    "cromatizate:source": content.source || "unknown",
    "dateModified": new Date().toISOString()
  }
  
  // Add color information
  if (colorAnalysis.length > 0) {
    jsonld["cromatizate:colors"] = colorAnalysis.map(c => ({
      "@type": "cromatizate:Color",
      "cromatizate:hexValue": c.hex,
      "cromatizate:rgbValue": `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      "cromatizate:accessibilityRating": c.accessibility?.contrast || 0,
      "cromatizate:problematicFor": c.accessibility?.problematicFor || []
    }))
  }
  
  // Add object information
  if (content.objects && content.objects.length > 0) {
    jsonld["cromatizate:objects"] = content.objects.map(obj => ({
      "@type": "cromatizate:Object",
      "cromatizate:name": obj,
      "cromatizate:semanticRole": "content"
    }))
  }
  
  // Add textual descriptions
  if (semanticDescriptions.length > 0) {
    jsonld["cromatizate:textualDescriptions"] = semanticDescriptions.map(desc => ({
      "@type": "cromatizate:TextualDescription",
      "cromatizate:description": desc.description,
      "cromatizate:alternativeText": desc.alternativeText,
      "cromatizate:colorBlindnessAdaptations": desc.colorBlindnessAdaptations || {}
    }))
  }
  
  // Add accessibility features
  jsonld["accessibility:accessibilityFeature"] = []
  if (semanticDescriptions.length > 0) {
    jsonld["accessibility:accessibilityFeature"].push("textualDescription")
  }
  if (colorBlindnessType && colorBlindnessType !== 'normal') {
    jsonld["accessibility:accessibilityFeature"].push("colorAdaptation")
    jsonld["cromatizate:adaptedFor"] = colorBlindnessType
  }
  
  return jsonld
}

/**
 * Generate adaptation suggestions based on semantic analysis
 */
export function generateAdaptationSuggestions(
  content: VisualContent,
  colorBlindnessType: ColorBlindnessType,
  colorAnalysis: ColorAnalysis[]
): Array<Record<string, unknown>> {
  const suggestions: Array<Record<string, unknown>> = []
  const rule = ADAPTATION_RULES[colorBlindnessType]
  
  // Check for problematic colors
  const problematicColors = colorAnalysis.filter(c => 
    c.accessibility?.problematicFor.includes(colorBlindnessType)
  )
  
  if (problematicColors.length > 0) {
    suggestions.push({
      type: 'color_replacement',
      content: {
        problematicColors: problematicColors.map(c => c.hex),
        suggestedPalette: rule.palette,
        reason: `Algunos colores pueden ser difíciles de distinguir para ${colorBlindnessType}. Se sugiere usar la paleta adaptada.`,
        confidence: 0.85
      },
      source: 'semantic_analysis'
    })
  }
  
  // Contrast suggestions
  const avgContrast = colorAnalysis.length > 0
    ? colorAnalysis.reduce((sum, c) => sum + (c.accessibility?.contrast || 0), 0) / colorAnalysis.length
    : 1.0
  
  if (avgContrast < rule.contrast) {
    suggestions.push({
      type: 'contrast_enhancement',
      content: {
        currentContrast: avgContrast,
        suggestedContrast: rule.contrast,
        reason: `El contraste promedio (${avgContrast.toFixed(2)}) es menor al recomendado para ${colorBlindnessType} (${rule.contrast})`,
        confidence: 0.8
      },
      source: 'semantic_analysis'
    })
  }
  
  // Saturation suggestions
  const avgSaturation = colorAnalysis.length > 0
    ? colorAnalysis.reduce((sum, c) => sum + c.hsl.s, 0) / colorAnalysis.length
    : 0.5
  
  if (Math.abs(avgSaturation - rule.saturation) > 0.1) {
    suggestions.push({
      type: 'saturation_adjustment',
      content: {
        currentSaturation: avgSaturation,
        suggestedSaturation: rule.saturation,
        reason: `Ajustar saturación a ${rule.saturation} para mejorar la percepción en ${colorBlindnessType}`,
        confidence: 0.75
      },
      source: 'semantic_analysis'
    })
  }
  
  return suggestions
}

// Helper functions

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return { h: h * 360, s, l }
}

function isRedGreenConfusion(rgb: { r: number; g: number; b: number }): boolean {
  // Red and green are close in value but different in hue
  const redGreenDiff = Math.abs(rgb.r - rgb.g)
  const brightness = (rgb.r + rgb.g) / 2
  return redGreenDiff < 50 && brightness > 100
}

function isBlueYellowConfusion(rgb: { r: number; g: number; b: number }): boolean {
  // Blue and yellow confusion (less common)
  return rgb.b > 150 && rgb.r > 150 && rgb.g > 150
}

function calculateContrast(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}



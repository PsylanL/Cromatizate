/**
 * Helper functions for ontology processing and adaptation rules
 */

export type ColorBlindnessType = 
  | 'protanopia' 
  | 'deuteranopia' 
  | 'tritanopia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'normal'

export interface AdaptationRule {
  type: ColorBlindnessType
  palette: string[]
  contrast: number
  saturation: number
  textualDescription: string
  filters: string[]
}

/**
 * Default adaptation rules based on color blindness types
 */
export const ADAPTATION_RULES: Record<ColorBlindnessType, AdaptationRule> = {
  protanopia: {
    type: 'protanopia',
    palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    contrast: 1.2,
    saturation: 0.8,
    textualDescription: 'Adaptado para protanopia: se enfatizan tonos azules y verdes, evitando rojos',
    filters: ['hue-rotate(40deg)']
  },
  deuteranopia: {
    type: 'deuteranopia',
    palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    contrast: 1.2,
    saturation: 0.8,
    textualDescription: 'Adaptado para deuteranopia: se enfatizan tonos azules y rojos, evitando verdes',
    filters: ['hue-rotate(-40deg)']
  },
  tritanopia: {
    type: 'tritanopia',
    palette: ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF', '#9B59B6'],
    contrast: 1.3,
    saturation: 0.9,
    textualDescription: 'Adaptado para tritanopia: se enfatizan tonos rojos y verdes, evitando azules',
    filters: ['hue-rotate(180deg)']
  },
  protanomaly: {
    type: 'protanomaly',
    palette: ['#FF8C8C', '#5ED5C8', '#55C7E1', '#FFB88A', '#A8E8D8'],
    contrast: 1.1,
    saturation: 0.85,
    textualDescription: 'Adaptado para protanomalía: ligera modificación hacia tonos azules y verdes',
    filters: ['hue-rotate(20deg)']
  },
  deuteranomaly: {
    type: 'deuteranomaly',
    palette: ['#FF8C8C', '#5ED5C8', '#55C7E1', '#FFB88A', '#A8E8D8'],
    contrast: 1.1,
    saturation: 0.85,
    textualDescription: 'Adaptado para deuteranomalía: ligera modificación hacia tonos azules y rojos',
    filters: ['hue-rotate(-20deg)']
  },
  tritanomaly: {
    type: 'tritanomaly',
    palette: ['#FF8C8C', '#FFE04D', '#7BCF8F', '#5DA6FF', '#AB69C6'],
    contrast: 1.15,
    saturation: 0.9,
    textualDescription: 'Adaptado para tritanomalía: ligera modificación hacia tonos rojos y verdes',
    filters: ['hue-rotate(90deg)']
  },
  achromatopsia: {
    type: 'achromatopsia',
    palette: ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
    contrast: 1.5,
    saturation: 0,
    textualDescription: 'Adaptado para acromatopsia: escala de grises con alto contraste',
    filters: ['grayscale(100%)']
  },
  normal: {
    type: 'normal',
    palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    contrast: 1.0,
    saturation: 1.0,
    textualDescription: 'Sin adaptación requerida',
    filters: []
  }
}

/**
 * Generate JSON-LD ontology for color blindness adaptation
 */
export function generateColorBlindnessOntology(type: ColorBlindnessType): any {
  const rule = ADAPTATION_RULES[type]
  
  return {
    "@context": {
      "@vocab": "https://schema.org/",
      "cromatizate": "https://cromatizate.example.org/vocab#",
      "accessibility": "https://www.w3.org/TR/wai-aria/#"
    },
    "@type": "cromatizate:ColorBlindnessAdaptation",
    "cromatizate:colorBlindnessType": type,
    "cromatizate:palette": rule.palette,
    "cromatizate:contrast": rule.contrast,
    "cromatizate:saturation": rule.saturation,
    "cromatizate:textualDescription": rule.textualDescription,
    "cromatizate:filters": rule.filters,
    "accessibility:accessibilityFeature": [
      "colorAdaptation",
      `${type}Simulation`
    ],
    "accessibility:accessibilityHazard": "none",
    "dateModified": new Date().toISOString()
  }
}

/**
 * Generate recommendations based on user interactions and color blindness type
 */
export function generateRecommendations(
  colorBlindnessType: ColorBlindnessType | null,
  interactions: any[],
  preferences: any
): any[] {
  const recommendations: any[] = []
  
  if (!colorBlindnessType || colorBlindnessType === 'normal') {
    return recommendations
  }

  const rule = ADAPTATION_RULES[colorBlindnessType]
  
  // Palette recommendation
  recommendations.push({
    type: 'palette',
    content: {
      suggestedPalette: rule.palette,
      reason: rule.textualDescription,
      confidence: 0.9
    },
    source: 'ontology'
  })

  // Contrast recommendation based on interactions
  const contrastPref = preferences?.contrast || rule.contrast
  if (contrastPref < rule.contrast) {
    recommendations.push({
      type: 'contrast',
      content: {
        suggestedContrast: rule.contrast,
        currentContrast: contrastPref,
        reason: `Para ${colorBlindnessType}, se recomienda un contraste mínimo de ${rule.contrast}`,
        confidence: 0.8
      },
      source: 'interaction'
    })
  }

  // Saturation recommendation
  const saturationPref = preferences?.saturation || rule.saturation
  if (Math.abs(saturationPref - rule.saturation) > 0.1) {
    recommendations.push({
      type: 'saturation',
      content: {
        suggestedSaturation: rule.saturation,
        currentSaturation: saturationPref,
        reason: `Saturación óptima para ${colorBlindnessType}`,
        confidence: 0.75
      },
      source: 'interaction'
    })
  }

  // Textual description recommendation
  recommendations.push({
    type: 'textual',
    content: {
      description: rule.textualDescription,
      alternativeText: `Imagen adaptada para usuarios con ${colorBlindnessType}`,
      confidence: 0.85
    },
    source: 'ontology'
  })

  return recommendations
}

/**
 * Analyze interactions to infer user preferences
 */
export function analyzeInteractions(interactions: any[]): {
  preferredContrast: number
  preferredSaturation: number
  preferredPalette: string[]
} {
  const contrastValues: number[] = []
  const saturationValues: number[] = []
  const paletteSelections: string[] = []

  interactions.forEach(interaction => {
    if (interaction.type === 'contrast_adjustment') {
      contrastValues.push(interaction.payload?.value || 1.0)
    }
    if (interaction.type === 'saturation_adjustment') {
      saturationValues.push(interaction.payload?.value || 1.0)
    }
    if (interaction.type === 'palette_selection') {
      paletteSelections.push(...(interaction.payload?.palette || []))
    }
  })

  return {
    preferredContrast: contrastValues.length > 0 
      ? contrastValues.reduce((a, b) => a + b, 0) / contrastValues.length 
      : 1.0,
    preferredSaturation: saturationValues.length > 0
      ? saturationValues.reduce((a, b) => a + b, 0) / saturationValues.length
      : 1.0,
    preferredPalette: paletteSelections.length > 0
      ? [...new Set(paletteSelections)]
      : []
  }
}


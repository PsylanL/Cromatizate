/**
 * Personalization Engine
 * 
 * Contiene reglas simples de personalización basadas en preferencias del usuario.
 * Trabaja con la estructura de preferencias existente del proyecto.
 */

export interface UserPreferences {
  type?: string // Tipo de daltonismo: 'normal', 'protanopia', 'deuteranopia', etc.
  intensity?: number // Intensidad (0-100)
  contrast?: number // Contraste (0-100)
  saturation?: number // Saturación (0-100)
  textDescriptions?: boolean // Si se deben mostrar descripciones textuales
}

export interface AdaptationRules {
  recommendedContrast: number
  recommendedSaturation: number
  recommendedIntensity: number
  highContrast: boolean
  enhancedText: boolean
  colorTransformations: boolean
}

/**
 * Reglas de adaptación predefinidas por tipo de daltonismo
 */
const ADAPTATION_RULES: Record<string, AdaptationRules> = {
  normal: {
    recommendedContrast: 100,
    recommendedSaturation: 100,
    recommendedIntensity: 70,
    highContrast: false,
    enhancedText: false,
    colorTransformations: false,
  },
  protanopia: {
    recommendedContrast: 120,
    recommendedSaturation: 130,
    recommendedIntensity: 80,
    highContrast: true,
    enhancedText: true,
    colorTransformations: true,
  },
  deuteranopia: {
    recommendedContrast: 120,
    recommendedSaturation: 130,
    recommendedIntensity: 80,
    highContrast: true,
    enhancedText: true,
    colorTransformations: true,
  },
  tritanopia: {
    recommendedContrast: 110,
    recommendedSaturation: 120,
    recommendedIntensity: 75,
    highContrast: true,
    enhancedText: true,
    colorTransformations: true,
  },
  achromatopsia: {
    recommendedContrast: 150,
    recommendedSaturation: 0, // Sin saturación para monocromático
    recommendedIntensity: 90,
    highContrast: true,
    enhancedText: true,
    colorTransformations: true,
  },
  protanomaly: {
    recommendedContrast: 110,
    recommendedSaturation: 115,
    recommendedIntensity: 75,
    highContrast: true,
    enhancedText: true,
    colorTransformations: true,
  },
  deuteranomaly: {
    recommendedContrast: 110,
    recommendedSaturation: 115,
    recommendedIntensity: 75,
    highContrast: true,
    enhancedText: true,
    colorTransformations: true,
  },
  tritanomaly: {
    recommendedContrast: 105,
    recommendedSaturation: 110,
    recommendedIntensity: 72,
    highContrast: false,
    enhancedText: true,
    colorTransformations: true,
  },
}

/**
 * Obtiene reglas de adaptación basadas en las preferencias del usuario
 * 
 * @param preferences - Preferencias del usuario
 * @returns Reglas de adaptación recomendadas
 */
export function getAdaptationFromPreferences(
  preferences: UserPreferences | null | undefined
): AdaptationRules {
  // Si no hay preferencias, usar reglas por defecto
  if (!preferences || !preferences.type || preferences.type === 'normal') {
    return ADAPTATION_RULES.normal
  }
  
  const visionType = preferences.type.toLowerCase()
  const rules = ADAPTATION_RULES[visionType]
  
  // Si no hay reglas específicas, usar las de visión normal
  if (!rules) {
    return ADAPTATION_RULES.normal
  }
  
  // Ajustar reglas basadas en preferencias personalizadas del usuario
  return {
    ...rules,
    recommendedContrast: preferences.contrast !== undefined 
      ? Math.max(rules.recommendedContrast, preferences.contrast)
      : rules.recommendedContrast,
    recommendedSaturation: preferences.saturation !== undefined
      ? Math.max(0, Math.min(150, preferences.saturation))
      : rules.recommendedSaturation,
    recommendedIntensity: preferences.intensity !== undefined
      ? Math.max(0, Math.min(100, preferences.intensity))
      : rules.recommendedIntensity,
  }
}

/**
 * Fusiona preferencias existentes con preferencias entrantes
 * 
 * @param existing - Preferencias existentes (pueden ser null o undefined)
 * @param incoming - Preferencias nuevas a fusionar
 * @returns Preferencias fusionadas
 */
export function mergePreferences(
  existing: UserPreferences | null | undefined,
  incoming: Partial<UserPreferences>
): UserPreferences {
  // Si no hay preferencias existentes, usar las entrantes como base
  if (!existing) {
    return {
      type: 'normal',
      intensity: 70,
      contrast: 100,
      saturation: 100,
      textDescriptions: false,
      ...incoming,
    }
  }
  
  // Fusionar preferencias, dando prioridad a las entrantes
  return {
    type: incoming.type !== undefined ? incoming.type : existing.type,
    intensity: incoming.intensity !== undefined ? incoming.intensity : existing.intensity,
    contrast: incoming.contrast !== undefined ? incoming.contrast : existing.contrast,
    saturation: incoming.saturation !== undefined ? incoming.saturation : existing.saturation,
    textDescriptions: incoming.textDescriptions !== undefined 
      ? incoming.textDescriptions 
      : existing.textDescriptions,
  }
}

/**
 * Valida que las preferencias tengan valores dentro de rangos aceptables
 * 
 * @param preferences - Preferencias a validar
 * @returns Preferencias validadas y normalizadas
 */
export function validatePreferences(preferences: Partial<UserPreferences>): UserPreferences {
  const validTypes = [
    'normal',
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'achromatopsia',
    'protanomaly',
    'deuteranomaly',
    'tritanomaly',
  ]
  
  return {
    type: preferences.type && validTypes.includes(preferences.type.toLowerCase())
      ? preferences.type.toLowerCase()
      : 'normal',
    intensity: typeof preferences.intensity === 'number'
      ? Math.max(0, Math.min(100, preferences.intensity))
      : 70,
    contrast: typeof preferences.contrast === 'number'
      ? Math.max(0, Math.min(200, preferences.contrast))
      : 100,
    saturation: typeof preferences.saturation === 'number'
      ? Math.max(0, Math.min(150, preferences.saturation))
      : 100,
    textDescriptions: typeof preferences.textDescriptions === 'boolean'
      ? preferences.textDescriptions
      : false,
  }
}

/**
 * Genera recomendaciones basadas en las preferencias del usuario
 * 
 * @param preferences - Preferencias del usuario
 * @returns Array de recomendaciones en formato de texto
 */
export function generateRecommendations(preferences: UserPreferences | null | undefined): string[] {
  const rules = getAdaptationFromPreferences(preferences)
  const recommendations: string[] = []
  
  if (rules.highContrast) {
    recommendations.push('Se recomienda usar alto contraste para mejorar la legibilidad')
  }
  
  if (rules.enhancedText) {
    recommendations.push('Se recomienda habilitar descripciones textuales para mejor comprensión')
  }
  
  if (rules.colorTransformations) {
    recommendations.push('Se aplicarán transformaciones de color para mejorar la percepción')
  }
  
  if (preferences && preferences.contrast && preferences.contrast < rules.recommendedContrast) {
    recommendations.push(
      `Se recomienda aumentar el contraste a ${rules.recommendedContrast}% para mejor visibilidad`
    )
  }
  
  if (preferences && preferences.saturation && preferences.saturation < rules.recommendedSaturation) {
    recommendations.push(
      `Se recomienda aumentar la saturación a ${rules.recommendedSaturation}% para mejor diferenciación de colores`
    )
  }
  
  return recommendations
}


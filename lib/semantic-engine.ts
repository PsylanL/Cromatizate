/**
 * Semantic Engine
 * 
 * Proporciona funciones simples para análisis de colores y generación de descripciones
 * basadas en el tipo de daltonismo del usuario.
 * 
 * No usa librerías pesadas, solo lógica propia con mappings predefinidos.
 */

export interface ColorAnalysisResult {
  description: string
  adaptedColors: string[]
  rawInput: any
}

/**
 * Mappings predefinidos para transformaciones de color según tipo de daltonismo
 */
const COLOR_TRANSFORMATIONS: Record<string, Record<string, string>> = {
  protanopia: {
    '#FF0000': '#8B4513', // Rojo → Marrón
    '#00FF00': '#FFD700', // Verde → Dorado
    '#0000FF': '#0000FF', // Azul → Azul (sin cambio)
    '#FFFF00': '#FFD700', // Amarillo → Dorado
    '#FF00FF': '#8B008B', // Magenta → Púrpura oscuro
    '#00FFFF': '#00CED1', // Cyan → Turquesa oscuro
  },
  deuteranopia: {
    '#FF0000': '#FF6347', // Rojo → Tomate
    '#00FF00': '#FFD700', // Verde → Dorado
    '#0000FF': '#0000FF', // Azul → Azul (sin cambio)
    '#FFFF00': '#FFD700', // Amarillo → Dorado
    '#FF00FF': '#9370DB', // Magenta → Púrpura medio
    '#00FFFF': '#20B2AA', // Cyan → Verde mar
  },
  tritanopia: {
    '#FF0000': '#FF0000', // Rojo → Rojo (sin cambio)
    '#00FF00': '#00FF00', // Verde → Verde (sin cambio)
    '#0000FF': '#8B008B', // Azul → Púrpura oscuro
    '#FFFF00': '#FFA500', // Amarillo → Naranja
    '#FF00FF': '#FF1493', // Magenta → Rosa profundo
    '#00FFFF': '#FFD700', // Cyan → Dorado
  },
  achromatopsia: {
    '#FF0000': '#808080', // Rojo → Gris
    '#00FF00': '#808080', // Verde → Gris
    '#0000FF': '#808080', // Azul → Gris
    '#FFFF00': '#808080', // Amarillo → Gris
    '#FF00FF': '#808080', // Magenta → Gris
    '#00FFFF': '#808080', // Cyan → Gris
  },
  normal: {} // Sin transformaciones para visión normal
}

/**
 * Descripciones textuales predefinidas basadas en colores
 */
const COLOR_DESCRIPTIONS: Record<string, string> = {
  '#FF0000': 'rojo intenso',
  '#00FF00': 'verde brillante',
  '#0000FF': 'azul profundo',
  '#FFFF00': 'amarillo vibrante',
  '#FF00FF': 'magenta',
  '#00FFFF': 'cyan',
  '#FFA500': 'naranja',
  '#800080': 'púrpura',
  '#FFC0CB': 'rosa',
  '#000000': 'negro',
  '#FFFFFF': 'blanco',
  '#808080': 'gris',
}

/**
 * Normaliza un color a formato hexadecimal estándar
 */
function normalizeColor(color: string): string {
  // Si ya es un hex válido, retornarlo
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase()
  }
  
  // Si es un hex corto, expandirlo
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    const r = color[1]
    const g = color[2]
    const b = color[3]
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  
  // Si no es un formato reconocido, retornar gris por defecto
  return '#808080'
}

/**
 * Encuentra el color más cercano en el mapping
 */
function findClosestColor(color: string, mapping: Record<string, string>): string {
  const normalized = normalizeColor(color)
  
  // Buscar coincidencia exacta
  if (mapping[normalized]) {
    return mapping[normalized]
  }
  
  // Si no hay coincidencia exacta, retornar el color original
  return normalized
}

/**
 * Genera una descripción textual simple basada en los colores
 */
function generateTextDescription(colors: string[], visionType: string): string {
  if (colors.length === 0) {
    return 'Sin colores detectados'
  }
  
  const colorNames = colors
    .map(color => COLOR_DESCRIPTIONS[normalizeColor(color)] || 'color desconocido')
    .filter((name, index, arr) => arr.indexOf(name) === index) // Eliminar duplicados
  
  const colorList = colorNames.length > 0 
    ? colorNames.join(', ')
    : 'colores diversos'
  
  if (visionType === 'normal') {
    return `Contenido visual con colores: ${colorList}`
  }
  
  const visionNames: Record<string, string> = {
    protanopia: 'protanopia',
    deuteranopia: 'deuteranopia',
    tritanopia: 'tritanopia',
    achromatopsia: 'visión monocromática',
    protanomaly: 'protanomalía',
    deuteranomaly: 'deuteranomalía',
    tritanomaly: 'tritanomalía',
  }
  
  const visionName = visionNames[visionType] || visionType
  
  return `Contenido visual adaptado para ${visionName}. Colores originales: ${colorList}. Los colores han sido transformados para mejorar la percepción.`
}

/**
 * Analiza colores y aplica transformaciones según el tipo de daltonismo
 * 
 * @param colors - Array de colores en formato hexadecimal (ej: ['#FF0000', '#00FF00'])
 * @param vision - Tipo de daltonismo (ej: 'protanopia', 'deuteranopia', 'normal')
 * @returns Resultado con descripción, colores adaptados e input original
 */
export function analyzeColors(
  colors: string[],
  vision: string
): ColorAnalysisResult {
  // Normalizar el tipo de visión
  const visionType = vision.toLowerCase() || 'normal'
  
  // Obtener el mapping de transformaciones para este tipo de visión
  const transformationMap = COLOR_TRANSFORMATIONS[visionType] || COLOR_TRANSFORMATIONS.normal
  
  // Aplicar transformaciones a cada color
  const adaptedColors = colors.map(color => {
    if (visionType === 'normal' || Object.keys(transformationMap).length === 0) {
      return normalizeColor(color)
    }
    return findClosestColor(color, transformationMap)
  })
  
  // Generar descripción textual
  const description = generateTextDescription(colors, visionType)
  
  return {
    description,
    adaptedColors,
    rawInput: {
      colors,
      vision,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Analiza metadatos básicos y genera descripción
 * 
 * @param metadata - Objeto con metadatos del contenido (puede incluir colores, tags, etc.)
 * @param vision - Tipo de daltonismo
 * @returns Resultado con descripción y colores adaptados
 */
export function analyzeMetadata(
  metadata: any,
  vision: string
): ColorAnalysisResult {
  // Extraer colores del metadata si están presentes
  const colors: string[] = []
  
  if (metadata.colors && Array.isArray(metadata.colors)) {
    colors.push(...metadata.colors)
  }
  
  if (metadata.palette && Array.isArray(metadata.palette)) {
    colors.push(...metadata.palette)
  }
  
  if (metadata.colorHints && Array.isArray(metadata.colorHints)) {
    colors.push(...metadata.colorHints)
  }
  
  // Si no hay colores, usar análisis básico
  if (colors.length === 0) {
    return {
      description: `Contenido visual sin información de color específica. Tipo de visión: ${vision}`,
      adaptedColors: [],
      rawInput: metadata
    }
  }
  
  // Usar la función principal de análisis
  return analyzeColors(colors, vision)
}


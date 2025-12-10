/**
 * External Analyzer
 * 
 * Proporciona funciones básicas para análisis externo de imágenes.
 * Si no hay API externa configurada, retorna valores dummy.
 */

export interface ImageAnalysisResult {
  labels: string[]
  colorHints: string[]
}

/**
 * Analiza una imagen desde una URL
 * 
 * Por ahora, retorna valores dummy ya que no hay API externa configurada.
 * En el futuro, se puede integrar con HuggingFace o similar.
 * 
 * @param url - URL de la imagen a analizar
 * @returns Resultado del análisis con etiquetas y colores
 */
export async function analyzeImage(url: string): Promise<ImageAnalysisResult> {
  // Verificar si hay una API externa configurada
  const apiKey = process.env.HUGGINGFACE_API_KEY
  const apiUrl = process.env.EXTERNAL_ANALYZER_API_URL
  
  // Si no hay API configurada, retornar valores dummy
  if (!apiKey && !apiUrl) {
    return {
      labels: ['unlabeled'],
      colorHints: ['#999999'],
    }
  }
  
  // TODO: Implementar llamada real a API externa cuando esté disponible
  // Por ahora, retornar valores dummy mejorados basados en la URL
  try {
    // Intentar extraer información básica de la URL
    const urlLower = url.toLowerCase()
    
    const labels: string[] = []
    const colorHints: string[] = []
    
    // Detección básica basada en palabras clave en la URL
    if (urlLower.includes('landscape') || urlLower.includes('nature')) {
      labels.push('landscape', 'nature', 'outdoor')
      colorHints.push('#228B22', '#87CEEB', '#8B4513') // Verde, azul cielo, marrón
    } else if (urlLower.includes('portrait') || urlLower.includes('person')) {
      labels.push('portrait', 'person', 'human')
      colorHints.push('#FFDBB3', '#8B4513', '#000000') // Piel, marrón, negro
    } else if (urlLower.includes('food') || urlLower.includes('meal')) {
      labels.push('food', 'meal', 'cooking')
      colorHints.push('#FF6347', '#FFD700', '#8B4513') // Tomate, dorado, marrón
    } else if (urlLower.includes('animal') || urlLower.includes('pet')) {
      labels.push('animal', 'pet', 'wildlife')
      colorHints.push('#8B4513', '#654321', '#000000') // Marrones y negros
    } else {
      labels.push('image', 'photo', 'visual-content')
      colorHints.push('#808080', '#CCCCCC', '#666666') // Grises neutros
    }
    
    return {
      labels: labels.length > 0 ? labels : ['unlabeled'],
      colorHints: colorHints.length > 0 ? colorHints : ['#999999'],
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    // Retornar valores dummy en caso de error
    return {
      labels: ['unlabeled'],
      colorHints: ['#999999'],
    }
  }
}

/**
 * Analiza múltiples imágenes
 * 
 * @param urls - Array de URLs de imágenes
 * @returns Array de resultados de análisis
 */
export async function analyzeMultipleImages(
  urls: string[]
): Promise<ImageAnalysisResult[]> {
  const results = await Promise.all(
    urls.map(url => analyzeImage(url))
  )
  
  return results
}

/**
 * Extrae colores dominantes de una URL (placeholder)
 * 
 * @param url - URL de la imagen
 * @returns Array de colores en formato hexadecimal
 */
export async function extractDominantColors(url: string): Promise<string[]> {
  const analysis = await analyzeImage(url)
  return analysis.colorHints
}


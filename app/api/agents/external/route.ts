import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/external-analyzer'

/**
 * POST /api/agents/external
 * 
 * Agente Externo - Analiza imágenes desde URLs
 * 
 * Body esperado:
 * {
 *   url: string  // URL de la imagen a analizar
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body
    
    // Validar que haya una URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Se requiere "url" en el body como string'
        },
        { status: 400 }
      )
    }
    
    // Validar que sea una URL válida
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'La URL proporcionada no es válida'
        },
        { status: 400 }
      )
    }
    
    // Analizar la imagen
    const analysis = await analyzeImage(url)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          labels: analysis.labels,
          colorHints: analysis.colorHints,
          url
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in external agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando la solicitud del agente externo',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/external
 * 
 * Endpoint de prueba/información del agente externo
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      agent: 'external',
      description: 'Agente externo para análisis básico de imágenes desde URLs',
      endpoints: {
        POST: {
          description: 'Analiza una imagen desde una URL y retorna etiquetas y colores',
          body: {
            url: 'string (requerido) - URL de la imagen a analizar'
          },
          note: 'Actualmente retorna valores dummy/placeholder. Para usar APIs externas, configurar HUGGINGFACE_API_KEY o EXTERNAL_ANALYZER_API_URL en variables de entorno.'
        }
      }
    },
    { status: 200 }
  )
}


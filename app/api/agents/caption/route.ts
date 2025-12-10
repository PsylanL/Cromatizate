import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/agents/caption
 * 
 * Agente de Descripción de Imágenes usando Replicate BLIP-2
 * 
 * Body esperado:
 * {
 *   image: string  // Imagen en base64 (con o sin prefijo data:image/...;base64,)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body
    
    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Se requiere "image" en el body como string base64' },
        { status: 400 }
      )
    }
    
    let base64Image = image
    if (image.includes(',')) {
      base64Image = image.split(',')[1]
    }
    
    if (!base64Image || base64Image.length === 0) {
      return NextResponse.json(
        { success: false, error: 'La imagen base64 no es válida' },
        { status: 400 }
      )
    }
    
    const replicateToken = process.env.REPLICATE_API_TOKEN
    
    if (!replicateToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token de Replicate requerido',
          hint: 'Agrega REPLICATE_API_TOKEN a .env.local. Obtén uno gratis en https://replicate.com/account/api-tokens'
        },
        { status: 500 }
      )
    }
    
    try {
      console.log('🖼️ Generando descripción con Replicate BLIP-2...')
      
      const dataUrl = image.includes(',') ? image : `data:image/jpeg;base64,${base64Image}`
      
      // Crear predicción con BLIP-2
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait' // Esperar hasta 60s por resultado
        },
        body: JSON.stringify({
          version: '4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608',
          input: {
            image: dataUrl,
            task: 'image_captioning'
          }
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Replicate error:', response.status, errorText)
        
        if (response.status === 401) {
          return NextResponse.json(
            { success: false, error: 'Token de Replicate inválido', hint: 'Verifica REPLICATE_API_TOKEN' },
            { status: 401 }
          )
        }
        
        throw new Error(`Replicate error: ${response.status}`)
      }
      
      let result = await response.json()
      
      // Si ya tiene resultado, retornar
      if (result.status === 'succeeded' && result.output) {
        console.log('✅ Descripción:', result.output)
        return NextResponse.json({
          success: true,
          caption: String(result.output).trim(),
          model: 'Salesforce/blip2-opt-2.7b'
        })
      }
      
      // Polling si no está listo (max 30s)
      let attempts = 0
      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: { 'Authorization': `Bearer ${replicateToken}` }
        })
        
        result = await pollRes.json()
        attempts++
      }
      
      if (result.status === 'failed') {
        throw new Error('Prediction failed: ' + (result.error || 'Unknown'))
      }
      
      if (result.status !== 'succeeded') {
        throw new Error('Timeout waiting for prediction')
      }
      
      const caption = result.output || 'Descripción no disponible'
      console.log('✅ Descripción:', caption)
      
      return NextResponse.json({
        success: true,
        caption: String(caption).trim(),
        model: 'Salesforce/blip2-opt-2.7b'
      })
      
    } catch (error: unknown) {
      console.error('Error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error al generar descripción',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando solicitud',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const hasToken = !!process.env.REPLICATE_API_TOKEN
  
  return NextResponse.json({
    success: true,
    agent: 'caption',
    description: 'Agente de descripción de imágenes (Replicate BLIP-2)',
    status: hasToken ? 'configured' : 'missing_token',
    model: 'Salesforce/blip2-opt-2.7b',
    pricing: 'Gratuito (50 predictions/día)',
    token: hasToken ? '✅ Configurado' : '❌ Falta REPLICATE_API_TOKEN',
    getToken: 'https://replicate.com/account/api-tokens'
  })
}
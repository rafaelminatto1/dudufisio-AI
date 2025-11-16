import { NextRequest, NextResponse } from 'next/server'
import { generateMedicalReport } from '@/lib/ai/openai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientName, complaint, examination, diagnosis } = body

    // Validação básica
    if (!patientName || !complaint || !examination) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Gerar laudo usando OpenAI
    const result = await generateMedicalReport({
      name: patientName,
      complaint,
      examination,
      diagnosis,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-report API:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


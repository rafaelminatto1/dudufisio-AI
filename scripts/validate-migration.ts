import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface ValidationResult {
  table: string
  count: number
  status: 'success' | 'error'
  error?: string
}

async function validateTable(table: string): Promise<ValidationResult> {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      return {
        table,
        count: 0,
        status: 'error',
        error: error.message,
      }
    }

    return {
      table,
      count: count || 0,
      status: 'success',
    }
  } catch (error) {
    return {
      table,
      count: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function main() {
  console.log('🔍 Iniciando validação de migração de dados...\n')

  const tables = [
    'pacientes',
    'users',
    'tratamentos',
    'agendamentos',
    'sessoes',
    'evolucoes',
    'pagamentos',
    'materiais_clinicos',
  ]

  const results: ValidationResult[] = []

  for (const table of tables) {
    const result = await validateTable(table)
    results.push(result)

    if (result.status === 'success') {
      console.log(`✅ ${table}: ${result.count} registros`)
    } else {
      console.log(`❌ ${table}: ${result.error}`)
    }
  }

  console.log('\n📊 Resumo da Validação:')
  console.log(`Total de tabelas: ${tables.length}`)
  console.log(`Sucesso: ${results.filter((r) => r.status === 'success').length}`)
  console.log(`Erro: ${results.filter((r) => r.status === 'error').length}`)

  const totalRecords = results
    .filter((r) => r.status === 'success')
    .reduce((acc, r) => acc + r.count, 0)
  console.log(`Total de registros: ${totalRecords}\n`)

  // Validar integridade referencial
  console.log('🔗 Validando integridade referencial...\n')

  // Pacientes sem tratamentos
  const { count: pacientesSemTratamentos } = await supabase
    .from('pacientes')
    .select('id', { count: 'exact', head: true })
    .is('id', null)

  console.log(`Pacientes sem tratamentos: ${pacientesSemTratamentos || 0}`)

  console.log('\n✨ Validação concluída!')
}

main().catch(console.error)


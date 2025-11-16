import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

type VariableStatus = {
  name: string
  value?: string
  source?: string
  valid: boolean
  reason?: string
}

const REQUIRED_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'WHATSAPP_VERIFY_TOKEN',
  'WHATSAPP_METRICS_BYPASS_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
]

const ENV_FILES = ['.env.local', '.env', '.env.production', '.env.example']

const PLACEHOLDER_REGEX = /(your_|coloque|preencha|dummy|changeme|todo)/i

function loadEnvFiles(): Record<string, string> {
  const resolved: Record<string, string> = {}

  ENV_FILES.forEach((fileName) => {
    const absPath = path.resolve(process.cwd(), fileName)
    if (!fs.existsSync(absPath)) return

    try {
      const parsed = dotenv.parse(fs.readFileSync(absPath))
      Object.entries(parsed).forEach(([key, value]) => {
        if (value && !resolved[key]) {
          resolved[key] = value
        }
      })
    } catch (error) {
      console.warn(`⚠️  Não foi possível ler ${fileName}:`, error)
    }
  })

  // Fallback para variáveis de ambiente em execução
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && !resolved[key]) {
      resolved[key] = value
    }
  })

  return resolved
}

function validateVariables(envMap: Record<string, string>): VariableStatus[] {
  return REQUIRED_VARS.map((key) => {
    const rawValue = envMap[key]
    if (!rawValue) {
      return {
        name: key,
        valid: false,
        reason: 'Variável ausente em todos os .env analisados',
      }
    }

    if (PLACEHOLDER_REGEX.test(rawValue)) {
      return {
        name: key,
        value: rawValue,
        valid: false,
        reason: 'Contém placeholder (your_/dummy/coloque...)',
      }
    }

    return {
      name: key,
      value: obfuscate(rawValue),
      valid: true,
    }
  })
}

function obfuscate(value: string): string {
  if (value.length <= 6) {
    return '*'.repeat(value.length)
  }

  return `${value.slice(0, 3)}***${value.slice(-3)}`
}

function printReport(status: VariableStatus[]) {
  console.log('\n══════════════════════════════════════════════════════')
  console.log('🔐  Verificação de Integrations (Stripe/Resend/WhatsApp)')
  console.log('══════════════════════════════════════════════════════\n')

  let allValid = true
  status.forEach((item) => {
    if (item.valid) {
      console.log(`✅ ${item.name}: ${item.value}`)
    } else {
      allValid = false
      console.log(`❌ ${item.name}: ${item.reason}`)
    }
  })

  console.log('\n──────────────────────────────')
  if (allValid) {
    console.log('✅ Todas as variáveis obrigatórias estão configuradas.')
  } else {
    console.log('⚠️  Há variáveis faltando ou com placeholders.')
    console.log('    Execute `vercel env ls` e `supabase secrets list` para confirmar.')
  }
  console.log('──────────────────────────────\n')

  if (!allValid) {
    process.exitCode = 1
  }
}

function main() {
  const envMap = loadEnvFiles()
  const status = validateVariables(envMap)
  printReport(status)
}

main()


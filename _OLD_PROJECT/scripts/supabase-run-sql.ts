import { execSync } from 'child_process'
import { existsSync } from 'fs'

const file = process.argv[2]
if (!file || !existsSync(file)) {
  console.error('Arquivo SQL inválido')
  process.exit(1)
}

try {
  const dbUrl = process.env.DATABASE_URL
  const cmd = dbUrl
    ? `npx supabase db execute -f ${file} --db-url ${process.platform === 'win32' ? '$env:DATABASE_URL' : '$DATABASE_URL'}`
    : `npx supabase db execute -f ${file}`
  execSync(cmd, { stdio: 'inherit' })
  console.log('SQL executado com sucesso')
} catch (e) {
  console.error('Falha ao executar SQL')
  process.exit(1)
}

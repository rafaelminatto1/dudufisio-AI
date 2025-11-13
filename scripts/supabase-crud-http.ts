import { env } from 'process'

const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Ambiente inválido'); process.exit(1) }

async function run() {
  const base = `${url}/rest/v1/patients`
  const id = '00000000-0000-0000-0000-000000000001'
  const headers = { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` }

  const insert = await fetch(base, { method: 'POST', headers, body: JSON.stringify({ id, full_name: 'Paciente CLI', phone: '+5511999999999' }) })
  console.log('insert', insert.status, await insert.text())

  const update = await fetch(`${base}?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ phone: '+5511988888888' }) })
  console.log('update', update.status, await update.text())

  const del = await fetch(`${base}?id=eq.${id}`, { method: 'DELETE', headers })
  console.log('delete', del.status, await del.text())
}

run().catch(err => { console.error(err); process.exit(1) })

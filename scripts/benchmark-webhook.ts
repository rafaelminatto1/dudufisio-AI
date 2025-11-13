import { performance } from 'node:perf_hooks'

const url = process.env.WEBHOOK_URL
if (!url) {
  console.error('WEBHOOK_URL não definida')
  process.exit(1)
}

const iterations = Number(process.env.ITERATIONS || 20)

const payload = {
  object: 'whatsapp_business_account',
  entry: [{
    id: 'ENTRY_ID',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: { display_phone_number: '+551158749885', phone_number_id: '779431901927431' },
        messages: [{ from: '5511999999999', id: 'wamid.test123', timestamp: String(Date.now()/1000|0), text: { body: 'Olá, teste!' }, type: 'text' }]
      },
      field: 'messages'
    }]
  }]
}

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a,b)=>a-b)
  const idx = Math.ceil((p/100)*sorted.length)-1
  return sorted[Math.max(0, Math.min(sorted.length-1, idx))]
}

async function run() {
  const times: number[] = []
  for (let i=0; i<iterations; i++) {
    const t0 = performance.now()
    const resp = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    const t1 = performance.now()
    times.push(t1 - t0)
    const txt = await resp.text().catch(()=> '')
    console.log(`Iter ${i+1}/${iterations}: ${resp.status} ${resp.statusText} - ${Math.round(times[times.length-1])} ms`)
    if (i === 0) console.log('Body:', txt.slice(0, 200))
  }
  const p50 = percentile(times, 50)
  const p95 = percentile(times, 95)
  const p99 = percentile(times, 99)
  console.log(JSON.stringify({ iterations, p50, p95, p99 }, null, 2))
}

run().catch(err => { console.error(err); process.exit(1) })

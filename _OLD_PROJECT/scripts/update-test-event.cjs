/*
  Atualiza um evento de teste no Google Calendar.
  Uso: node scripts/update-test-event.cjs --id=<EVENT_ID>
*/

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function ensureEnvLoaded() {
  if (process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT && process.env.GOOGLE_CALENDAR_ID) return;
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find(a => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function main() {
  ensureEnvLoaded();
  const eventId = getArg('id');
  if (!eventId) {
    console.error('Uso: node scripts/update-test-event.cjs --id=<EVENT_ID>');
    process.exit(1);
  }

  const svcStr = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!svcStr || !calendarId) {
    console.error('Variáveis ausentes: defina GOOGLE_CALENDAR_SERVICE_ACCOUNT e GOOGLE_CALENDAR_ID');
    process.exit(1);
  }

  let credentials;
  try { credentials = JSON.parse(svcStr); } catch (e) {
    console.error('Falha ao parsear GOOGLE_CALENDAR_SERVICE_ACCOUNT:', e.message);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/calendar'] });
  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: authClient });

  // mover +30 min e alterar título
  const now = new Date();
  const start = new Date(now.getTime() + 40 * 60 * 1000); // ~+40m
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const timeZone = 'America/Sao_Paulo';

  const requestBody = {
    summary: '[Atualizado] Consulta de Fisioterapia — DuduFisio-AI',
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone }
  };

  try {
    const res = await calendar.events.update({ calendarId, eventId, sendUpdates: 'all', requestBody });
    console.log(JSON.stringify({ success: true, message: 'Evento atualizado', calendarId, eventId, htmlLink: res.data.htmlLink }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: 'Falha ao atualizar evento', details: e.response?.data || e.message }, null, 2));
    process.exit(2);
  }
}

main();



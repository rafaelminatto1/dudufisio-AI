/*
  Cria um evento de teste no Google Calendar usando Service Account.
  - Lê .env.local se as variáveis não estiverem no processo
  - Cria um evento começando em ~10 minutos por 30 minutos
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

async function main() {
  ensureEnvLoaded();

  const svcStr = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!svcStr || !calendarId) {
    console.error('Variáveis ausentes: defina GOOGLE_CALENDAR_SERVICE_ACCOUNT e GOOGLE_CALENDAR_ID');
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(svcStr);
  } catch (e) {
    console.error('Falha ao parsear GOOGLE_CALENDAR_SERVICE_ACCOUNT como JSON:', e.message);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: authClient });

  const start = new Date(Date.now() + 10 * 60 * 1000); // +10 min
  const end = new Date(start.getTime() + 30 * 60 * 1000); // +30 min
  const timeZone = 'America/Sao_Paulo';

  const requestBody = {
    summary: '[Teste DuduFisio-AI] Consulta de Fisioterapia',
    description: 'Evento de teste criado automaticamente para validar integração.',
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone },
    location: 'DuduFisio - Clínica de Fisioterapia',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 }
      ]
    }
    // Você pode incluir attendees aqui se quiser notificar alguém
  };

  try {
    const res = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      requestBody
    });
    console.log(JSON.stringify({
      success: true,
      message: 'Evento criado com sucesso',
      calendarId,
      eventId: res.data.id,
      htmlLink: res.data.htmlLink
    }, null, 2));
    process.exit(0);
  } catch (e) {
    const status = e.response?.status;
    const data = e.response?.data;
    console.error(JSON.stringify({
      success: false,
      error: 'Falha ao criar evento',
      status,
      details: data || e.message
    }, null, 2));
    process.exit(2);
  }
}

main();



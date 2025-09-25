/*
  Teste de conexão com Google Calendar usando Service Account + Calendar ID.
  - Lê variáveis do processo; se ausentes, tenta carregar de .env.local.
  - Autoriza com JWT e lista 1 evento no intervalo da próxima hora.
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

  // Debug mínimo para checagem de chave
  if (!credentials.private_key || !credentials.client_email) {
    console.error('Credenciais incompletas: client_email ou private_key ausentes');
    console.error({ client_email: credentials.client_email, private_key_length: credentials.private_key ? credentials.private_key.length : 0 });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: authClient });

  const now = new Date();
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);

  try {
    const res = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: inOneHour.toISOString(),
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const items = res.data.items || [];
    console.log(JSON.stringify({
      success: true,
      message: 'Conexão OK — Google Calendar acessível',
      calendarId,
      retrievedItems: items.length
    }, null, 2));
    process.exit(0);
  } catch (e) {
    const status = e.response?.status;
    const data = e.response?.data;
    console.error(JSON.stringify({
      success: false,
      error: 'Falha ao listar eventos',
      status,
      details: data || e.message,
      hint: 'Verifique se o calendário foi compartilhado com a Service Account com permissão de alteração.'
    }, null, 2));
    process.exit(2);
  }
}

main();



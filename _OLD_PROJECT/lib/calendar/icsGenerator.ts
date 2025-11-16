/**
 * ICS (iCalendar) Generator
 * Gera arquivos .ics universais para Google Calendar, Apple Calendar, Outlook, etc.
 */

export interface ICSEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
  reminderHoursBefore?: number[];
}

/**
 * Gera arquivo .ics (iCalendar) universal
 * Compatível com Google Calendar, Apple Calendar, Outlook, Yahoo Calendar, etc.
 */
export function generateICS(event: ICSEvent): string {
  const start = formatICSDate(event.startTime);
  const end = formatICSDate(event.endTime);
  const now = formatICSDate(new Date());
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@dudufisio.com`;
  
  // Escape text for ICS format
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const title = escapeText(event.title);
  const description = escapeText(event.description);
  const location = escapeText(event.location);
  const organizerName = escapeText(event.organizer.name);
  const attendeeName = escapeText(event.attendee.name);

  // Build ICS content
  let ics = `BEGIN:VCALENDAR\r\n`;
  ics += `VERSION:2.0\r\n`;
  ics += `PRODID:-//DuduFisio//Sistema de Gestão//PT\r\n`;
  ics += `CALSCALE:GREGORIAN\r\n`;
  ics += `METHOD:PUBLISH\r\n`;
  ics += `BEGIN:VEVENT\r\n`;
  ics += `UID:${uid}\r\n`;
  ics += `DTSTAMP:${now}\r\n`;
  ics += `DTSTART:${start}\r\n`;
  ics += `DTEND:${end}\r\n`;
  ics += `SUMMARY:${title}\r\n`;
  ics += `DESCRIPTION:${description}\r\n`;
  ics += `LOCATION:${location}\r\n`;
  ics += `ORGANIZER;CN=${organizerName}:mailto:${event.organizer.email}\r\n`;
  ics += `ATTENDEE;CN=${attendeeName};RSVP=TRUE:mailto:${event.attendee.email}\r\n`;
  ics += `STATUS:CONFIRMED\r\n`;
  ics += `SEQUENCE:0\r\n`;
  ics += `TRANSP:OPAQUE\r\n`;

  // Add reminders (alarms)
  const reminderHours = event.reminderHoursBefore || [24, 2];
  
  reminderHours.forEach((hours, index) => {
    ics += `BEGIN:VALARM\r\n`;
    ics += `TRIGGER:-PT${hours}H\r\n`;
    ics += `ACTION:DISPLAY\r\n`;
    ics += `DESCRIPTION:Lembrete: ${event.title}\r\n`;
    ics += `END:VALARM\r\n`;
  });

  ics += `END:VEVENT\r\n`;
  ics += `END:VCALENDAR\r\n`;

  return ics;
}

/**
 * Formata data para formato ICS (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Gera link Google Calendar
 */
export function generateGoogleCalendarLink(event: ICSEvent): string {
  const start = formatGoogleDate(event.startTime);
  const end = formatGoogleDate(event.endTime);
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Formata data para Google Calendar (YYYYMMDDTHHMMSSZ)
 */
function formatGoogleDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Gera link Outlook Calendar
 */
export function generateOutlookCalendarLink(event: ICSEvent): string {
  const start = formatICSDate(event.startTime);
  const end = formatICSDate(event.endTime);
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`;
}

/**
 * Gera link Yahoo Calendar
 */
export function generateYahooCalendarLink(event: ICSEvent): string {
  const start = formatYahooDate(event.startTime);
  const end = formatYahooDate(event.endTime);
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  
  return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${start}&dur=${calculateDuration(event.startTime, event.endTime)}&desc=${description}&in_loc=${location}`;
}

/**
 * Formata data para Yahoo Calendar (YYYYMMDDTHHMMSSZ)
 */
function formatYahooDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Calcula duração em minutos
 */
function calculateDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins.toString();
}


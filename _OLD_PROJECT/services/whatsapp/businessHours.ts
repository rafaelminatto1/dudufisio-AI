/**
 * ⏰ Business Hours - Controle de horário comercial
 * Garante que mensagens sejam enviadas apenas em horários apropriados
 */

export interface BusinessHoursConfig {
  timezone: string;
  workdays: number[]; // 0 = domingo, 1 = segunda, ...
  hours: {
    [key: number]: { start: string; end: string }; // dia da semana -> horários
  };
  holidays: string[]; // Datas no formato 'YYYY-MM-DD'
  respectBusinessHours: boolean;
}

export interface BusinessHoursCheck {
  isBusinessHours: boolean;
  reason?: string;
  nextAvailable?: Date;
}

/**
 * Configuração padrão - Brasil
 */
const DEFAULT_CONFIG: BusinessHoursConfig = {
  timezone: 'America/Sao_Paulo',
  workdays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  hours: {
    1: { start: '08:00', end: '18:00' }, // Segunda
    2: { start: '08:00', end: '18:00' }, // Terça
    3: { start: '08:00', end: '18:00' }, // Quarta
    4: { start: '08:00', end: '18:00' }, // Quinta
    5: { start: '08:00', end: '18:00' }, // Sexta
    6: { start: '08:00', end: '12:00' }  // Sábado
    // Domingo: fechado
  },
  holidays: [
    // Feriados nacionais Brasil 2025
    '2025-01-01', // Ano Novo
    '2025-04-18', // Sexta-feira Santa
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalho
    '2025-09-07', // Independência
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15', // Proclamação da República
    '2025-12-25', // Natal
  ],
  respectBusinessHours: true
};

/**
 * Business Hours Service
 */
export class BusinessHoursService {
  private config: BusinessHoursConfig;

  constructor(config: Partial<BusinessHoursConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Verificar se está em horário comercial
   */
  isBusinessHours(date: Date = new Date()): BusinessHoursCheck {
    // Se não precisa respeitar horário comercial
    if (!this.config.respectBusinessHours) {
      return { isBusinessHours: true };
    }

    // Ajustar para timezone configurado
    const localDate = this.toLocalTime(date);
    const dayOfWeek = localDate.getDay();
    const dateStr = this.formatDate(localDate);

    // 1. Verificar se é dia útil
    if (!this.config.workdays.includes(dayOfWeek)) {
      return {
        isBusinessHours: false,
        reason: 'Fora do expediente (fim de semana)',
        nextAvailable: this.getNextBusinessDay(localDate)
      };
    }

    // 2. Verificar se é feriado
    if (this.config.holidays.includes(dateStr)) {
      return {
        isBusinessHours: false,
        reason: 'Feriado',
        nextAvailable: this.getNextBusinessDay(localDate)
      };
    }

    // 3. Verificar horário do dia
    const hours = this.config.hours[dayOfWeek];
    if (!hours) {
      return {
        isBusinessHours: false,
        reason: 'Dia sem expediente',
        nextAvailable: this.getNextBusinessDay(localDate)
      };
    }

    const currentTime = this.formatTime(localDate);
    const startTime = hours.start;
    const endTime = hours.end;

    if (currentTime < startTime) {
      return {
        isBusinessHours: false,
        reason: `Antes do horário de expediente (inicia às ${startTime})`,
        nextAvailable: this.parseTime(localDate, startTime)
      };
    }

    if (currentTime > endTime) {
      return {
        isBusinessHours: false,
        reason: `Após horário de expediente (encerra às ${endTime})`,
        nextAvailable: this.getNextBusinessDay(localDate)
      };
    }

    // Está em horário comercial
    return { isBusinessHours: true };
  }

  /**
   * Obter próximo horário comercial disponível
   */
  getNextBusinessHours(from: Date = new Date()): Date {
    const check = this.isBusinessHours(from);
    
    if (check.isBusinessHours) {
      return from;
    }

    return check.nextAvailable || this.getNextBusinessDay(from);
  }

  /**
   * Adicionar horários de almoço (opcional)
   */
  setLunchBreak(start: string, end: string): void {
    // Implementação futura se necessário
    // Por enquanto, não fazemos pausa de almoço
  }

  /**
   * Adicionar feriado customizado
   */
  addHoliday(date: string): void {
    if (!this.config.holidays.includes(date)) {
      this.config.holidays.push(date);
    }
  }

  /**
   * Remover feriado
   */
  removeHoliday(date: string): void {
    this.config.holidays = this.config.holidays.filter(h => h !== date);
  }

  /**
   * Configurar horário de um dia específico
   */
  setDayHours(dayOfWeek: number, start: string, end: string): void {
    this.config.hours[dayOfWeek] = { start, end };
    
    // Adicionar ao workdays se não estiver
    if (!this.config.workdays.includes(dayOfWeek)) {
      this.config.workdays.push(dayOfWeek);
    }
  }

  /**
   * Desabilitar um dia da semana
   */
  disableDay(dayOfWeek: number): void {
    this.config.workdays = this.config.workdays.filter(d => d !== dayOfWeek);
    delete this.config.hours[dayOfWeek];
  }

  /**
   * Verificar múltiplas datas
   */
  checkMultipleDates(dates: Date[]): BusinessHoursCheck[] {
    return dates.map(date => this.isBusinessHours(date));
  }

  /**
   * Calcular próximos N horários disponíveis
   */
  getNextAvailableSlots(count: number, intervalMinutes: number = 30): Date[] {
    const slots: Date[] = [];
    let current = new Date();

    while (slots.length < count) {
      const next = this.getNextBusinessHours(current);
      slots.push(next);
      
      // Próximo slot
      current = new Date(next.getTime() + intervalMinutes * 60 * 1000);
    }

    return slots;
  }

  // ===== HELPERS PRIVADOS =====

  /**
   * Converter para timezone local
   */
  private toLocalTime(date: Date): Date {
    // Usar Intl.DateTimeFormat para conversão precisa
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.config.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const parts = formatter.formatToParts(date);

    const dateMap: Record<string, string> = {};
    parts.forEach(part => {
      dateMap[part.type] = part.value;
    });

    return new Date(
      parseInt(dateMap.year),
      parseInt(dateMap.month) - 1,
      parseInt(dateMap.day),
      parseInt(dateMap.hour),
      parseInt(dateMap.minute),
      parseInt(dateMap.second)
    );
  }

  /**
   * Formatar data como YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatar hora como HH:MM
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Parse string de horário (HH:MM) para Date
   */
  private parseTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Obter próximo dia útil
   */
  private getNextBusinessDay(from: Date): Date {
    const next = new Date(from);
    next.setDate(next.getDate() + 1);
    next.setHours(8, 0, 0, 0); // Inicia às 8h do próximo dia

    // Buscar próximo dia útil (máximo 14 dias à frente)
    let attempts = 0;
    while (attempts < 14) {
      const dayOfWeek = next.getDay();
      const dateStr = this.formatDate(next);

      // Verificar se é dia útil e não é feriado
      if (
        this.config.workdays.includes(dayOfWeek) &&
        !this.config.holidays.includes(dateStr) &&
        this.config.hours[dayOfWeek]
      ) {
        // Definir para início do expediente
        const startTime = this.config.hours[dayOfWeek].start;
        return this.parseTime(next, startTime);
      }

      // Próximo dia
      next.setDate(next.getDate() + 1);
      attempts++;
    }

    // Fallback: segunda-feira às 8h (caso não encontre)
    const fallback = new Date(from);
    fallback.setDate(fallback.getDate() + 7);
    fallback.setHours(8, 0, 0, 0);
    return fallback;
  }

  /**
   * Verificar se uma data é dia útil
   */
  isWorkday(date: Date): boolean {
    const localDate = this.toLocalTime(date);
    const dayOfWeek = localDate.getDay();
    const dateStr = this.formatDate(localDate);

    return (
      this.config.workdays.includes(dayOfWeek) &&
      !this.config.holidays.includes(dateStr)
    );
  }

  /**
   * Obter horário de expediente de um dia
   */
  getDayHours(dayOfWeek: number): { start: string; end: string } | null {
    return this.config.hours[dayOfWeek] || null;
  }

  /**
   * Listar feriados
   */
  getHolidays(): string[] {
    return [...this.config.holidays];
  }

  /**
   * Contar dias úteis entre duas datas
   */
  countBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      if (this.isWorkday(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}

// Singleton instance
let businessHoursInstance: BusinessHoursService | null = null;

export const getBusinessHours = (config?: Partial<BusinessHoursConfig>): BusinessHoursService => {
  if (!businessHoursInstance) {
    businessHoursInstance = new BusinessHoursService(config);
  }
  return businessHoursInstance;
};

export default getBusinessHours;


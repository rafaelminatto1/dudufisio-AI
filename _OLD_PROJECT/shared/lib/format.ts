/**
 * Funções de formatação compartilhadas
 */

/**
 * Formata valor como moeda brasileira (R$)
 */
export function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata data para formato brasileiro
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

/**
 * Formata data e hora para formato brasileiro
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Exibe o tipo de agendamento formatado
 */
export function displayAppointmentType(type: string): string {
  const types: Record<string, string> = {
    session: 'Sessão',
    evaluation: 'Avaliação',
    reevaluation: 'Reavaliação',
    return: 'Retorno',
    discharge: 'Alta',
  };
  return types[type] || type;
}


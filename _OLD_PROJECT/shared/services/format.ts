export function formatCurrencyBR(value: number | undefined | null): string {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numeric);
}

export function displayAppointmentType(type?: string): string {
  return type || 'Não definido';
}

export function abbreviateAppointmentType(type?: string, length: number = 3): string {
  return type ? type.substring(0, length) : '';
}



export const PAIN_TYPE_OPTIONS = [
  { value: 'aguda', label: 'Aguda / Pontada' },
  { value: 'latejante', label: 'Latejante' },
  { value: 'queimacao', label: 'Queimação' },
  { value: 'formigamento', label: 'Formigamento' },
  { value: 'dormencia', label: 'Dormência' },
  { value: 'rigidez', label: 'Rigidez' },
  { value: 'inchaco', label: 'Inchaço' },
] as const;

export type PainTypeValue = typeof PAIN_TYPE_OPTIONS[number]['value'];


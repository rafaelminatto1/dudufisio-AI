// src/app/actions/__tests__/waitlist.integration.test.ts
import { addPatientToWaitlist } from '../waitlist';
import { createClient } from '@supabase/supabase-js';

// --- Mock Setup ---
// Criamos uma variável para o mock da função 'single' para que possamos alterá-la em testes específicos.
const singleMock = jest.fn();

const supabaseQueryBuilderMocks = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: singleMock,
};

// O mock principal agora é mais simples e usa a variável 'singleMock'.
const fromMock = jest.fn((tableName: string) => supabaseQueryBuilderMocks);

// Mock do createClient para retornar nosso 'fromMock'
const createClientMock = jest.fn(() => ({
  from: fromMock,
}));

// Aplicamos o mock ao módulo '@supabase/supabase-js'
jest.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));
// --- End Mock Setup ---

describe('addPatientToWaitlist (Integration Test)', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    process.env = { ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restaura o ambiente
  });

  it('should successfully add a patient to the waitlist', async () => {
    // Configuração do mock para este teste:
    // 1. A verificação inicial não encontra nenhum paciente.
    singleMock.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    // 2. A inserção retorna o novo ID.
    singleMock.mockResolvedValueOnce({ data: { id: 'mock-waitlist-entry-id' }, error: null });

    const result = await addPatientToWaitlist('test-patient-id', 'Alta');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Paciente adicionado à lista de espera com sucesso.');
    expect(result.waitlistEntryId).toBe('mock-waitlist-entry-id');

    // Verifica se as funções do Supabase foram chamadas corretamente
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith('waitlist');
    expect(supabaseQueryBuilderMocks.insert).toHaveBeenCalledWith({
      patient_id: 'test-patient-id',
      priority: 'Alta',
      status: 'Ativo',
    });
  });

  it('should return an error if patient is already in active waitlist', async () => {
    // Configuração do mock para este teste:
    // A verificação inicial encontra um paciente existente.
    singleMock.mockResolvedValueOnce({ data: { id: 'existing-waitlist-id' }, error: null });

    const result = await addPatientToWaitlist('existing-patient-id', 'Normal');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Paciente já está na lista de espera ativa.');
    // Garante que a função 'insert' não foi chamada
    expect(supabaseQueryBuilderMocks.insert).not.toHaveBeenCalled();
  });

  it('should return an error if Supabase credentials are not configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined; // Remove a credencial
    const result = await addPatientToWaitlist('some-id', 'Normal');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Credenciais do Supabase não configuradas');
    // Garante que o cliente do Supabase nem foi chamado
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
// src/lib/utils/__tests__/backup.test.ts
import { performDatabaseBackup } from '../backup';
import { createClient } from '@supabase/supabase-js';

// --- Mock Setup ---
const selectMock = jest.fn();
const insertMock = jest.fn();
const updateMock = jest.fn();
const eqMock = jest.fn();

const fromMock = jest.fn((tableName: string) => ({
  select: selectMock,
  insert: insertMock,
  update: updateMock,
  eq: eqMock,
}));

const createClientMock = jest.fn(() => ({
  from: fromMock,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));
// --- End Mock Setup ---

describe('performDatabaseBackup', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should successfully perform a database backup', async () => {
    // Configuração do mock para este teste:
    // 1. A verificação da tabela 'backups' retorna sucesso.
    selectMock.mockReturnValue({ limit: jest.fn().mockResolvedValue({ data: [], error: null }) });
    // 2. A contagem de registros para cada tabela retorna 10.
    selectMock.mockReturnValue({ select: jest.fn().mockReturnThis(), head: true, mockCount: 10 });
    // 3. A inserção do registro de backup retorna o novo ID.
    insertMock.mockReturnValue({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 'mock-backup-id' }, error: null }) });
    // 4. O update final é bem-sucedido.
    updateMock.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

    const result = await performDatabaseBackup();

    expect(result.success).toBe(true);
    expect(result.message).toContain('Backup concluído em');
    expect(result.backup_id).toBe('mock-backup-id');
    expect(result.stats?.total_records).toBeGreaterThan(0);

    // Verifica se as chamadas ao Supabase foram feitas corretamente
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith('backups');
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it('should return an error if Supabase credentials are not configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    const result = await performDatabaseBackup();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Credenciais do Supabase não configuradas');
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('should handle errors during table count', async () => {
    // Configuração do mock para simular erro na contagem
    selectMock.mockReturnValue({ limit: jest.fn().mockResolvedValue({ data: [], error: null }) });
    selectMock.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        head: true,
        mockCount: null, // Simula erro
        error: { message: 'Erro ao contar tabela', code: '500' }
    });

    const result = await performDatabaseBackup();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Erro ao contar tabela');
  });
});

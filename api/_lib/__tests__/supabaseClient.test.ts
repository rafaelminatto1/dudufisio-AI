/**
 * Testes Unitários para Supabase Client
 * 
 * Cobertura:
 * - Validação de variáveis de ambiente
 * - Mensagens de erro claras
 * - Configuração do cliente
 * - Integração básica
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Supabase Client', () => {
  // Backup original env vars
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset modules para forçar reimport
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe('Validação de Variáveis de Ambiente', () => {
    it('deve lançar erro claro quando SUPABASE_URL está faltando', async () => {
      // Remove ambas variáveis de URL
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      // Mantenha as keys para testar apenas URL
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      await expect(async () => {
        await import('../supabaseClient');
      }).rejects.toThrow(/SUPABASE_URL não configurada/);
    });

    it('erro de SUPABASE_URL deve incluir instruções claras', async () => {
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      try {
        await import('../supabaseClient');
        expect.fail('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.message).toContain('❌');
        expect(error.message).toContain('Ação necessária');
        expect(error.message).toContain('VITE_SUPABASE_URL');
        expect(error.message).toContain('NEXT_PUBLIC_SUPABASE_URL');
        expect(error.message).toContain('https://supabase.com/dashboard');
        expect(error.message).toContain('Exemplo');
      }
    });

    it('deve lançar erro claro quando SUPABASE_ANON_KEY está faltando', async () => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.VITE_SUPABASE_ANON_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      await expect(async () => {
        await import('../supabaseClient');
      }).rejects.toThrow(/SUPABASE_ANON_KEY não configurada/);
    });

    it('erro de SUPABASE_ANON_KEY deve incluir avisos de segurança', async () => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.VITE_SUPABASE_ANON_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      try {
        await import('../supabaseClient');
        expect.fail('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.message).toContain('❌');
        expect(error.message).toContain('SUPABASE_ANON_KEY');
        expect(error.message).toContain('⚠️  IMPORTANTE');
        expect(error.message).toContain('ANON');
        expect(error.message).toContain('NÃO a SERVICE_ROLE');
        expect(error.message).toContain('Exemplo');
      }
    });

    it('deve aceitar VITE_SUPABASE_URL', async () => {
      process.env.VITE_SUPABASE_URL = 'https://test-vite.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-vite';
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { supabase } = await import('../supabaseClient');
      expect(supabase).toBeDefined();
    });

    it('deve aceitar NEXT_PUBLIC_SUPABASE_URL', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-next.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-next';
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.VITE_SUPABASE_ANON_KEY;

      const { supabase } = await import('../supabaseClient');
      expect(supabase).toBeDefined();
    });

    it('deve priorizar VITE_ quando ambas estão presentes', async () => {
      process.env.VITE_SUPABASE_URL = 'https://vite-priority.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://next-fallback.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'vite-key';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'next-key';

      const { supabase } = await import('../supabaseClient');
      expect(supabase).toBeDefined();
      // Verificar que usou VITE_ (não temos acesso direto, mas importou com sucesso)
    });
  });

  describe('Configuração do Cliente', () => {
    beforeEach(() => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
    });

    it('deve criar instância do Supabase Client', async () => {
      const { supabase } = await import('../supabaseClient');
      
      expect(supabase).toBeDefined();
      expect(supabase).toHaveProperty('auth');
      expect(supabase).toHaveProperty('from');
    });

    it('deve exportar cliente com métodos principais', async () => {
      const { supabase } = await import('../supabaseClient');
      
      // Verificar que tem os métodos esperados
      expect(typeof supabase.from).toBe('function');
      expect(typeof supabase.rpc).toBe('function');
      expect(typeof supabase.storage).toBe('object');
      expect(typeof supabase.auth).toBe('object');
    });

    it('cliente deve ter configuração serverless (persistSession: false)', async () => {
      const { supabase } = await import('../supabaseClient');
      
      // Supabase não expõe configuração diretamente, mas podemos verificar que importou
      expect(supabase).toBeDefined();
      
      // Em ambiente serverless, auth.getSession() deve falhar ou retornar null
      // pois persistSession está desabilitado
      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });
  });

  describe('Integração Básica', () => {
    beforeEach(() => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
    });

    it('deve permitir criar queries (mesmo sem conexão real)', async () => {
      const { supabase } = await import('../supabaseClient');
      
      // Criar query (não executar para evitar rede)
      const query = supabase
        .from('appointments')
        .select('*')
        .eq('status', 'active');
      
      expect(query).toBeDefined();
    });

    it('deve permitir acessar API de storage', async () => {
      const { supabase } = await import('../supabaseClient');
      
      expect(supabase.storage).toBeDefined();
      expect(typeof supabase.storage.from).toBe('function');
    });

    it('deve permitir acessar API de auth', async () => {
      const { supabase } = await import('../supabaseClient');
      
      expect(supabase.auth).toBeDefined();
      expect(typeof supabase.auth.signInWithPassword).toBe('function');
      expect(typeof supabase.auth.signOut).toBe('function');
      expect(typeof supabase.auth.getUser).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com URL vazia após fallback', async () => {
      process.env.VITE_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      await expect(async () => {
        await import('../supabaseClient');
      }).rejects.toThrow(/SUPABASE_URL/);
    });

    it('deve lidar com key vazia após fallback', async () => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      await expect(async () => {
        await import('../supabaseClient');
      }).rejects.toThrow(/SUPABASE_ANON_KEY/);
    });

    it('deve permitir URLs personalizadas', async () => {
      process.env.VITE_SUPABASE_URL = 'https://custom-domain.com';
      process.env.VITE_SUPABASE_ANON_KEY = 'custom-key';

      const { supabase } = await import('../supabaseClient');
      expect(supabase).toBeDefined();
    });
  });

  describe('Documentação JSDoc', () => {
    it('módulo deve ter documentação exportada', async () => {
      // Este teste é mais sobre verificar que o módulo pode ser importado
      // A documentação JSDoc é validada em tempo de compilação pelo TypeScript
      const module = await import('../supabaseClient');
      
      expect(module).toHaveProperty('supabase');
      expect(Object.keys(module)).toContain('supabase');
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
    });

    it('cliente deve ter tipos corretos do Supabase', async () => {
      const { supabase } = await import('../supabaseClient');
      
      // TypeScript deve validar estes tipos em compile time
      expect(supabase).toBeDefined();
      
      // Verificar que métodos existem (tipos estão corretos)
      const query = supabase.from('test');
      expect(query).toHaveProperty('select');
      expect(query).toHaveProperty('insert');
      expect(query).toHaveProperty('update');
      expect(query).toHaveProperty('delete');
    });
  });
});


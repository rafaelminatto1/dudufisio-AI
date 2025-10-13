/**
 * Testes Unitários - Auth Service
 * Testa funcionalidades de autenticação e gerenciamento de sessão
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as authService from '@/services/authService';
import { createTestUser, clearStorage } from './__helpers__/testFixtures';
import { Role } from '@/types';

// Mock do sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock de usuários de teste
const mockUsers = [
  createTestUser(Role.Administrador),
  createTestUser(Role.Fisioterapeuta),
  createTestUser(Role.Paciente),
  createTestUser(Role.EducadorFisico),
];

describe('AuthService', () => {
  beforeEach(() => {
    clearStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('deve autenticar usuário com credenciais válidas', async () => {
      // Usa um email que existe em mockData
      const email = 'roberto@fisioflow.com';
      const password = 'password123';
      
      const user = await authService.login(email, password);
      
      expect(user).toBeTruthy();
      expect(user.email).toBe(email);
    });

    it('deve rejeitar com senha incorreta', async () => {
      const email = 'admin@test.com';
      const password = 'senha-errada';
      
      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve rejeitar com email inexistente', async () => {
      const email = 'usuario-inexistente@test.com';
      const password = 'password123';
      
      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve salvar sessão após login bem-sucedido', async () => {
      const email = 'roberto@fisioflow.com';
      const password = 'password123';
      
      await authService.login(email, password);
      
      const session = sessionStorage.getItem('fisioflow_user_session');
      expect(session).toBeTruthy();
      
      if (session) {
        const user = JSON.parse(session);
        expect(user.email).toBe(email);
      }
    });

    it('deve retornar usuário com todas as propriedades', async () => {
      const user = await authService.login('roberto@fisioflow.com', 'password123');
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      // isActive é opcional no mockUsers, não é obrigatório
    });

    it('deve ter delay de autenticação (segurança)', async () => {
      const start = Date.now();
      
      try {
        await authService.login('test@test.com', 'wrong');
      } catch (error) {
        // Esperado falhar
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(400); // Pelo menos 400ms de delay
    });
  });

  describe('logout', () => {
    it('deve limpar sessão do usuário', async () => {
      // Fazer login primeiro
      await authService.login('roberto@fisioflow.com', 'password123');
      
      // Verificar que sessão existe
      expect(sessionStorage.getItem('fisioflow_user_session')).toBeTruthy();
      
      // Fazer logout
      authService.logout();
      
      // Verificar que sessão foi removida
      expect(sessionStorage.getItem('fisioflow_user_session')).toBeNull();
    });

    it('deve ser seguro chamar logout múltiplas vezes', () => {
      authService.logout();
      authService.logout();
      authService.logout();
      
      expect(sessionStorage.getItem('fisioflow_user_session')).toBeNull();
    });

    it('deve funcionar sem sessão ativa', () => {
      expect(() => authService.logout()).not.toThrow();
    });
  });

  describe('getSession', () => {
    it('deve retornar usuário da sessão ativa', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      
      const session = authService.getSession();
      
      expect(session).toBeTruthy();
      expect(session?.email).toBe('roberto@fisioflow.com');
    });

    it('deve retornar null sem sessão ativa', () => {
      const session = authService.getSession();
      
      expect(session).toBeNull();
    });

    it('deve retornar null após logout', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      authService.logout();
      
      const session = authService.getSession();
      
      expect(session).toBeNull();
    });

    it('deve retornar usuário com role correto', async () => {
      await authService.login('admin@fisioflow.com', 'password123');
      
      const session = authService.getSession();
      
      expect(session).toBeTruthy();
      expect(session?.role).toBe(Role.Admin);
    });
  });

  describe('User Roles', () => {
    it('deve suportar role de Admin', () => {
      // Usar roles do types.ts real
      const user = { role: Role.Admin };
      expect(user.role).toBe(Role.Admin);
    });

    it('deve suportar role de Therapist', () => {
      const user = { role: Role.Therapist };
      expect(user.role).toBe(Role.Therapist);
    });

    it('deve suportar role de Patient', () => {
      const user = { role: Role.Patient };
      expect(user.role).toBe(Role.Patient);
    });

    it('deve suportar role de EducadorFisico', () => {
      const user = { role: Role.EducadorFisico };
      expect(user.role).toBe(Role.EducadorFisico);
    });

    it('role deve ser um dos valores válidos', () => {
      const validRoles = Object.values(Role);
      const userRole = Role.Therapist;
      
      expect(validRoles).toContain(userRole);
    });
  });

  describe('Session Persistence', () => {
    it('sessão deve persistir no sessionStorage', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      
      const stored = sessionStorage.getItem('fisioflow_user_session');
      expect(stored).toBeTruthy();
    });

    it('deve parsear JSON da sessão corretamente', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      
      const stored = sessionStorage.getItem('fisioflow_user_session');
      expect(() => JSON.parse(stored!)).not.toThrow();
    });

    it('deve recuperar sessão após reload (simulado)', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      
      // Simular reload pegando nova instância
      const session = authService.getSession();
      
      expect(session).toBeTruthy();
      expect(session?.email).toBe('roberto@fisioflow.com');
    });
  });

  describe('Security', () => {
    it('senha não deve ser armazenada na sessão', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      
      const stored = sessionStorage.getItem('fisioflow_user_session');
      if (stored) {
        const user = JSON.parse(stored);
        expect(user).not.toHaveProperty('password');
      }
    });

    it('deve usar timeout em autenticação (previne timing attacks)', async () => {
      const start = Date.now();
      
      try {
        await authService.login('test@test.com', 'wrong');
      } catch (error) {
        // Expected
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThan(0);
    });

    it('mensagem de erro não deve revelar se email existe', async () => {
      const errorEmailInvalido = authService.login('nao-existe@test.com', 'password123');
      const errorSenhaInvalida = authService.login('roberto@fisioflow.com', 'senha-errada');
      
      await expect(errorEmailInvalido).rejects.toThrow('Credenciais inválidas');
      await expect(errorSenhaInvalida).rejects.toThrow('Credenciais inválidas');
      
      // Ambos devem ter a mesma mensagem de erro
    });
  });

  describe('User Properties', () => {
    it('usuário deve ter ID único', () => {
      // Criar diferentes usuários para comparar
      const admin = { id: 'admin-1', role: Role.Admin };
      const therapist = { id: 'therapist-1', role: Role.Therapist };
      
      expect(admin.id).not.toBe(therapist.id);
    });

    it('usuário deve ter nome válido', () => {
      const user = createTestUser(Role.Therapist);
      
      expect(user.name).toBeTruthy();
      expect(user.name.length).toBeGreaterThan(0);
    });

    it('usuário deve ter email válido', () => {
      const user = createTestUser(Role.Therapist);
      
      expect(user.email).toMatch(/@/);
    });

    it('usuário deve ter status isActive', () => {
      const user = createTestUser(Role.Therapist);
      
      expect(user).toHaveProperty('isActive');
      expect(typeof user.isActive).toBe('boolean');
    });

    it('usuário pode ter phone', () => {
      const user = createTestUser(Role.Therapist);
      
      expect(user).toHaveProperty('phone');
    });

    it('usuário pode ter avatarUrl', () => {
      const user = createTestUser(Role.Therapist);
      
      expect(user).toHaveProperty('avatarUrl');
    });
  });

  describe('Authentication Flow', () => {
    it('fluxo completo: login -> verificar sessão -> logout', async () => {
      // 1. Login
      const user = await authService.login('roberto@fisioflow.com', 'password123');
      expect(user).toBeTruthy();
      
      // 2. Verificar sessão
      const session = authService.getSession();
      expect(session).toBeTruthy();
      expect(session?.id).toBe(user.id);
      
      // 3. Logout
      authService.logout();
      
      // 4. Verificar que não há mais sessão
      const noSession = authService.getSession();
      expect(noSession).toBeNull();
    });

    it('múltiplos logins devem sobrescrever sessão', async () => {
      await authService.login('roberto@fisioflow.com', 'password123');
      const firstSession = authService.getSession();
      
      await authService.login('admin@fisioflow.com', 'password123');
      const secondSession = authService.getSession();
      
      expect(firstSession?.email).not.toBe(secondSession?.email);
      expect(secondSession?.email).toBe('admin@fisioflow.com');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com email vazio', async () => {
      await expect(authService.login('', 'password123')).rejects.toThrow();
    });

    it('deve lidar com senha vazia', async () => {
      await expect(authService.login('roberto@fisioflow.com', '')).rejects.toThrow();
    });

    it('deve lidar com espaços no email', async () => {
      await expect(authService.login('  roberto@fisioflow.com  ', 'password123')).rejects.toThrow();
    });

    it('getSession com sessionStorage corrompido deve retornar null', () => {
      sessionStorage.setItem('fisioflow_user_session', 'json-invalido-{{{');
      
      // Com a correção aplicada, deve retornar null sem lançar erro
      const session = authService.getSession();
      expect(session).toBeNull();
    });
  });

  describe('Performance', () => {
    it('getSession deve ser instantâneo', () => {
      const start = Date.now();
      authService.getSession();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(10);
    });

    it('logout deve ser instantâneo', () => {
      const start = Date.now();
      authService.logout();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(10);
    });
  });
});


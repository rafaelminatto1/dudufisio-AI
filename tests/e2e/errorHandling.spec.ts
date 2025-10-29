/**
 * Testes E2E para Tratamento de Erros
 * 
 * Valida comportamento de erro em fluxos principais
 */

import { test, expect } from '@playwright/test';

test.describe('Tratamento de Erros - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Estados de Loading', () => {
    test('deve mostrar loading ao carregar lista de pacientes', async ({ page }) => {
      // Interceptar requisição para adicionar delay
      await page.route('**/api/patients*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/patients');
      
      // Verificar que loading aparece
      await expect(page.getByText(/carregando/i)).toBeVisible();
      
      // Aguardar loading desaparecer
      await expect(page.getByText(/carregando/i)).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Estados de Erro', () => {
    test('deve mostrar ErrorState quando falha ao carregar pacientes', async ({ page }) => {
      // Simular erro de rede
      await page.route('**/api/patients*', (route) => {
        route.abort('failed');
      });

      await page.goto('/patients');
      
      // Verificar que erro aparece
      await expect(page.getByText(/erro/i)).toBeVisible();
      await expect(page.getByText(/tentar novamente/i)).toBeVisible();
    });

    test('deve permitir retry quando ErrorState é exibido', async ({ page }) => {
      let requestCount = 0;
      
      // Simular erro na primeira tentativa, sucesso na segunda
      await page.route('**/api/patients*', (route) => {
        requestCount++;
        if (requestCount === 1) {
          route.abort('failed');
        } else {
          route.fulfill({
            status: 200,
            body: JSON.stringify([])
          });
        }
      });

      await page.goto('/patients');
      
      // Aguardar erro
      await expect(page.getByText(/erro/i)).toBeVisible();
      
      // Clicar em retry
      await page.getByText(/tentar novamente/i).click();
      
      // Verificar que erro sumiu após retry
      await expect(page.getByText(/erro/i)).not.toBeVisible();
    });
  });

  test.describe('Estados Vazios', () => {
    test('deve mostrar EmptyState quando não há pacientes', async ({ page }) => {
      // Simular resposta vazia
      await page.route('**/api/patients*', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([])
        });
      });

      await page.goto('/patients');
      
      // Verificar que empty state aparece
      await expect(page.getByText(/nenhum paciente/i)).toBeVisible();
      await expect(page.getByText(/cadastrar/i)).toBeVisible();
    });
  });

  test.describe('Formulários', () => {
    test('deve mostrar erro de validação ao tentar salvar sem dados obrigatórios', async ({ page }) => {
      await page.goto('/patients/new');
      
      // Tentar salvar sem preencher
      await page.getByRole('button', { name: /salvar/i }).click();
      
      // Verificar que mensagens de validação aparecem
      await expect(page.getByText(/campo obrigatório/i).first()).toBeVisible();
    });

    test('deve mostrar erro ao tentar salvar com CPF duplicado', async ({ page }) => {
      await page.route('**/api/patients', (route) => {
        route.fulfill({
          status: 409,
          body: JSON.stringify({ error: 'CPF já cadastrado' })
        });
      });

      await page.goto('/patients/new');
      
      // Preencher formulário
      await page.fill('[name="name"]', 'João Silva');
      await page.fill('[name="cpf"]', '123.456.789-00');
      await page.fill('[name="phone"]', '(11) 98765-4321');
      
      // Salvar
      await page.getByRole('button', { name: /salvar/i }).click();
      
      // Verificar erro
      await expect(page.getByText(/cpf já cadastrado/i)).toBeVisible();
    });
  });

  test.describe('Retry Automático', () => {
    test('deve fazer retry automático em erro de rede', async ({ page }) => {
      let requestCount = 0;
      
      // Simular erro nas primeiras 2 tentativas, sucesso na 3ª
      await page.route('**/api/patients*', (route) => {
        requestCount++;
        if (requestCount <= 2) {
          route.abort('failed');
        } else {
          route.fulfill({
            status: 200,
            body: JSON.stringify([{ id: '1', name: 'Teste' }])
          });
        }
      });

      await page.goto('/patients');
      
      // Aguardar até 10 segundos (retry deve acontecer automaticamente)
      await page.waitForTimeout(10000);
      
      // Verificar que dados foram carregados após retry
      await expect(page.getByText('Teste')).toBeVisible();
      
      // Verificar que houve 3 tentativas
      expect(requestCount).toBe(3);
    });
  });

  test.describe('Acessibilidade', () => {
    test('ErrorState deve ter atributos ARIA corretos', async ({ page }) => {
      await page.route('**/api/patients*', (route) => {
        route.abort('failed');
      });

      await page.goto('/patients');
      
      // Verificar role="alert"
      const errorContainer = page.locator('[role="alert"]');
      await expect(errorContainer).toBeVisible();
      
      // Verificar aria-live="assertive"
      await expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
    });

    test('LoadingState deve ter atributos ARIA corretos', async ({ page }) => {
      // Interceptar para manter loading visível
      await page.route('**/api/patients*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.continue();
      });

      await page.goto('/patients');
      
      // Verificar role="status"
      const loadingContainer = page.locator('[role="status"]');
      await expect(loadingContainer).toBeVisible();
      
      // Verificar aria-live="polite"
      await expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
    });

    test('botão de retry deve receber foco automaticamente', async ({ page }) => {
      await page.route('**/api/patients*', (route) => {
        route.abort('failed');
      });

      await page.goto('/patients');
      
      // Aguardar erro aparecer
      await page.waitForSelector('text=/tentar novamente/i');
      
      // Verificar que botão está focado
      const retryButton = page.getByRole('button', { name: /tentar novamente/i });
      await expect(retryButton).toBeFocused();
    });
  });

  test.describe('Toasts de Erro', () => {
    test('deve exibir toast ao falhar salvamento de agendamento', async ({ page }) => {
      await page.route('**/api/appointments', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Erro interno' })
        });
      });

      await page.goto('/agenda');
      
      // Criar novo agendamento
      await page.getByRole('button', { name: /novo agendamento/i }).click();
      
      // Preencher e tentar salvar
      // ... (preencher campos)
      await page.getByRole('button', { name: /salvar/i }).click();
      
      // Verificar toast de erro
      await expect(page.locator('.Toastify__toast--error')).toBeVisible();
    });
  });

  test.describe('Mensagens Amigáveis', () => {
    test('erro de rede deve mostrar mensagem amigável', async ({ page }) => {
      await page.route('**/api/patients*', (route) => {
        route.abort('failed');
      });

      await page.goto('/patients');
      
      // Verificar mensagem amigável (não técnica)
      await expect(page.getByText(/problema de conexão/i)).toBeVisible();
      await expect(page.getByText(/verifique sua internet/i)).toBeVisible();
    });

    test('erro de autenticação deve mostrar mensagem amigável', async ({ page }) => {
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'JWT expired' })
        });
      });

      await page.goto('/patients');
      
      // Verificar mensagem sobre sessão
      await expect(page.getByText(/sessão expirada/i)).toBeVisible();
    });
  });
});


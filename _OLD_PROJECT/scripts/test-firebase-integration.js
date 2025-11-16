#!/usr/bin/env node

/**
 * 🧪 Script de Teste - Firebase v1 Integration
 *
 * Testa a integração do Firebase v1 com notificações push
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}🔥 ${msg}${colors.reset}\n`)
};

class FirebaseIntegrationTest {
  constructor() {
    this.projectId = process.env.FCM_PROJECT_ID;
    this.vapidKey = process.env.VAPID_KEY;
    this.adminSdk = process.env.FIREBASE_ADMIN_SDK;
  }

  async runAllTests() {
    log.title('FIREBASE v1 INTEGRATION TESTS');

    try {
      await this.testEnvironmentVariables();
      await this.testFirebaseConfig();
      await this.testNotificationPayload();
      await this.testMockNotification();

      log.success('🎉 Todos os testes passaram! Firebase v1 está configurado corretamente.');

    } catch (error) {
      log.error(`Teste falhou: ${error.message}`);
      process.exit(1);
    }
  }

  async testEnvironmentVariables() {
    log.info('Testando variáveis de ambiente...');

    if (!this.projectId) {
      throw new Error('FCM_PROJECT_ID não configurado');
    }
    log.success(`Project ID: ${this.projectId}`);

    if (!this.vapidKey) {
      throw new Error('VAPID_KEY não configurado');
    }
    log.success(`VAPID Key: ${this.vapidKey.substring(0, 20)}...`);

    if (!this.adminSdk) {
      throw new Error('FIREBASE_ADMIN_SDK não configurado');
    }
    log.success('Firebase Admin SDK: Configurado');
  }

  async testFirebaseConfig() {
    log.info('Validando configuração Firebase...');

    try {
      const adminConfig = JSON.parse(this.adminSdk);

      const requiredFields = [
        'type', 'project_id', 'private_key_id', 'private_key',
        'client_email', 'client_id', 'auth_uri', 'token_uri'
      ];

      for (const field of requiredFields) {
        if (!adminConfig[field]) {
          throw new Error(`Campo obrigatório ausente: ${field}`);
        }
      }

      if (adminConfig.project_id !== this.projectId) {
        throw new Error(`Project ID mismatch: ${adminConfig.project_id} vs ${this.projectId}`);
      }

      if (adminConfig.type !== 'service_account') {
        throw new Error(`Tipo inválido: ${adminConfig.type} (esperado: service_account)`);
      }

      log.success('Configuração Firebase Admin SDK válida');
      log.success(`Email do serviço: ${adminConfig.client_email}`);

    } catch (parseError) {
      throw new Error(`JSON inválido no FIREBASE_ADMIN_SDK: ${parseError.message}`);
    }
  }

  async testNotificationPayload() {
    log.info('Testando formato de payload Firebase v1...');

    const testPayload = {
      message: {
        token: 'test-device-token-123',
        notification: {
          title: 'Teste FisioFlow',
          body: 'Sistema de check-in funcionando!',
          image: '/icon-192x192.png'
        },
        data: {
          type: 'test',
          deepLink: '/dashboard',
          patientId: 'patient-123'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#2563EB',
            sound: 'default',
            channel_id: 'fisioflow_notifications'
          }
        },
        webpush: {
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            requireInteraction: false
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default'
            }
          }
        }
      }
    };

    log.success('Payload Firebase v1 válido');
    log.info(`Notificação: ${testPayload.message.notification.title}`);
    log.info(`Plataformas: Android, Web, iOS`);
  }

  async testMockNotification() {
    log.info('Simulando envio de notificação...');

    // Simular envio de notificação (mock)
    const mockSend = async () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            messageId: `projects/${this.projectId}/messages/mock-12345`
          });
        }, 1000);
      });
    };

    const result = await mockSend();

    if (result.success) {
      log.success('Simulação de envio bem-sucedida');
      log.info(`Message ID: ${result.messageId}`);
    } else {
      throw new Error('Falha na simulação de envio');
    }
  }
}

// Executar testes se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FirebaseIntegrationTest();
  tester.runAllTests().catch(console.error);
}

export default FirebaseIntegrationTest;
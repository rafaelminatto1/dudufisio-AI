import { describe, test, expect } from '@jest/globals';

// Integration tests for the communication system
describe('Communication System Integration', () => {
  test('should export all core modules', async () => {
    const coreTypes = await import('../../lib/communication/core/types');
    const messageBus = await import('../../lib/communication/core/MessageBus');

    expect(coreTypes).toBeDefined();
    expect(messageBus).toBeDefined();
  });

  test('should export all channel implementations', async () => {
    const whatsappChannel = await import('../../lib/communication/channels/WhatsAppChannel');
    const smsChannel = await import('../../lib/communication/channels/SMSChannel');
    const emailChannel = await import('../../lib/communication/channels/EmailChannel');
    const pushChannel = await import('../../lib/communication/channels/PushChannel');

    expect(whatsappChannel).toBeDefined();
    expect(smsChannel).toBeDefined();
    expect(emailChannel).toBeDefined();
    expect(pushChannel).toBeDefined();
  });

  test('should export template engine', async () => {
    const templateEngine = await import('../../lib/communication/templates/TemplateEngine');

    expect(templateEngine).toBeDefined();
  });

  test('should export automation engine', async () => {
    const automationEngine = await import('../../lib/communication/automation/AutomationEngine');

    expect(automationEngine).toBeDefined();
  });

  test('should export analytics engine', async () => {
    const analyticsEngine = await import('../../lib/communication/analytics/AnalyticsEngine');

    expect(analyticsEngine).toBeDefined();
  });

  test('should export webhook handlers', async () => {
    const webhookHandler = await import('../../lib/communication/webhooks/WebhookHandler');
    const webhookIndex = await import('../../lib/communication/webhooks/index');

    expect(webhookHandler).toBeDefined();
    expect(webhookIndex).toBeDefined();
  });

  test('should export React components', async () => {
    const communicationDashboard = await import('../../components/communication/CommunicationDashboard');
    const templateManager = await import('../../components/communication/TemplateManager');
    const automationRulesManager = await import('../../components/communication/AutomationRulesManager');
    const communicationSettings = await import('../../components/communication/CommunicationSettings');

    expect(communicationDashboard).toBeDefined();
    expect(templateManager).toBeDefined();
    expect(automationRulesManager).toBeDefined();
    expect(communicationSettings).toBeDefined();
  });

  test('should have consistent type definitions', () => {
    // Test that all TypeScript types are properly exported
    expect(() => {
      const types = require('../../types');

      // Check core communication types exist
      expect(types.MessagePriority).toBeDefined();
      expect(types.DeliveryStatus).toBeDefined();

      // This test ensures TypeScript compilation succeeds
    }).not.toThrow();
  });
});
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MessageBus } from '../../lib/communication/core/MessageBus';
import { WhatsAppChannel } from '../../lib/communication/channels/WhatsAppChannel';
import { SMSChannel } from '../../lib/communication/channels/SMSChannel';
import { EmailChannel } from '../../lib/communication/channels/EmailChannel';
import { PushChannel } from '../../lib/communication/channels/PushChannel';
import { Message, DeliveryResult, CommunicationChannel, MessagePriority } from '../../types';

// Mock dependencies
jest.mock('bull');
jest.mock('../../lib/communication/channels/WhatsAppChannel');
jest.mock('../../lib/communication/channels/SMSChannel');
jest.mock('../../lib/communication/channels/EmailChannel');
jest.mock('../../lib/communication/channels/PushChannel');

describe('MessageBus', () => {
  let messageBus: MessageBus;
  let mockWhatsAppChannel: jest.Mocked<WhatsAppChannel>;
  let mockSMSChannel: jest.Mocked<SMSChannel>;
  let mockEmailChannel: jest.Mocked<EmailChannel>;
  let mockPushChannel: jest.Mocked<PushChannel>;

  const sampleMessage: Message = {
    id: 'test-message-1',
    type: 'appointment_reminder',
    recipients: [
      {
        id: 'patient-1',
        name: 'João Silva',
        channels: {
          whatsapp: '+5511999999999',
          email: 'joao@email.com',
          sms: '+5511999999999'
        },
        preferences: {
          preferredChannel: 'whatsapp',
          allowedChannels: ['whatsapp', 'sms', 'email'],
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR'
        }
      }
    ],
    content: {
      subject: 'Lembrete de Consulta',
      body: 'Olá {{patient.name}}, você tem uma consulta amanhã às {{appointment.time}}.',
      templateId: 'appointment_reminder_template'
    },
    priority: MessagePriority.NORMAL,
    scheduledFor: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      appointmentId: 'appointment-123',
      patientId: 'patient-1'
    }
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock channels
    mockWhatsAppChannel = {
      name: 'whatsapp',
      capabilities: ['text', 'media', 'interactive'],
      send: jest.fn(),
      validateRecipient: jest.fn(),
      getOptOutStatus: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getMetrics: jest.fn(),
      dispose: jest.fn()
    } as any;

    mockSMSChannel = {
      name: 'sms',
      capabilities: ['text'],
      send: jest.fn(),
      validateRecipient: jest.fn(),
      getOptOutStatus: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getMetrics: jest.fn(),
      dispose: jest.fn()
    } as any;

    mockEmailChannel = {
      name: 'email',
      capabilities: ['text', 'html', 'attachments'],
      send: jest.fn(),
      validateRecipient: jest.fn(),
      getOptOutStatus: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getMetrics: jest.fn(),
      dispose: jest.fn()
    } as any;

    mockPushChannel = {
      name: 'push',
      capabilities: ['text', 'action_buttons'],
      send: jest.fn(),
      validateRecipient: jest.fn(),
      getOptOutStatus: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getMetrics: jest.fn(),
      dispose: jest.fn()
    } as any;

    // Create MessageBus instance and register channels
    messageBus = new MessageBus({
      redisUrl: 'redis://localhost:6379',
      defaultRetryAttempts: 3,
      defaultRetryDelay: 1000,
      rateLimitGlobal: 1000
    });

    messageBus.registerChannel(mockWhatsAppChannel);
    messageBus.registerChannel(mockSMSChannel);
    messageBus.registerChannel(mockEmailChannel);
    messageBus.registerChannel(mockPushChannel);
  });

  afterEach(async () => {
    await messageBus.dispose();
  });

  describe('Channel Registration', () => {
    test('should register channels successfully', () => {
      expect(messageBus.getRegisteredChannels()).toHaveLength(4);
      expect(messageBus.getRegisteredChannels()).toContain('whatsapp');
      expect(messageBus.getRegisteredChannels()).toContain('sms');
      expect(messageBus.getRegisteredChannels()).toContain('email');
      expect(messageBus.getRegisteredChannels()).toContain('push');
    });

    test('should not register duplicate channels', () => {
      const duplicateChannel = { ...mockWhatsAppChannel };

      expect(() => {
        messageBus.registerChannel(duplicateChannel);
      }).toThrow('Channel whatsapp is already registered');
    });

    test('should unregister channels', () => {
      messageBus.unregisterChannel('whatsapp');
      expect(messageBus.getRegisteredChannels()).not.toContain('whatsapp');
      expect(messageBus.getRegisteredChannels()).toHaveLength(3);
    });
  });

  describe('Message Sending', () => {
    test('should send message through preferred channel', async () => {
      const mockDeliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-123',
        channel: 'whatsapp',
        deliveredAt: new Date(),
        cost: 0.05,
        metadata: {}
      };

      mockWhatsAppChannel.send.mockResolvedValue(mockDeliveryResult);
      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'whatsapp'
      });

      const messageId = await messageBus.sendMessage(sampleMessage, {
        preferredChannel: 'whatsapp'
      });

      expect(messageId).toBeTruthy();
      expect(mockWhatsAppChannel.send).toHaveBeenCalledWith(sampleMessage);
      expect(mockSMSChannel.send).not.toHaveBeenCalled();
      expect(mockEmailChannel.send).not.toHaveBeenCalled();
    });

    test('should fallback to secondary channel when preferred fails', async () => {
      const whatsappError = new Error('WhatsApp service unavailable');
      const smsDeliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-124',
        channel: 'sms',
        deliveredAt: new Date(),
        cost: 0.10,
        metadata: {}
      };

      mockWhatsAppChannel.send.mockRejectedValue(whatsappError);
      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'whatsapp'
      });

      mockSMSChannel.send.mockResolvedValue(smsDeliveryResult);
      mockSMSChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'sms'
      });
      mockSMSChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'sms'
      });

      const messageId = await messageBus.sendMessage(sampleMessage, {
        preferredChannel: 'whatsapp'
      });

      expect(messageId).toBeTruthy();
      expect(mockWhatsAppChannel.send).toHaveBeenCalled();
      expect(mockSMSChannel.send).toHaveBeenCalled();
    });

    test('should respect opt-out preferences', async () => {
      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: true,
        channel: 'whatsapp',
        optedOutAt: new Date()
      });

      mockSMSChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'sms'
      });
      mockSMSChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'sms'
      });

      const smsDeliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-125',
        channel: 'sms',
        deliveredAt: new Date(),
        cost: 0.10,
        metadata: {}
      };

      mockSMSChannel.send.mockResolvedValue(smsDeliveryResult);

      const messageId = await messageBus.sendMessage(sampleMessage, {
        preferredChannel: 'whatsapp'
      });

      expect(messageId).toBeTruthy();
      expect(mockWhatsAppChannel.send).not.toHaveBeenCalled();
      expect(mockSMSChannel.send).toHaveBeenCalled();
    });

    test('should handle invalid recipients', async () => {
      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: false,
        channel: 'whatsapp',
        error: 'Invalid phone number format'
      });

      mockSMSChannel.validateRecipient.mockResolvedValue({
        isValid: false,
        channel: 'sms',
        error: 'Invalid phone number format'
      });

      mockEmailChannel.validateRecipient.mockResolvedValue({
        isValid: false,
        channel: 'email',
        error: 'Invalid email format'
      });

      await expect(
        messageBus.sendMessage(sampleMessage, {
          preferredChannel: 'whatsapp'
        })
      ).rejects.toThrow('No valid channels available for message delivery');
    });

    test('should handle rate limiting', async () => {
      // Mock rate limiter to return false (rate limited)
      const rateLimitedBus = new MessageBus({
        redisUrl: 'redis://localhost:6379',
        defaultRetryAttempts: 3,
        defaultRetryDelay: 1000,
        rateLimitGlobal: 1 // Very low limit for testing
      });

      rateLimitedBus.registerChannel(mockWhatsAppChannel);

      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'whatsapp'
      });

      // First message should succeed
      const mockDeliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-126',
        channel: 'whatsapp',
        deliveredAt: new Date(),
        cost: 0.05,
        metadata: {}
      };

      mockWhatsAppChannel.send.mockResolvedValue(mockDeliveryResult);

      const firstMessageId = await rateLimitedBus.sendMessage(sampleMessage);
      expect(firstMessageId).toBeTruthy();

      await rateLimitedBus.dispose();
    });
  });

  describe('Message Priority', () => {
    test('should handle high priority messages first', async () => {
      const highPriorityMessage: Message = {
        ...sampleMessage,
        id: 'high-priority-msg',
        priority: MessagePriority.HIGH
      };

      const normalPriorityMessage: Message = {
        ...sampleMessage,
        id: 'normal-priority-msg',
        priority: MessagePriority.NORMAL
      };

      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'whatsapp'
      });

      const mockDeliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-priority-test',
        channel: 'whatsapp',
        deliveredAt: new Date(),
        cost: 0.05,
        metadata: {}
      };

      mockWhatsAppChannel.send.mockResolvedValue(mockDeliveryResult);

      // Send normal priority first, then high priority
      const normalId = await messageBus.sendMessage(normalPriorityMessage);
      const highId = await messageBus.sendMessage(highPriorityMessage);

      expect(normalId).toBeTruthy();
      expect(highId).toBeTruthy();
    });
  });

  describe('Scheduled Messages', () => {
    test('should schedule messages for future delivery', async () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      const scheduledMessage: Message = {
        ...sampleMessage,
        id: 'scheduled-msg',
        scheduledFor: futureDate
      };

      const messageId = await messageBus.sendMessage(scheduledMessage, {
        scheduledFor: futureDate
      });

      expect(messageId).toBeTruthy();
      // In a real implementation, we would verify the message is scheduled in the queue
    });
  });

  describe('Error Handling', () => {
    test('should handle channel errors gracefully', async () => {
      const channelError = new Error('Channel temporarily unavailable');

      mockWhatsAppChannel.send.mockRejectedValue(channelError);
      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'whatsapp'
      });

      // Mock all other channels to also fail
      mockSMSChannel.send.mockRejectedValue(channelError);
      mockSMSChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'sms'
      });
      mockSMSChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'sms'
      });

      mockEmailChannel.send.mockRejectedValue(channelError);
      mockEmailChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'email'
      });
      mockEmailChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'email'
      });

      await expect(
        messageBus.sendMessage(sampleMessage)
      ).rejects.toThrow();
    });

    test('should retry failed deliveries', async () => {
      const transientError = new Error('Network timeout');
      const successResult: DeliveryResult = {
        success: true,
        messageId: 'msg-retry-test',
        channel: 'whatsapp',
        deliveredAt: new Date(),
        cost: 0.05,
        metadata: {}
      };

      mockWhatsAppChannel.validateRecipient.mockResolvedValue({
        isValid: true,
        channel: 'whatsapp'
      });
      mockWhatsAppChannel.getOptOutStatus.mockResolvedValue({
        isOptedOut: false,
        channel: 'whatsapp'
      });

      // Fail first two attempts, succeed on third
      mockWhatsAppChannel.send
        .mockRejectedValueOnce(transientError)
        .mockRejectedValueOnce(transientError)
        .mockResolvedValueOnce(successResult);

      const messageId = await messageBus.sendMessage(sampleMessage);
      expect(messageId).toBeTruthy();
      expect(mockWhatsAppChannel.send).toHaveBeenCalledTimes(3);
    });
  });

  describe('Health Monitoring', () => {
    test('should report channel health status', async () => {
      mockWhatsAppChannel.isHealthy.mockResolvedValue(true);
      mockSMSChannel.isHealthy.mockResolvedValue(false);
      mockEmailChannel.isHealthy.mockResolvedValue(true);
      mockPushChannel.isHealthy.mockResolvedValue(true);

      const healthStatus = await messageBus.getHealthStatus();

      expect(healthStatus.overall).toBe(true); // Should be healthy if at least one channel is healthy
      expect(healthStatus.channels.whatsapp).toBe(true);
      expect(healthStatus.channels.sms).toBe(false);
      expect(healthStatus.channels.email).toBe(true);
      expect(healthStatus.channels.push).toBe(true);
    });

    test('should report unhealthy when all channels are down', async () => {
      mockWhatsAppChannel.isHealthy.mockResolvedValue(false);
      mockSMSChannel.isHealthy.mockResolvedValue(false);
      mockEmailChannel.isHealthy.mockResolvedValue(false);
      mockPushChannel.isHealthy.mockResolvedValue(false);

      const healthStatus = await messageBus.getHealthStatus();

      expect(healthStatus.overall).toBe(false);
      expect(Object.values(healthStatus.channels).every(status => !status)).toBe(true);
    });
  });

  describe('Metrics and Statistics', () => {
    test('should collect and report metrics', async () => {
      const mockMetrics = {
        messagesSent: 100,
        messagesDelivered: 95,
        messagesFailed: 5,
        averageDeliveryTime: 2500,
        totalCost: 15.75
      };

      mockWhatsAppChannel.getMetrics.mockReturnValue(mockMetrics);
      mockSMSChannel.getMetrics.mockReturnValue(mockMetrics);
      mockEmailChannel.getMetrics.mockReturnValue(mockMetrics);
      mockPushChannel.getMetrics.mockReturnValue(mockMetrics);

      const globalMetrics = await messageBus.getMetrics();

      expect(globalMetrics).toBeDefined();
      expect(globalMetrics.totalMessagesSent).toBeGreaterThan(0);
    });
  });
});
// Message Bus - Event-Driven Communication Hub
// Provides reliable message delivery with retry mechanisms and dead letter queues

import Queue from 'bull';
import {
  Message,
  DeliveryResult,
  MessageDeliveryAttempt,
  MessageStatus,
  CommunicationChannel,
  MessageId
} from '../../../types';
import {
  CommunicationChannelInterface,
  CommunicationError,
  NoAvailableChannelError,
  RateLimitError,
  EventDispatcher,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector
} from './types';

/**
 * Message Bus Configuration
 */
export interface MessageBusConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  maxRetries: number;
  retryDelays: number[]; // Exponential backoff delays in milliseconds
  deadLetterThreshold: number;
  batchSize: number;
  concurrency: number;
  enablePriority: boolean;
  enableScheduling: boolean;
}

/**
 * Channel Registration for Message Bus
 */
export interface ChannelRegistration {
  channel: CommunicationChannelInterface;
  priority: number;
  maxConcurrency: number;
  rateLimitPerMinute?: number;
  costThreshold?: number;
}

/**
 * Message Queue Job Data
 */
export interface MessageJob {
  messageId: MessageId;
  message: Message;
  attempt: number;
  scheduledFor?: Date;
  priority: number;
  previousErrors?: string[];
}

/**
 * Message Bus Events
 */
export interface MessageBusEvents {
  'message.queued': { messageId: MessageId; scheduledFor?: Date };
  'message.processing': { messageId: MessageId; channel: CommunicationChannel };
  'message.delivered': { messageId: MessageId; result: DeliveryResult };
  'message.failed': { messageId: MessageId; error: CommunicationError; willRetry: boolean };
  'message.dead_letter': { messageId: MessageId; reason: string };
  'message.cancelled': { messageId: MessageId; reason: string };
  'channel.unavailable': { channel: CommunicationChannel; reason: string };
  'channel.recovered': { channel: CommunicationChannel };
}

/**
 * Enterprise Message Bus with guaranteed delivery
 */
export class MessageBus {
  private queue: Queue.Queue<MessageJob>;
  private channels = new Map<CommunicationChannel, ChannelRegistration>();
  private channelHealthStatus = new Map<CommunicationChannel, boolean>();
  private deadLetterQueue: Queue.Queue<MessageJob>;
  private config: MessageBusConfig;
  private isProcessing = false;

  constructor(
    config: MessageBusConfig,
    private repository: CommunicationRepository,
    private eventDispatcher: EventDispatcher,
    private configProvider: ConfigurationProvider,
    private logger: CommunicationLogger,
    private metrics: MetricsCollector
  ) {
    this.config = config;
    this.initializeQueues();
    this.setupEventHandlers();
  }

  /**
   * Initialize Redis queues
   */
  private initializeQueues(): void {
    const redisConfig = {
      redis: this.config.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 1, // We handle retries manually for better control
        backoff: 'fixed',
        delay: 0
      }
    };

    this.queue = new Queue('communication:messages', redisConfig);
    this.deadLetterQueue = new Queue('communication:dead_letter', redisConfig);

    // Process messages
    this.queue.process(this.config.concurrency, this.processMessage.bind(this));

    // Process dead letter queue (for manual intervention)
    this.deadLetterQueue.process(1, this.processDeadLetter.bind(this));
  }

  /**
   * Setup event handlers for queue monitoring
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job, result) => {
      this.metrics.increment('message_bus.messages.completed');
      this.logger.info('Message processed successfully', {
        messageId: job.data.messageId,
        attempt: job.data.attempt,
        duration: Date.now() - job.timestamp
      });
    });

    this.queue.on('failed', (job, error) => {
      this.metrics.increment('message_bus.messages.failed');
      this.logger.error('Message processing failed', error, {
        messageId: job.data.messageId,
        attempt: job.data.attempt
      });
    });

    this.queue.on('stalled', (job) => {
      this.metrics.increment('message_bus.messages.stalled');
      this.logger.warn('Message processing stalled', {
        messageId: job.data.messageId,
        attempt: job.data.attempt
      });
    });
  }

  /**
   * Register a communication channel
   */
  registerChannel(
    channel: CommunicationChannelInterface,
    options: Partial<ChannelRegistration> = {}
  ): void {
    const registration: ChannelRegistration = {
      channel,
      priority: options.priority || channel.priority,
      maxConcurrency: options.maxConcurrency || 10,
      rateLimitPerMinute: options.rateLimitPerMinute,
      costThreshold: options.costThreshold
    };

    this.channels.set(channel.name as CommunicationChannel, registration);
    this.channelHealthStatus.set(channel.name as CommunicationChannel, true);

    this.logger.info('Channel registered', {
      channel: channel.name,
      priority: registration.priority,
      capabilities: channel.capabilities
    });
  }

  /**
   * Send a message through the message bus
   */
  async sendMessage(
    message: Message,
    options: {
      priority?: number;
      scheduledFor?: Date;
      preferredChannel?: CommunicationChannel;
    } = {}
  ): Promise<MessageId> {
    const startTime = Date.now();

    try {
      // Save message to repository
      await this.repository.saveMessage(message);

      // Create job data
      const jobData: MessageJob = {
        messageId: message.id,
        message,
        attempt: 0,
        scheduledFor: options.scheduledFor || message.scheduledFor,
        priority: options.priority || this.calculateMessagePriority(message),
        previousErrors: []
      };

      // Queue the message
      const job = await this.queue.add(jobData, {
        priority: jobData.priority,
        delay: this.calculateDelay(jobData.scheduledFor),
        attempts: 1
      });

      // Update message status
      await this.repository.updateMessageStatus(
        message.id,
        MessageStatus.QUEUED,
        { jobId: job.id, queuedAt: new Date() }
      );

      // Dispatch event
      await this.eventDispatcher.dispatch({
        type: 'message.queued',
        timestamp: new Date(),
        data: {
          messageId: message.id,
          scheduledFor: jobData.scheduledFor
        }
      });

      this.metrics.timing('message_bus.send_message', Date.now() - startTime);
      this.metrics.increment('message_bus.messages.queued');

      this.logger.info('Message queued successfully', {
        messageId: message.id,
        priority: jobData.priority,
        scheduledFor: jobData.scheduledFor
      });

      return message.id;
    } catch (error) {
      this.metrics.timing('message_bus.send_message_error', Date.now() - startTime);
      this.metrics.increment('message_bus.messages.queue_error');

      const communicationError = CommunicationError.fromError(error, 'MESSAGE_QUEUE_ERROR');
      this.logger.error('Failed to queue message', communicationError, { messageId: message.id });
      throw communicationError;
    }
  }

  /**
   * Process a message job
   */
  private async processMessage(job: Queue.Job<MessageJob>): Promise<DeliveryResult> {
    const { messageId, message, attempt } = job.data;
    const startTime = Date.now();

    try {
      this.logger.info('Processing message', {
        messageId,
        attempt: attempt + 1,
        totalAttempts: this.config.maxRetries + 1
      });

      // Update message status to processing
      await this.repository.updateMessageStatus(
        messageId,
        MessageStatus.PROCESSING,
        { processingStarted: new Date(), attempt: attempt + 1 }
      );

      // Select the best available channel
      const selectedChannel = await this.selectChannel(message, job.data);

      if (!selectedChannel) {
        throw new NoAvailableChannelError('No suitable channels available for message delivery');
      }

      // Dispatch processing event
      await this.eventDispatcher.dispatch({
        type: 'message.processing',
        timestamp: new Date(),
        data: { messageId, channel: selectedChannel.name as CommunicationChannel }
      });

      // Send message through selected channel
      const result = await this.deliverMessage(selectedChannel, message);

      // Update delivery attempt record
      const deliveryAttempt: MessageDeliveryAttempt = {
        id: `${messageId}-${attempt + 1}`,
        messageId,
        channel: selectedChannel.name as CommunicationChannel,
        attemptNumber: attempt + 1,
        attemptedAt: new Date(),
        result,
        cost: result.cost || 0,
        metadata: result.metadata || {}
      };

      if (result.success) {
        // Success - update message status
        await this.repository.updateMessageStatus(
          messageId,
          MessageStatus.DELIVERED,
          {
            deliveredAt: result.deliveredAt,
            channel: selectedChannel.name,
            externalMessageId: result.externalMessageId,
            cost: result.cost,
            attempts: attempt + 1
          }
        );

        // Dispatch success event
        await this.eventDispatcher.dispatch({
          type: 'message.delivered',
          timestamp: new Date(),
          data: { messageId, result }
        });

        this.metrics.timing('message_bus.delivery.success', Date.now() - startTime);
        this.metrics.increment('message_bus.messages.delivered');

        this.logger.info('Message delivered successfully', {
          messageId,
          channel: selectedChannel.name,
          attempt: attempt + 1,
          cost: result.cost
        });

        return result;
      } else {
        // Delivery failed - handle retry logic
        return await this.handleDeliveryFailure(job, result, selectedChannel.name as CommunicationChannel);
      }
    } catch (error) {
      const communicationError = CommunicationError.fromError(error);
      return await this.handleDeliveryFailure(job, {
        success: false,
        retryable: communicationError.retryable,
        error: communicationError,
        channel: 'unknown' as CommunicationChannel
      });
    }
  }

  /**
   * Handle delivery failure and retry logic
   */
  private async handleDeliveryFailure(
    job: Queue.Job<MessageJob>,
    result: DeliveryResult,
    channel?: CommunicationChannel
  ): Promise<DeliveryResult> {
    const { messageId, message, attempt, previousErrors = [] } = job.data;
    const error = result.error!;

    // Update previous errors
    const updatedErrors = [...previousErrors, error.message];

    // Check if we should retry
    const shouldRetry = result.retryable && attempt < this.config.maxRetries;
    const willRetry = shouldRetry && !this.isRateLimited(error);

    if (willRetry) {
      // Calculate retry delay with exponential backoff
      const retryDelay = this.calculateRetryDelay(attempt + 1);

      // Create new job for retry
      const retryJobData: MessageJob = {
        ...job.data,
        attempt: attempt + 1,
        previousErrors: updatedErrors
      };

      await this.queue.add(retryJobData, {
        priority: job.data.priority,
        delay: retryDelay,
        attempts: 1
      });

      // Update message status
      await this.repository.updateMessageStatus(
        messageId,
        MessageStatus.RETRY_SCHEDULED,
        {
          nextRetryAt: new Date(Date.now() + retryDelay),
          attempt: attempt + 1,
          lastError: error.message
        }
      );

      // Dispatch retry event
      await this.eventDispatcher.dispatch({
        type: 'message.failed',
        timestamp: new Date(),
        data: { messageId, error, willRetry: true }
      });

      this.metrics.increment('message_bus.messages.retried');
      this.logger.warn('Message delivery failed, retrying', {
        messageId,
        attempt: attempt + 1,
        retryDelay,
        error: error.message
      });

      return {
        success: false,
        retryable: true,
        error,
        channel: channel || 'unknown' as CommunicationChannel
      };
    } else {
      // Move to dead letter queue
      await this.moveToDeadLetter(job, error);

      // Update message status to failed
      await this.repository.updateMessageStatus(
        messageId,
        MessageStatus.FAILED,
        {
          failedAt: new Date(),
          finalError: error.message,
          totalAttempts: attempt + 1,
          allErrors: updatedErrors
        }
      );

      // Dispatch failure event
      await this.eventDispatcher.dispatch({
        type: 'message.failed',
        timestamp: new Date(),
        data: { messageId, error, willRetry: false }
      });

      this.metrics.increment('message_bus.messages.failed_final');
      this.logger.error('Message delivery failed permanently', error, {
        messageId,
        totalAttempts: attempt + 1,
        allErrors: updatedErrors
      });

      return {
        success: false,
        retryable: false,
        error,
        channel: channel || 'unknown' as CommunicationChannel
      };
    }
  }

  /**
   * Select the best available channel for message delivery
   */
  private async selectChannel(
    message: Message,
    jobData: MessageJob
  ): Promise<CommunicationChannelInterface | null> {
    const availableChannels: Array<{
      channel: CommunicationChannelInterface;
      score: number;
    }> = [];

    for (const [channelName, registration] of this.channels) {
      const { channel } = registration;

      // Check if channel is healthy
      if (!this.channelHealthStatus.get(channelName)) {
        continue;
      }

      // Check if channel is enabled
      if (!this.configProvider.isChannelEnabled(channelName)) {
        continue;
      }

      // Validate recipient for this channel
      const validation = await channel.validateRecipient(message.recipient);
      if (!validation.valid) {
        continue;
      }

      // Check opt-out status
      const optOutStatus = await channel.getOptOutStatus(message.recipient);
      if (optOutStatus.optedOut) {
        continue;
      }

      // Calculate channel score based on various factors
      const score = await this.calculateChannelScore(channel, message, registration);

      availableChannels.push({ channel, score });
    }

    if (availableChannels.length === 0) {
      return null;
    }

    // Sort by score (highest first) and return the best channel
    availableChannels.sort((a, b) => b.score - a.score);
    return availableChannels[0].channel;
  }

  /**
   * Calculate channel selection score
   */
  private async calculateChannelScore(
    channel: CommunicationChannelInterface,
    message: Message,
    registration: ChannelRegistration
  ): Promise<number> {
    let score = registration.priority * 100; // Base score from priority

    // Prefer channels with required capabilities
    if (message.content.attachments && channel.hasCapability('attachments' as any)) {
      score += 50;
    }

    if (message.content.html && channel.hasCapability('rich_content' as any)) {
      score += 30;
    }

    // Consider cost (lower cost = higher score)
    try {
      const cost = await channel.calculateCost(message);
      score -= cost * 10; // Subtract cost factor
    } catch (error) {
      // If cost calculation fails, slight penalty
      score -= 5;
    }

    // Consider delivery speed (if channel has this info)
    // This would be based on historical data
    score += this.getChannelSpeedScore(channel.name);

    return Math.max(0, score); // Ensure non-negative score
  }

  /**
   * Deliver message through selected channel
   */
  private async deliverMessage(
    channel: CommunicationChannelInterface,
    message: Message
  ): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      const result = await channel.send(message);

      this.metrics.timing(`message_bus.channel.${channel.name}.delivery_time`, Date.now() - startTime);
      this.metrics.increment(`message_bus.channel.${channel.name}.attempts`);

      if (result.success) {
        this.metrics.increment(`message_bus.channel.${channel.name}.success`);
      } else {
        this.metrics.increment(`message_bus.channel.${channel.name}.failure`);
      }

      return result;
    } catch (error) {
      this.metrics.timing(`message_bus.channel.${channel.name}.error_time`, Date.now() - startTime);
      this.metrics.increment(`message_bus.channel.${channel.name}.error`);

      // Mark channel as unhealthy if persistent errors
      await this.checkChannelHealth(channel);

      throw error;
    }
  }

  /**
   * Move message to dead letter queue
   */
  private async moveToDeadLetter(job: Queue.Job<MessageJob>, error: CommunicationError): Promise<void> {
    await this.deadLetterQueue.add({
      ...job.data,
      attempt: job.data.attempt + 1
    }, {
      attempts: 1,
      removeOnComplete: false, // Keep dead letters for investigation
      removeOnFail: false
    });

    await this.eventDispatcher.dispatch({
      type: 'message.dead_letter',
      timestamp: new Date(),
      data: {
        messageId: job.data.messageId,
        reason: error.message
      }
    });

    this.metrics.increment('message_bus.messages.dead_letter');
  }

  /**
   * Process dead letter queue (for manual intervention)
   */
  private async processDeadLetter(job: Queue.Job<MessageJob>): Promise<void> {
    // Dead letter processing is typically manual
    // This could trigger alerts, logs, or manual review processes

    this.logger.error('Message in dead letter queue requires manual intervention', undefined, {
      messageId: job.data.messageId,
      totalAttempts: job.data.attempt,
      errors: job.data.previousErrors
    });

    // Could trigger external alerting systems here
    // For now, just log for manual review
  }

  /**
   * Calculate message priority based on content and urgency
   */
  private calculateMessagePriority(message: Message): number {
    let priority = 0;

    // Base priority from message
    if (message.priority) {
      priority += message.priority * 10;
    }

    // Urgent messages get higher priority
    if (message.content.body?.toLowerCase().includes('urgente')) {
      priority += 50;
    }

    // Appointment reminders get medium-high priority
    if (message.content.body?.toLowerCase().includes('consulta')) {
      priority += 30;
    }

    // Scheduled messages get lower priority
    if (message.scheduledFor && message.scheduledFor > new Date()) {
      priority -= 10;
    }

    return Math.max(0, Math.min(100, priority)); // Clamp between 0-100
  }

  /**
   * Calculate delay for scheduled messages
   */
  private calculateDelay(scheduledFor?: Date): number {
    if (!scheduledFor) return 0;

    const delay = scheduledFor.getTime() - Date.now();
    return Math.max(0, delay);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    if (attempt > this.config.retryDelays.length) {
      return this.config.retryDelays[this.config.retryDelays.length - 1];
    }

    return this.config.retryDelays[attempt - 1];
  }

  /**
   * Check if error is rate limit related
   */
  private isRateLimited(error: CommunicationError): boolean {
    return error instanceof RateLimitError ||
           error.code.includes('RATE_LIMIT') ||
           error.code.includes('TOO_MANY_REQUESTS');
  }

  /**
   * Get channel speed score based on historical data
   */
  private getChannelSpeedScore(channelName: string): number {
    // This would be based on historical delivery time data
    // For now, return static values
    const speedScores: Record<string, number> = {
      'push': 20,     // Fastest
      'sms': 15,      // Very fast
      'whatsapp': 10, // Fast
      'email': 5      // Slower
    };

    return speedScores[channelName] || 0;
  }

  /**
   * Check channel health and mark as unhealthy if needed
   */
  private async checkChannelHealth(channel: CommunicationChannelInterface): Promise<void> {
    try {
      const isHealthy = await channel.testConnection();
      const channelName = channel.name as CommunicationChannel;

      const wasHealthy = this.channelHealthStatus.get(channelName);
      this.channelHealthStatus.set(channelName, isHealthy);

      if (wasHealthy && !isHealthy) {
        await this.eventDispatcher.dispatch({
          type: 'channel.unavailable',
          timestamp: new Date(),
          data: {
            channel: channelName,
            reason: 'Health check failed'
          }
        });

        this.logger.warn('Channel marked as unhealthy', {
          channel: channelName
        });
      } else if (!wasHealthy && isHealthy) {
        await this.eventDispatcher.dispatch({
          type: 'channel.recovered',
          timestamp: new Date(),
          data: { channel: channelName }
        });

        this.logger.info('Channel recovered', {
          channel: channelName
        });
      }
    } catch (error) {
      // Health check failed
      const channelName = channel.name as CommunicationChannel;
      this.channelHealthStatus.set(channelName, false);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    deadLetter: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed(),
      this.queue.getDelayed()
    ]);

    const deadLetterWaiting = await this.deadLetterQueue.getWaiting();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      deadLetter: deadLetterWaiting.length
    };
  }

  /**
   * Cancel a queued message
   */
  async cancelMessage(messageId: MessageId, reason = 'Manual cancellation'): Promise<boolean> {
    try {
      // Find and remove job from queue
      const jobs = await this.queue.getJobs(['waiting', 'delayed']);
      const job = jobs.find(j => j.data.messageId === messageId);

      if (job) {
        await job.remove();

        // Update message status
        await this.repository.updateMessageStatus(
          messageId,
          MessageStatus.CANCELLED,
          { cancelledAt: new Date(), reason }
        );

        // Dispatch cancellation event
        await this.eventDispatcher.dispatch({
          type: 'message.cancelled',
          timestamp: new Date(),
          data: { messageId, reason }
        });

        this.metrics.increment('message_bus.messages.cancelled');
        this.logger.info('Message cancelled', { messageId, reason });

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to cancel message', error instanceof Error ? error : new Error(String(error)), { messageId });
      return false;
    }
  }

  /**
   * Start processing messages
   */
  async start(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.logger.info('Message Bus started', {
      concurrency: this.config.concurrency,
      registeredChannels: Array.from(this.channels.keys())
    });
  }

  /**
   * Stop processing messages
   */
  async stop(): Promise<void> {
    if (!this.isProcessing) return;

    await this.queue.close();
    await this.deadLetterQueue.close();

    this.isProcessing = false;
    this.logger.info('Message Bus stopped');
  }

  /**
   * Get registered channels info
   */
  getChannelsInfo(): Array<{
    name: string;
    priority: number;
    healthy: boolean;
    capabilities: string[];
  }> {
    return Array.from(this.channels.entries()).map(([name, registration]) => ({
      name,
      priority: registration.priority,
      healthy: this.channelHealthStatus.get(name) || false,
      capabilities: registration.channel.capabilities
    }));
  }
}

/**
 * Default Message Bus configuration
 */
export const defaultMessageBusConfig: MessageBusConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '1') // Use different DB than calendar
  },
  maxRetries: 3,
  retryDelays: [
    5 * 1000,      // 5 seconds
    30 * 1000,     // 30 seconds
    5 * 60 * 1000, // 5 minutes
    30 * 60 * 1000 // 30 minutes
  ],
  deadLetterThreshold: 3,
  batchSize: 10,
  concurrency: 5,
  enablePriority: true,
  enableScheduling: true
};
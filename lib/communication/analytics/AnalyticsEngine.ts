// Analytics Engine - Comprehensive communication metrics and reporting

import {
  CommunicationChannel,
  MessageStatus,
  MessageType,
  Message
} from '../../../types';
import {
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector,
  EventDispatcher
} from '../core/types';

/**
 * Analytics Configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  realTimeEnabled: boolean;
  aggregationInterval: number; // minutes
  retentionDays: number;
  enableCohortAnalysis: boolean;
  enablePredictiveAnalytics: boolean;
  enableCustomEvents: boolean;
  dashboardRefreshInterval: number;
}

/**
 * Communication Metrics
 */
export interface CommunicationMetrics {
  // Volume metrics
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  totalBounced: number;
  totalOptOuts: number;

  // Rate metrics (percentages)
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  bounceRate: number;
  optOutRate: number;
  engagementRate: number;

  // Performance metrics
  averageDeliveryTime: number; // milliseconds
  averageResponseTime: number;
  peakHourDelivery: number;

  // Cost metrics
  totalCost: number;
  costPerMessage: number;
  costPerDelivery: number;
  costPerEngagement: number;

  // Channel distribution
  channelDistribution: Record<CommunicationChannel, number>;
  messageTypeDistribution: Record<MessageType, number>;
}

/**
 * Time Series Data Point
 */
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Analytics Filter
 */
export interface AnalyticsFilter {
  startDate: Date;
  endDate: Date;
  channels?: CommunicationChannel[];
  messageTypes?: MessageType[];
  patientIds?: string[];
  status?: MessageStatus[];
  templateIds?: string[];
  automationRuleIds?: string[];
}

/**
 * Cohort Analysis Data
 */
export interface CohortData {
  cohortId: string;
  cohortName: string;
  cohortDate: Date;
  totalUsers: number;
  retentionByPeriod: Record<string, number>; // period -> retention rate
  engagementByPeriod: Record<string, number>;
  conversionByPeriod: Record<string, number>;
}

/**
 * Predictive Analytics Data
 */
export interface PredictiveData {
  prediction: string;
  confidence: number;
  expectedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

/**
 * Real-time Analytics Event
 */
export interface AnalyticsEvent {
  type: string;
  timestamp: Date;
  channel: CommunicationChannel;
  messageId?: string;
  patientId?: string;
  metadata: Record<string, any>;
}

/**
 * Analytics Dashboard Data
 */
export interface DashboardData {
  overview: CommunicationMetrics;
  timeSeries: {
    sent: TimeSeriesPoint[];
    delivered: TimeSeriesPoint[];
    read: TimeSeriesPoint[];
    failed: TimeSeriesPoint[];
    cost: TimeSeriesPoint[];
  };
  channelPerformance: Record<CommunicationChannel, CommunicationMetrics>;
  messageTypePerformance: Record<MessageType, CommunicationMetrics>;
  topPerformingTemplates: Array<{
    templateId: string;
    templateName: string;
    metrics: CommunicationMetrics;
  }>;
  automationPerformance: Array<{
    ruleId: string;
    ruleName: string;
    executions: number;
    successRate: number;
    messagesSent: number;
  }>;
  recentActivity: AnalyticsEvent[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
    severity: number;
  }>;
}

/**
 * Main Analytics Engine
 */
export class AnalyticsEngine {
  private realtimeEvents: AnalyticsEvent[] = [];
  private alertThresholds = new Map<string, number>();
  private cohortCache = new Map<string, CohortData>();

  constructor(
    private config: AnalyticsConfig,
    private repository: CommunicationRepository,
    private configProvider: ConfigurationProvider,
    private logger: CommunicationLogger,
    private metrics: MetricsCollector,
    private eventDispatcher: EventDispatcher
  ) {
    this.setupEventListeners();
    this.initializeAlertThresholds();
    this.startPeriodicAggregation();
  }

  /**
   * Setup event listeners for real-time analytics
   */
  private setupEventListeners(): void {
    if (!this.config.realTimeEnabled) return;

    // Listen for message events
    this.eventDispatcher.subscribe('message.sent', this.handleMessageEvent.bind(this));
    this.eventDispatcher.subscribe('message.delivered', this.handleMessageEvent.bind(this));
    this.eventDispatcher.subscribe('message.read', this.handleMessageEvent.bind(this));
    this.eventDispatcher.subscribe('message.failed', this.handleMessageEvent.bind(this));

    // Listen for automation events
    this.eventDispatcher.subscribe('automation.executed', this.handleAutomationEvent.bind(this));

    // Listen for opt-out events
    this.eventDispatcher.subscribe('recipient.opted_out', this.handleOptOutEvent.bind(this));

    this.logger.info('Analytics event listeners setup complete');
  }

  /**
   * Initialize alert thresholds
   */
  private initializeAlertThresholds(): void {
    this.alertThresholds.set('delivery_rate_low', 0.85); // 85%
    this.alertThresholds.set('failure_rate_high', 0.10); // 10%
    this.alertThresholds.set('cost_spike', 1.5); // 150% of average
    this.alertThresholds.set('volume_spike', 2.0); // 200% of average
    this.alertThresholds.set('opt_out_rate_high', 0.02); // 2%
  }

  /**
   * Start periodic aggregation process
   */
  private startPeriodicAggregation(): void {
    const interval = this.config.aggregationInterval * 60 * 1000; // Convert to milliseconds

    setInterval(() => {
      this.performPeriodicAggregation();
    }, interval);

    this.logger.info('Periodic aggregation started', {
      intervalMinutes: this.config.aggregationInterval
    });
  }

  /**
   * Handle message events for real-time analytics
   */
  private async handleMessageEvent(event: any): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        type: event.type,
        timestamp: event.timestamp,
        channel: event.data.channel,
        messageId: event.data.messageId,
        patientId: event.data.patientId,
        metadata: event.data
      };

      this.realtimeEvents.push(analyticsEvent);

      // Keep only recent events (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      this.realtimeEvents = this.realtimeEvents.filter(e => e.timestamp >= oneHourAgo);

      // Real-time metrics update
      await this.updateRealTimeMetrics(analyticsEvent);

      // Check for alerts
      await this.checkAlerts(analyticsEvent);

    } catch (error) {
      this.logger.error('Failed to handle message event for analytics', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle automation events
   */
  private async handleAutomationEvent(event: any): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        type: 'automation.executed',
        timestamp: event.timestamp,
        channel: 'system' as CommunicationChannel,
        metadata: {
          ruleId: event.data.ruleId,
          ruleName: event.data.ruleName,
          success: event.data.success,
          messagesSent: event.data.messagesSent
        }
      };

      this.realtimeEvents.push(analyticsEvent);
    } catch (error) {
      this.logger.error('Failed to handle automation event for analytics', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle opt-out events
   */
  private async handleOptOutEvent(event: any): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        type: 'recipient.opted_out',
        timestamp: event.timestamp,
        channel: event.data.channel,
        patientId: event.data.patientId,
        metadata: {
          reason: event.data.reason,
          messageId: event.data.messageId
        }
      };

      this.realtimeEvents.push(analyticsEvent);

      // Check opt-out rate alert
      await this.checkOptOutRateAlert();
    } catch (error) {
      this.logger.error('Failed to handle opt-out event for analytics', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get comprehensive communication metrics
   */
  async getCommunicationMetrics(filter: AnalyticsFilter): Promise<CommunicationMetrics> {
    try {
      const startTime = Date.now();

      // Get raw message data
      const messages = await this.repository.getMessagesForAnalytics(filter);

      // Calculate volume metrics
      const totalSent = messages.length;
      const totalDelivered = messages.filter(m => m.status === 'delivered').length;
      const totalRead = messages.filter(m => m.status === 'read').length;
      const totalFailed = messages.filter(m => m.status === 'failed').length;

      // Calculate bounced messages (specific failure types)
      const totalBounced = messages.filter(m =>
        m.status === 'failed' &&
        (m.errorCode?.includes('BOUNCE') || m.errorCode?.includes('INVALID'))
      ).length;

      // Get opt-out data
      const optOuts = await this.repository.getOptOutsForPeriod(filter.startDate, filter.endDate);
      const totalOptOuts = optOuts.length;

      // Calculate rates
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
      const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;
      const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
      const optOutRate = totalSent > 0 ? (totalOptOuts / totalSent) * 100 : 0;
      const engagementRate = totalSent > 0 ? ((totalRead + totalOptOuts) / totalSent) * 100 : 0;

      // Calculate performance metrics
      const deliveredMessages = messages.filter(m => m.deliveredAt && m.createdAt);
      const averageDeliveryTime = deliveredMessages.length > 0
        ? deliveredMessages.reduce((sum, m) =>
            sum + (m.deliveredAt!.getTime() - m.createdAt.getTime()), 0
          ) / deliveredMessages.length
        : 0;

      // Calculate peak hour delivery
      const hourlyDeliveries = new Map<number, number>();
      deliveredMessages.forEach(m => {
        const hour = m.deliveredAt!.getHours();
        hourlyDeliveries.set(hour, (hourlyDeliveries.get(hour) || 0) + 1);
      });
      const peakHourDelivery = Math.max(...Array.from(hourlyDeliveries.values()), 0);

      // Calculate cost metrics
      const totalCost = messages.reduce((sum, m) => sum + (m.cost || 0), 0);
      const costPerMessage = totalSent > 0 ? totalCost / totalSent : 0;
      const costPerDelivery = totalDelivered > 0 ? totalCost / totalDelivered : 0;
      const costPerEngagement = (totalRead + totalOptOuts) > 0 ? totalCost / (totalRead + totalOptOuts) : 0;

      // Calculate channel distribution
      const channelDistribution: Record<CommunicationChannel, number> = {
        email: 0,
        sms: 0,
        whatsapp: 0,
        push: 0
      };

      messages.forEach(m => {
        channelDistribution[m.channel]++;
      });

      // Calculate message type distribution
      const messageTypeDistribution: Record<MessageType, number> = {} as any;
      messages.forEach(m => {
        messageTypeDistribution[m.type] = (messageTypeDistribution[m.type] || 0) + 1;
      });

      const duration = Date.now() - startTime;
      this.metrics.timing('analytics.metrics_calculation', duration);

      return {
        totalSent,
        totalDelivered,
        totalRead,
        totalFailed,
        totalBounced,
        totalOptOuts,
        deliveryRate,
        readRate,
        failureRate,
        bounceRate,
        optOutRate,
        engagementRate,
        averageDeliveryTime,
        averageResponseTime: 0, // Would require additional tracking
        peakHourDelivery,
        totalCost,
        costPerMessage,
        costPerDelivery,
        costPerEngagement,
        channelDistribution,
        messageTypeDistribution
      };
    } catch (error) {
      this.logger.error('Failed to calculate communication metrics', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    metric: 'sent' | 'delivered' | 'read' | 'failed' | 'cost',
    filter: AnalyticsFilter,
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesPoint[]> {
    try {
      const data = await this.repository.getTimeSeriesData(metric, filter, granularity);

      return data.map(point => ({
        timestamp: point.timestamp,
        value: point.value,
        metadata: point.metadata
      }));
    } catch (error) {
      this.logger.error('Failed to get time series data', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Get channel performance comparison
   */
  async getChannelPerformance(filter: AnalyticsFilter): Promise<Record<CommunicationChannel, CommunicationMetrics>> {
    const channels: CommunicationChannel[] = ['email', 'sms', 'whatsapp', 'push'];
    const performance: Record<CommunicationChannel, CommunicationMetrics> = {} as any;

    for (const channel of channels) {
      const channelFilter = { ...filter, channels: [channel] };
      performance[channel] = await this.getCommunicationMetrics(channelFilter);
    }

    return performance;
  }

  /**
   * Get message type performance
   */
  async getMessageTypePerformance(filter: AnalyticsFilter): Promise<Record<MessageType, CommunicationMetrics>> {
    try {
      const messageTypes = await this.repository.getUniqueMessageTypes(filter);
      const performance: Record<MessageType, CommunicationMetrics> = {} as any;

      for (const messageType of messageTypes) {
        const typeFilter = { ...filter, messageTypes: [messageType] };
        performance[messageType] = await this.getCommunicationMetrics(typeFilter);
      }

      return performance;
    } catch (error) {
      this.logger.error('Failed to get message type performance', error instanceof Error ? error : new Error(String(error)));
      return {} as any;
    }
  }

  /**
   * Get top performing templates
   */
  async getTopPerformingTemplates(
    filter: AnalyticsFilter,
    limit = 10
  ): Promise<Array<{
    templateId: string;
    templateName: string;
    metrics: CommunicationMetrics;
  }>> {
    try {
      const templates = await this.repository.getTemplatePerformance(filter, limit);

      const results = [];
      for (const template of templates) {
        const templateFilter = { ...filter, templateIds: [template.id] };
        const metrics = await this.getCommunicationMetrics(templateFilter);

        results.push({
          templateId: template.id,
          templateName: template.name,
          metrics
        });
      }

      // Sort by engagement rate
      results.sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);

      return results.slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get top performing templates', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Get automation performance
   */
  async getAutomationPerformance(filter: AnalyticsFilter): Promise<Array<{
    ruleId: string;
    ruleName: string;
    executions: number;
    successRate: number;
    messagesSent: number;
  }>> {
    try {
      return await this.repository.getAutomationPerformance(filter);
    } catch (error) {
      this.logger.error('Failed to get automation performance', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Generate cohort analysis
   */
  async generateCohortAnalysis(
    cohortType: 'monthly' | 'weekly',
    startDate: Date,
    endDate: Date
  ): Promise<CohortData[]> {
    if (!this.config.enableCohortAnalysis) {
      return [];
    }

    try {
      const cacheKey = `${cohortType}-${startDate.toISOString()}-${endDate.toISOString()}`;

      if (this.cohortCache.has(cacheKey)) {
        return [this.cohortCache.get(cacheKey)!];
      }

      const cohortData = await this.repository.getCohortData(cohortType, startDate, endDate);

      // Process and calculate retention rates
      const processedCohorts = cohortData.map(cohort => {
        const retentionByPeriod: Record<string, number> = {};
        const engagementByPeriod: Record<string, number> = {};
        const conversionByPeriod: Record<string, number> = {};

        // Calculate retention rates for each period
        for (let period = 0; period < 12; period++) {
          const periodKey = `period_${period}`;
          const activeUsers = cohort.usersByPeriod[period] || 0;
          const retentionRate = cohort.totalUsers > 0 ? (activeUsers / cohort.totalUsers) * 100 : 0;

          retentionByPeriod[periodKey] = retentionRate;
          engagementByPeriod[periodKey] = cohort.engagementByPeriod?.[period] || 0;
          conversionByPeriod[periodKey] = cohort.conversionByPeriod?.[period] || 0;
        }

        const processed: CohortData = {
          cohortId: cohort.id,
          cohortName: cohort.name,
          cohortDate: cohort.date,
          totalUsers: cohort.totalUsers,
          retentionByPeriod,
          engagementByPeriod,
          conversionByPeriod
        };

        this.cohortCache.set(cacheKey, processed);
        return processed;
      });

      return processedCohorts;
    } catch (error) {
      this.logger.error('Failed to generate cohort analysis', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Generate predictive analytics
   */
  async generatePredictiveAnalytics(
    metric: 'delivery_rate' | 'engagement_rate' | 'cost',
    timeframe: 'week' | 'month' | 'quarter'
  ): Promise<PredictiveData> {
    if (!this.config.enablePredictiveAnalytics) {
      return {
        prediction: 'Predictive analytics disabled',
        confidence: 0,
        expectedValue: 0,
        trend: 'stable',
        factors: [],
        recommendations: []
      };
    }

    try {
      // Simple trend analysis (in a real implementation, you'd use ML models)
      const historicalData = await this.getHistoricalTrendData(metric, timeframe);

      const trend = this.calculateTrend(historicalData);
      const prediction = this.generatePrediction(historicalData, timeframe);

      return {
        prediction: `${metric} is expected to ${trend} by ${prediction.expectedChange}% over the next ${timeframe}`,
        confidence: prediction.confidence,
        expectedValue: prediction.expectedValue,
        trend: prediction.trend,
        factors: prediction.factors,
        recommendations: prediction.recommendations
      };
    } catch (error) {
      this.logger.error('Failed to generate predictive analytics', error instanceof Error ? error : new Error(String(error)));
      return {
        prediction: 'Unable to generate prediction',
        confidence: 0,
        expectedValue: 0,
        trend: 'stable',
        factors: [],
        recommendations: []
      };
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(filter: AnalyticsFilter): Promise<DashboardData> {
    try {
      const startTime = Date.now();

      // Get all data in parallel for better performance
      const [
        overview,
        timeSeries,
        channelPerformance,
        messageTypePerformance,
        topTemplates,
        automationPerformance
      ] = await Promise.all([
        this.getCommunicationMetrics(filter),
        this.getAllTimeSeriesData(filter),
        this.getChannelPerformance(filter),
        this.getMessageTypePerformance(filter),
        this.getTopPerformingTemplates(filter, 5),
        this.getAutomationPerformance(filter)
      ]);

      // Get recent activity from real-time events
      const recentActivity = this.realtimeEvents
        .slice(-50) // Last 50 events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Generate alerts
      const alerts = await this.generateAlerts(overview);

      const duration = Date.now() - startTime;
      this.metrics.timing('analytics.dashboard_generation', duration);

      return {
        overview,
        timeSeries,
        channelPerformance,
        messageTypePerformance,
        topPerformingTemplates: topTemplates,
        automationPerformance,
        recentActivity,
        alerts
      };
    } catch (error) {
      this.logger.error('Failed to generate dashboard data', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get all time series data for dashboard
   */
  private async getAllTimeSeriesData(filter: AnalyticsFilter): Promise<{
    sent: TimeSeriesPoint[];
    delivered: TimeSeriesPoint[];
    read: TimeSeriesPoint[];
    failed: TimeSeriesPoint[];
    cost: TimeSeriesPoint[];
  }> {
    const [sent, delivered, read, failed, cost] = await Promise.all([
      this.getTimeSeriesData('sent', filter),
      this.getTimeSeriesData('delivered', filter),
      this.getTimeSeriesData('read', filter),
      this.getTimeSeriesData('failed', filter),
      this.getTimeSeriesData('cost', filter)
    ]);

    return { sent, delivered, read, failed, cost };
  }

  /**
   * Update real-time metrics
   */
  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const metricName = `realtime.${event.channel}.${event.type}`;
    this.metrics.increment(metricName);

    if (event.metadata.cost) {
      this.metrics.gauge(`realtime.${event.channel}.cost`, event.metadata.cost);
    }
  }

  /**
   * Check for alerts based on current metrics
   */
  private async checkAlerts(event: AnalyticsEvent): Promise<void> {
    // Check for immediate issues
    if (event.type === 'message.failed') {
      const recentFailures = this.realtimeEvents.filter(e =>
        e.type === 'message.failed' &&
        e.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      ).length;

      if (recentFailures > 10) {
        await this.dispatchAlert('error', 'High failure rate detected', 3);
      }
    }

    // Check for cost spikes
    if (event.metadata.cost && event.metadata.cost > this.getAverageCost() * 2) {
      await this.dispatchAlert('warning', 'Unusually high message cost detected', 2);
    }
  }

  /**
   * Check opt-out rate alert
   */
  private async checkOptOutRateAlert(): Promise<void> {
    const recentOptOuts = this.realtimeEvents.filter(e =>
      e.type === 'recipient.opted_out' &&
      e.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    ).length;

    const recentMessages = this.realtimeEvents.filter(e =>
      e.type === 'message.sent' &&
      e.timestamp > new Date(Date.now() - 60 * 60 * 1000)
    ).length;

    if (recentMessages > 0 && (recentOptOuts / recentMessages) > 0.05) { // 5% opt-out rate
      await this.dispatchAlert('warning', 'High opt-out rate detected in the last hour', 2);
    }
  }

  /**
   * Generate alerts based on metrics
   */
  private async generateAlerts(metrics: CommunicationMetrics): Promise<Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
    severity: number;
  }>> {
    const alerts = [];

    // Low delivery rate alert
    if (metrics.deliveryRate < (this.alertThresholds.get('delivery_rate_low') || 85)) {
      alerts.push({
        type: 'warning' as const,
        message: `Low delivery rate: ${metrics.deliveryRate.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 2
      });
    }

    // High failure rate alert
    if (metrics.failureRate > (this.alertThresholds.get('failure_rate_high') || 10)) {
      alerts.push({
        type: 'error' as const,
        message: `High failure rate: ${metrics.failureRate.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 3
      });
    }

    // High opt-out rate alert
    if (metrics.optOutRate > (this.alertThresholds.get('opt_out_rate_high') || 2)) {
      alerts.push({
        type: 'warning' as const,
        message: `High opt-out rate: ${metrics.optOutRate.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 2
      });
    }

    return alerts;
  }

  /**
   * Dispatch alert event
   */
  private async dispatchAlert(type: 'warning' | 'error' | 'info', message: string, severity: number): Promise<void> {
    await this.eventDispatcher.dispatch({
      type: 'analytics.alert',
      timestamp: new Date(),
      data: {
        alertType: type,
        message,
        severity
      }
    });

    this.logger.warn('Analytics alert generated', { type, message, severity });
  }

  /**
   * Perform periodic aggregation
   */
  private async performPeriodicAggregation(): Promise<void> {
    try {
      const now = new Date();
      const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      const endOfHour = new Date(startOfHour.getTime() + 60 * 60 * 1000);

      // Aggregate data for the current hour
      await this.repository.aggregateHourlyData(startOfHour, endOfHour);

      this.logger.debug('Periodic aggregation completed', {
        period: startOfHour.toISOString()
      });
    } catch (error) {
      this.logger.error('Periodic aggregation failed', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Helper methods for predictive analytics
   */
  private async getHistoricalTrendData(metric: string, timeframe: string): Promise<number[]> {
    // Placeholder implementation - would query historical data
    return [85, 87, 86, 88, 90, 89, 91, 93, 92, 94];
  }

  private calculateTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';

    const first = data[0];
    const last = data[data.length - 1];
    const change = ((last - first) / first) * 100;

    if (change > 2) return 'increasing';
    if (change < -2) return 'decreasing';
    return 'stable';
  }

  private generatePrediction(data: number[], timeframe: string): {
    expectedChange: number;
    confidence: number;
    expectedValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    factors: Array<{ factor: string; impact: number; description: string; }>;
    recommendations: string[];
  } {
    // Simple linear regression for prediction (in real implementation, use proper ML)
    const trend = this.calculateTrend(data);
    const average = data.reduce((sum, val) => sum + val, 0) / data.length;
    const lastValue = data[data.length - 1];
    const expectedChange = ((lastValue - average) / average) * 100;

    return {
      expectedChange,
      confidence: 0.75, // 75% confidence
      expectedValue: lastValue + (expectedChange / 100) * lastValue,
      trend,
      factors: [
        {
          factor: 'Historical Performance',
          impact: 0.6,
          description: 'Based on recent performance trends'
        },
        {
          factor: 'Seasonal Patterns',
          impact: 0.3,
          description: 'Considering historical seasonal variations'
        },
        {
          factor: 'External Factors',
          impact: 0.1,
          description: 'Market and industry influences'
        }
      ],
      recommendations: this.generateRecommendations(trend, expectedChange)
    };
  }

  private generateRecommendations(trend: string, expectedChange: number): string[] {
    const recommendations = [];

    if (trend === 'decreasing') {
      recommendations.push('Review message content and timing for better engagement');
      recommendations.push('Consider A/B testing different templates');
      recommendations.push('Analyze failed messages for common patterns');
    } else if (trend === 'increasing') {
      recommendations.push('Continue current successful strategies');
      recommendations.push('Consider scaling up volume during peak performance');
    } else {
      recommendations.push('Monitor for changes in performance patterns');
      recommendations.push('Test new channels or message types');
    }

    return recommendations;
  }

  private getAverageCost(): number {
    const costEvents = this.realtimeEvents
      .filter(e => e.metadata.cost)
      .map(e => e.metadata.cost)
      .slice(-100); // Last 100 cost events

    if (costEvents.length === 0) return 0;

    return costEvents.reduce((sum, cost) => sum + cost, 0) / costEvents.length;
  }

  /**
   * Export analytics data for external use
   */
  async exportAnalyticsData(
    filter: AnalyticsFilter,
    format: 'csv' | 'json' | 'excel'
  ): Promise<{ data: any; filename: string }> {
    try {
      const metrics = await this.getCommunicationMetrics(filter);
      const timeSeries = await this.getAllTimeSeriesData(filter);

      const exportData = {
        summary: metrics,
        timeSeries,
        exportedAt: new Date(),
        filter
      };

      const filename = `communication_analytics_${Date.now()}.${format}`;

      return {
        data: exportData,
        filename
      };
    } catch (error) {
      this.logger.error('Failed to export analytics data', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get analytics engine statistics
   */
  getEngineStatistics(): {
    realtimeEventsCount: number;
    alertThresholdsCount: number;
    cohortCacheSize: number;
    isRealTimeEnabled: boolean;
    aggregationInterval: number;
  } {
    return {
      realtimeEventsCount: this.realtimeEvents.length,
      alertThresholdsCount: this.alertThresholds.size,
      cohortCacheSize: this.cohortCache.size,
      isRealTimeEnabled: this.config.realTimeEnabled,
      aggregationInterval: this.config.aggregationInterval
    };
  }
}

/**
 * Default analytics configuration
 */
export const defaultAnalyticsConfig: AnalyticsConfig = {
  enabled: true,
  realTimeEnabled: true,
  aggregationInterval: 60, // 1 hour
  retentionDays: 365,
  enableCohortAnalysis: true,
  enablePredictiveAnalytics: true,
  enableCustomEvents: true,
  dashboardRefreshInterval: 30000 // 30 seconds
};
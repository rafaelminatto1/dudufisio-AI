import {
  CalendarMetrics,
  CalendarIntegration,
  CalendarJob
} from '../../../types';

interface MonitoringAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  provider?: string;
  metadata?: Record<string, unknown>;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

export class CalendarMonitor {
  private alerts: MonitoringAlert[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    providerMetrics: Map<string, {
      requests: number;
      successes: number;
      failures: number;
      avgResponseTime: number;
      lastFailure?: Date;
    }>;
  } = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    providerMetrics: new Map()
  };

  constructor() {
    this.startPeriodicHealthChecks();
  }

  // Record metrics for calendar operations
  recordOperation(
    provider: string,
    operation: string,
    success: boolean,
    responseTime: number,
    error?: string
  ): void {
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
      this.metrics.totalRequests;

    // Update provider-specific metrics
    if (!this.metrics.providerMetrics.has(provider)) {
      this.metrics.providerMetrics.set(provider, {
        requests: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0
      });
    }

    const providerMetrics = this.metrics.providerMetrics.get(provider)!;
    providerMetrics.requests++;

    if (success) {
      providerMetrics.successes++;
    } else {
      providerMetrics.failures++;
      providerMetrics.lastFailure = new Date();
    }

    // Update provider average response time
    providerMetrics.avgResponseTime =
      (providerMetrics.avgResponseTime * (providerMetrics.requests - 1) + responseTime) /
      providerMetrics.requests;

    // Check for alerts
    this.checkAlertConditions(provider, success, error);

    // Log metrics to external monitoring service (if configured)
    this.logToExternalMonitoring(provider, operation, success, responseTime, error);
  }

  // Generate monitoring alerts based on conditions
  private checkAlertConditions(provider: string, success: boolean, error?: string): void {
    const providerMetrics = this.metrics.providerMetrics.get(provider);
    if (!providerMetrics) return;

    // High failure rate alert
    const failureRate = providerMetrics.failures / providerMetrics.requests;
    if (providerMetrics.requests >= 10 && failureRate > 0.3) {
      this.addAlert({
        level: 'warning',
        title: 'High Failure Rate',
        message: `Calendar provider ${provider} has a ${(failureRate * 100).toFixed(1)}% failure rate`,
        provider,
        metadata: { failureRate, totalRequests: providerMetrics.requests }
      });
    }

    // Critical failure rate alert
    if (providerMetrics.requests >= 5 && failureRate > 0.8) {
      this.addAlert({
        level: 'critical',
        title: 'Critical Failure Rate',
        message: `Calendar provider ${provider} is experiencing critical failures (${(failureRate * 100).toFixed(1)}%)`,
        provider,
        metadata: { failureRate, totalRequests: providerMetrics.requests }
      });
    }

    // Slow response time alert
    if (providerMetrics.avgResponseTime > 10000) { // 10 seconds
      this.addAlert({
        level: 'warning',
        title: 'Slow Response Time',
        message: `Calendar provider ${provider} has slow response times (${providerMetrics.avgResponseTime.toFixed(0)}ms)`,
        provider,
        metadata: { avgResponseTime: providerMetrics.avgResponseTime }
      });
    }

    // Consecutive failures alert
    if (!success && this.isConsecutiveFailure(provider, 3)) {
      this.addAlert({
        level: 'error',
        title: 'Consecutive Failures',
        message: `Calendar provider ${provider} has 3 consecutive failures`,
        provider,
        metadata: { error }
      });
    }
  }

  // Check if provider has consecutive failures
  private isConsecutiveFailure(provider: string, threshold: number): boolean {
    // This would check the last N operations for the provider
    // Implementation depends on your logging strategy
    return false; // Simplified for now
  }

  // Add alert to the monitoring system
  private addAlert(alert: Omit<MonitoringAlert, 'id' | 'timestamp'>): void {
    const newAlert: MonitoringAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert
    };

    this.alerts.unshift(newAlert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Send alert to external systems
    this.sendAlertNotification(newAlert);

    console.warn(`Calendar Monitor Alert [${newAlert.level.toUpperCase()}]: ${newAlert.title} - ${newAlert.message}`);
  }

  // Health check for calendar providers
  async performHealthCheck(provider: string, testConfig: any): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // This would test the specific provider
      // For now, we'll simulate a health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000)); // Simulate API call

      const responseTime = Date.now() - startTime;
      const healthCheck: HealthCheck = {
        service: provider,
        status: responseTime < 5000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date()
      };

      this.healthChecks.set(provider, healthCheck);
      return healthCheck;
    } catch (error) {
      const healthCheck: HealthCheck = {
        service: provider,
        status: 'unhealthy',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.healthChecks.set(provider, healthCheck);

      this.addAlert({
        level: 'error',
        title: 'Health Check Failed',
        message: `Health check failed for calendar provider ${provider}`,
        provider,
        metadata: { error: healthCheck.error }
      });

      return healthCheck;
    }
  }

  // Start periodic health checks
  private startPeriodicHealthChecks(): void {
    setInterval(() => {
      this.runHealthChecks();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async runHealthChecks(): Promise<void> {
    const providers = ['google', 'outlook', 'ics']; // Add your providers

    for (const provider of providers) {
      try {
        await this.performHealthCheck(provider, {});
      } catch (error) {
        console.error(`Error during health check for ${provider}:`, error);
      }
    }
  }

  // Generate comprehensive metrics report
  generateMetricsReport(): CalendarMetrics {
    const providerPerformance: Record<string, any> = {};

    this.metrics.providerMetrics.forEach((metrics, provider) => {
      providerPerformance[provider] = {
        totalSent: metrics.requests,
        successCount: metrics.successes,
        averageDeliveryTime: metrics.avgResponseTime,
        lastFailure: metrics.lastFailure
      };
    });

    return {
      totalInvitesSent: this.metrics.totalRequests,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
        : 0,
      averageDeliveryTime: this.metrics.averageResponseTime,
      providerPerformance,
      queueStats: {
        pending: 0, // Would be fetched from actual queue
        processing: 0,
        completed: this.metrics.successfulRequests,
        failed: this.metrics.failedRequests
      }
    };
  }

  // Get recent alerts
  getRecentAlerts(limit = 20): MonitoringAlert[] {
    return this.alerts.slice(0, limit);
  }

  // Get health status for all providers
  getHealthStatus(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  // Get system health summary
  getSystemHealthSummary(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: HealthCheck[];
    criticalAlerts: number;
    lastChecked: Date;
  } {
    const services = this.getHealthStatus();
    const criticalAlerts = this.alerts.filter(a => a.level === 'critical').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (services.some(s => s.status === 'unhealthy') || criticalAlerts > 0) {
      overall = 'unhealthy';
    } else if (services.some(s => s.status === 'degraded')) {
      overall = 'degraded';
    }

    return {
      overall,
      services,
      criticalAlerts,
      lastChecked: new Date()
    };
  }

  // Log metrics to external monitoring service
  private logToExternalMonitoring(
    provider: string,
    operation: string,
    success: boolean,
    responseTime: number,
    error?: string
  ): void {
    // This would integrate with services like:
    // - Datadog
    // - New Relic
    // - Prometheus
    // - Custom monitoring endpoint

    const metrics = {
      service: 'calendar-integration',
      provider,
      operation,
      success,
      responseTime,
      timestamp: new Date().toISOString(),
      error
    };

    // Example for custom monitoring endpoint:
    /*
    fetch('/api/monitoring/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    }).catch(error => {
      console.error('Failed to log metrics to external monitoring:', error);
    });
    */

    console.log('Calendar Integration Metrics:', metrics);
  }

  // Send alert notifications
  private sendAlertNotification(alert: MonitoringAlert): void {
    // This would integrate with notification systems like:
    // - Slack
    // - Email
    // - SMS
    // - PagerDuty
    // - Discord webhooks

    if (alert.level === 'critical' || alert.level === 'error') {
      // Example for Slack webhook:
      /*
      const slackPayload = {
        text: `🚨 Calendar Integration Alert`,
        attachments: [{
          color: alert.level === 'critical' ? 'danger' : 'warning',
          title: alert.title,
          text: alert.message,
          fields: [
            { title: 'Provider', value: alert.provider || 'Unknown', short: true },
            { title: 'Level', value: alert.level.toUpperCase(), short: true },
            { title: 'Time', value: alert.timestamp.toISOString(), short: true }
          ]
        }]
      };

      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      }).catch(error => {
        console.error('Failed to send Slack notification:', error);
      });
      */
    }
  }

  // Clear old alerts and metrics
  cleanup(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Remove alerts older than 1 week
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo);

    // Clear health checks for providers that haven't been checked recently
    this.healthChecks.forEach((check, provider) => {
      if (check.lastChecked < oneWeekAgo) {
        this.healthChecks.delete(provider);
      }
    });
  }

  // Reset metrics (for testing or maintenance)
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      providerMetrics: new Map()
    };
  }
}

// Global monitor instance
export const calendarMonitor = new CalendarMonitor();
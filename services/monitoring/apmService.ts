// Application Performance Monitoring (APM) service
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface PerformanceMetric {
  id: string;
  timestamp: Date;
  type: 'page_load' | 'api_request' | 'database_query' | 'user_interaction' | 'error' | 'custom';
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  tags: Record<string, string>;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'application' | 'unhandled_rejection';
  level: 'error' | 'warning' | 'info';
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  breadcrumbs: Breadcrumb[];
  context: Record<string, any>;
  fingerprint?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface Breadcrumb {
  timestamp: Date;
  type: 'navigation' | 'http' | 'user' | 'console' | 'error';
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  interactions: number;
  errors: number;
  browser: string;
  os: string;
  device: string;
  country?: string;
  city?: string;
  referrer?: string;
  landingPage: string;
  exitPage?: string;
  bounced: boolean;
}

interface BusinessMetric {
  id: string;
  timestamp: Date;
  name: string;
  value: number;
  unit: string;
  category: 'revenue' | 'users' | 'appointments' | 'conversion' | 'engagement';
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: ('email' | 'slack' | 'webhook' | 'sms')[];
  recipients: string[];
  lastTriggered?: Date;
  status: 'active' | 'muted' | 'resolved';
  createdBy: string;
  createdAt: Date;
}

interface AlertEvent {
  id: string;
  alertId: string;
  timestamp: Date;
  value: number;
  threshold: number;
  status: 'triggered' | 'resolved';
  message: string;
  notificationsSent: string[];
  metadata?: Record<string, any>;
}

interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'TTI';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: Date;
}

interface RealUserMonitoring {
  sessionId: string;
  userId?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
  webVitals: WebVital[];
  customMetrics: Record<string, number>;
  interactions: UserInteraction[];
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'form_submit';
  element: string;
  timestamp: Date;
  duration?: number;
  value?: string;
  metadata?: Record<string, any>;
}

interface SyntheticMonitoring {
  id: string;
  name: string;
  url: string;
  type: 'uptime' | 'performance' | 'transaction';
  enabled: boolean;
  interval: number; // minutes
  timeout: number; // seconds
  locations: string[];
  checks: SyntheticCheck[];
  alerts: string[];
  lastRun?: Date;
  status: 'passing' | 'failing' | 'unknown';
}

interface SyntheticCheck {
  id: string;
  timestamp: Date;
  location: string;
  status: 'success' | 'failure' | 'timeout';
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  metrics: Record<string, number>;
  screenshot?: string;
}

interface PerformanceBudget {
  name: string;
  metrics: {
    metric: string;
    threshold: number;
    unit: string;
  }[];
  enabled: boolean;
  alertOnBreach: boolean;
  recipients: string[];
}

class APMService {
  private supabase: SupabaseClient;
  private sessionId: string;
  private userId?: string;
  private breadcrumbs: Breadcrumb[] = [];
  private performanceObserver?: PerformanceObserver;
  private mutationObserver?: MutationObserver;
  private startTime: number;
  private pageViews: number = 0;
  private interactions: number = 0;
  private errors: number = 0;
  private customMetrics: Map<string, number> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );

    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    this.isInitialized = true;

    // Initialize session tracking
    this.startSession();

    // Set up error monitoring
    this.setupErrorMonitoring();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    // Set up user interaction tracking
    this.setupInteractionTracking();

    // Set up web vitals monitoring
    this.setupWebVitals();

    // Set up visibility change tracking
    this.setupVisibilityTracking();

    // Set up unload tracking
    this.setupUnloadTracking();

    // Load alerts configuration
    this.loadAlerts();

    console.log('APM Service initialized');
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startSession(): void {
    const session: UserSession = {
      id: this.sessionId,
      userId: this.userId,
      startTime: new Date(),
      pageViews: 0,
      interactions: 0,
      errors: 0,
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      device: this.getDeviceInfo(),
      referrer: document.referrer,
      landingPage: window.location.href,
      bounced: false,
    };

    this.supabase.from('user_sessions').insert(session);
    this.addBreadcrumb('session', 'Session started', 'info');
  }

  private setupErrorMonitoring(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        type: 'javascript',
        level: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        type: 'unhandled_rejection',
        level: 'error',
        context: {
          reason: event.reason,
        },
      });
    });

    // Console error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.captureError({
        message: args.join(' '),
        type: 'javascript',
        level: 'error',
        context: { args },
      });
      originalConsoleError.apply(console, args);
    };
  }

  private setupPerformanceMonitoring(): void {
    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        this.trackMetric({
          type: 'page_load',
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: 'ms',
          tags: { page: window.location.pathname },
        });

        this.trackMetric({
          type: 'page_load',
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          unit: 'ms',
          tags: { page: window.location.pathname },
        });

        this.trackMetric({
          type: 'page_load',
          name: 'first_byte',
          value: navigation.responseStart - navigation.requestStart,
          unit: 'ms',
          tags: { page: window.location.pathname },
        });
      }, 0);
    });

    // Resource timing
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;

            this.trackMetric({
              type: 'api_request',
              name: 'resource_load_time',
              value: resourceEntry.responseEnd - resourceEntry.requestStart,
              unit: 'ms',
              tags: {
                resource: resourceEntry.name,
                type: this.getResourceType(resourceEntry.name),
              },
            });
          }

          if (entry.entryType === 'measure') {
            this.trackMetric({
              type: 'custom',
              name: entry.name,
              value: entry.duration,
              unit: 'ms',
              tags: { type: 'user_timing' },
            });
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['resource', 'measure', 'navigation']
      });
    }
  }

  private setupInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackInteraction({
        type: 'click',
        element: this.getElementSelector(event.target as Element),
        timestamp: new Date(),
        metadata: {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        },
      });

      this.interactions++;
      this.addBreadcrumb('user', `Clicked ${this.getElementSelector(event.target as Element)}`, 'info');
    });

    // Form submission tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackInteraction({
        type: 'form_submit',
        element: this.getElementSelector(form),
        timestamp: new Date(),
        metadata: {
          action: form.action,
          method: form.method,
        },
      });

      this.addBreadcrumb('user', `Submitted form ${this.getElementSelector(form)}`, 'info');
    });

    // Scroll tracking (throttled)
    let scrollTimer: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.trackInteraction({
          type: 'scroll',
          element: 'document',
          timestamp: new Date(),
          metadata: {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
          },
        });
      }, 1000);
    });

    // Input tracking (debounced)
    let inputTimer: NodeJS.Timeout;
    document.addEventListener('input', (event) => {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(() => {
        const input = event.target as HTMLInputElement;
        this.trackInteraction({
          type: 'input',
          element: this.getElementSelector(input),
          timestamp: new Date(),
          value: input.type === 'password' ? '[REDACTED]' : input.value.substring(0, 100),
        });
      }, 500);
    });
  }

  private setupWebVitals(): void {
    // Import web-vitals library dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const onVitalReport = (vital: WebVital) => {
        this.trackMetric({
          type: 'page_load',
          name: vital.name.toLowerCase(),
          value: vital.value,
          unit: 'ms',
          tags: {
            rating: vital.rating,
            page: window.location.pathname,
          },
          metadata: {
            id: vital.id,
            delta: vital.delta,
          },
        });

        // Check performance budgets
        this.checkPerformanceBudgets(vital);
      };

      getCLS(onVitalReport as any);
      getFID(onVitalReport as any);
      getFCP(onVitalReport as any);
      getLCP(onVitalReport as any);
      getTTFB(onVitalReport as any);
    }).catch(() => {
      console.warn('Web vitals library not available');
    });
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.addBreadcrumb('navigation', 'Page hidden', 'info');
        this.trackMetric({
          type: 'user_interaction',
          name: 'page_visibility',
          value: 0,
          unit: 'count',
          tags: { visible: 'false' },
        });
      } else {
        this.addBreadcrumb('navigation', 'Page visible', 'info');
        this.trackMetric({
          type: 'user_interaction',
          name: 'page_visibility',
          value: 1,
          unit: 'count',
          tags: { visible: 'true' },
        });
      }
    });
  }

  private setupUnloadTracking(): void {
    const trackUnload = () => {
      this.endSession();
    };

    window.addEventListener('beforeunload', trackUnload);
    window.addEventListener('pagehide', trackUnload);

    // Use sendBeacon for reliable data transmission
    if ('sendBeacon' in navigator) {
      window.addEventListener('beforeunload', () => {
        const sessionData = {
          sessionId: this.sessionId,
          endTime: new Date().toISOString(),
          duration: Date.now() - this.startTime,
          pageViews: this.pageViews,
          interactions: this.interactions,
          errors: this.errors,
        };

        navigator.sendBeacon(
          '/api/apm/session-end',
          JSON.stringify(sessionData)
        );
      });
    }
  }

  async trackMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'sessionId' | 'userAgent' | 'url'>): Promise<void> {
    const fullMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...metric,
    };

    // Store locally for batch sending
    this.customMetrics.set(fullMetric.name, fullMetric.value);

    // Send to backend
    await this.supabase.from('performance_metrics').insert(fullMetric);

    // Check alerts
    this.checkAlerts(fullMetric);
  }

  async captureError(error: Omit<ErrorEvent, 'id' | 'timestamp' | 'sessionId' | 'userAgent' | 'url' | 'breadcrumbs' | 'resolved' | 'fingerprint'>): Promise<void> {
    this.errors++;

    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      breadcrumbs: [...this.breadcrumbs],
      fingerprint: this.generateErrorFingerprint(error.message, error.stack),
      resolved: false,
      ...error,
    };

    this.addBreadcrumb('error', error.message, 'error', {
      type: error.type,
      level: error.level,
    });

    await this.supabase.from('error_events').insert(errorEvent);

    // Check error rate alerts
    this.checkErrorRateAlerts();
  }

  private addBreadcrumb(
    type: Breadcrumb['type'],
    message: string,
    level: Breadcrumb['level'],
    data?: Record<string, any>
  ): void {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date(),
      type,
      category: type,
      message,
      level,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
  }

  private trackInteraction(interaction: UserInteraction): void {
    this.interactions++;

    this.trackMetric({
      type: 'user_interaction',
      name: `interaction_${interaction.type}`,
      value: 1,
      unit: 'count',
      tags: {
        element: interaction.element,
        type: interaction.type,
      },
      metadata: interaction.metadata,
    });
  }

  async trackBusinessMetric(metric: Omit<BusinessMetric, 'id' | 'timestamp'>): Promise<void> {
    const fullMetric: BusinessMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...metric,
    };

    await this.supabase.from('business_metrics').insert(fullMetric);
  }

  async trackConversion(event: string, value?: number, metadata?: Record<string, any>): Promise<void> {
    await this.trackBusinessMetric({
      name: `conversion_${event}`,
      value: value || 1,
      unit: value ? 'currency' : 'count',
      category: 'conversion',
      tags: { event },
      metadata,
    });
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const fullAlert: Alert = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'active',
      ...alert,
    };

    await this.supabase.from('alerts').insert(fullAlert);
    this.alerts.set(fullAlert.id, fullAlert);

    return fullAlert.id;
  }

  private async loadAlerts(): Promise<void> {
    const { data } = await this.supabase
      .from('alerts')
      .select('*')
      .eq('enabled', true);

    data?.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  private checkAlerts(metric: PerformanceMetric): void {
    for (const alert of this.alerts.values()) {
      if (this.shouldTriggerAlert(alert, metric)) {
        this.triggerAlert(alert, metric.value);
      }
    }
  }

  private shouldTriggerAlert(alert: Alert, metric: PerformanceMetric): boolean {
    if (!alert.enabled || alert.status === 'muted') return false;

    // Simple condition checking (in production, use a more sophisticated rule engine)
    const condition = alert.condition.toLowerCase();
    const metricName = metric.name.toLowerCase();

    if (!metricName.includes(alert.metric.toLowerCase())) return false;

    if (condition.includes('greater_than') || condition.includes('>')) {
      return metric.value > alert.threshold;
    }

    if (condition.includes('less_than') || condition.includes('<')) {
      return metric.value < alert.threshold;
    }

    return false;
  }

  private async triggerAlert(alert: Alert, value: number): Promise<void> {
    const alertEvent: AlertEvent = {
      id: crypto.randomUUID(),
      alertId: alert.id,
      timestamp: new Date(),
      value,
      threshold: alert.threshold,
      status: 'triggered',
      message: `Alert ${alert.name} triggered: ${value} ${alert.condition} ${alert.threshold}`,
      notificationsSent: [],
    };

    await this.supabase.from('alert_events').insert(alertEvent);

    // Send notifications
    for (const channel of alert.channels) {
      try {
        await this.sendAlertNotification(channel, alert, alertEvent);
        alertEvent.notificationsSent.push(channel);
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }

    // Update last triggered time
    await this.supabase
      .from('alerts')
      .update({ lastTriggered: new Date().toISOString() })
      .eq('id', alert.id);
  }

  private async sendAlertNotification(
    channel: string,
    alert: Alert,
    event: AlertEvent
  ): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmailAlert(alert, event);
        break;
      case 'slack':
        await this.sendSlackAlert(alert, event);
        break;
      case 'webhook':
        await this.sendWebhookAlert(alert, event);
        break;
      case 'sms':
        await this.sendSMSAlert(alert, event);
        break;
    }
  }

  private async sendEmailAlert(alert: Alert, event: AlertEvent): Promise<void> {
    // Implementation for email notifications
    console.log(`Sending email alert: ${event.message}`);
  }

  private async sendSlackAlert(alert: Alert, event: AlertEvent): Promise<void> {
    // Implementation for Slack notifications
    console.log(`Sending Slack alert: ${event.message}`);
  }

  private async sendWebhookAlert(alert: Alert, event: AlertEvent): Promise<void> {
    // Implementation for webhook notifications
    console.log(`Sending webhook alert: ${event.message}`);
  }

  private async sendSMSAlert(alert: Alert, event: AlertEvent): Promise<void> {
    // Implementation for SMS notifications
    console.log(`Sending SMS alert: ${event.message}`);
  }

  private checkErrorRateAlerts(): void {
    const errorRateAlert = Array.from(this.alerts.values()).find(
      alert => alert.metric === 'error_rate'
    );

    if (errorRateAlert) {
      const errorRate = (this.errors / this.interactions) * 100;
      if (errorRate > errorRateAlert.threshold) {
        this.triggerAlert(errorRateAlert, errorRate);
      }
    }
  }

  private checkPerformanceBudgets(vital: WebVital): void {
    // Check if any performance budgets are exceeded
    const budgets = this.getPerformanceBudgets();

    for (const budget of budgets) {
      const budgetMetric = budget.metrics.find(m =>
        m.metric.toLowerCase() === vital.name.toLowerCase()
      );

      if (budgetMetric && vital.value > budgetMetric.threshold) {
        console.warn(`Performance budget exceeded: ${vital.name} = ${vital.value}${budgetMetric.unit}, budget: ${budgetMetric.threshold}${budgetMetric.unit}`);

        if (budget.alertOnBreach) {
          this.captureError({
            message: `Performance budget exceeded: ${vital.name}`,
            type: 'application',
            level: 'warning',
            context: {
              metric: vital.name,
              value: vital.value,
              threshold: budgetMetric.threshold,
              budget: budget.name,
            },
          });
        }
      }
    }
  }

  private getPerformanceBudgets(): PerformanceBudget[] {
    return [
      {
        name: 'Core Web Vitals',
        enabled: true,
        alertOnBreach: true,
        recipients: ['admin@dudufisio.com'],
        metrics: [
          { metric: 'CLS', threshold: 0.1, unit: '' },
          { metric: 'FID', threshold: 100, unit: 'ms' },
          { metric: 'LCP', threshold: 2500, unit: 'ms' },
        ],
      },
      {
        name: 'Page Load Performance',
        enabled: true,
        alertOnBreach: false,
        recipients: [],
        metrics: [
          { metric: 'page_load_time', threshold: 3000, unit: 'ms' },
          { metric: 'first_byte', threshold: 500, unit: 'ms' },
        ],
      },
    ];
  }

  private endSession(): void {
    const duration = Date.now() - this.startTime;
    const bounced = this.pageViews <= 1 && this.interactions <= 1 && duration < 30000;

    this.supabase
      .from('user_sessions')
      .update({
        endTime: new Date().toISOString(),
        duration,
        pageViews: this.pageViews,
        interactions: this.interactions,
        errors: this.errors,
        exitPage: window.location.href,
        bounced,
      })
      .eq('id', this.sessionId);

    this.addBreadcrumb('session', 'Session ended', 'info');
  }

  // Utility methods
  private getElementSelector(element: Element): string {
    if (!element) return 'unknown';

    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private getResourceType(url: string): string {
    if (url.includes('/api/')) return 'api';
    if (url.match(/\.(js|ts)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDeviceInfo(): string {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return window.innerWidth < 768 ? 'Mobile' : 'Tablet';
    }
    return 'Desktop';
  }

  private generateErrorFingerprint(message: string, stack?: string): string {
    const content = message + (stack || '');
    return this.hashString(content);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Public API methods
  setUser(userId: string, userInfo?: Record<string, any>): void {
    this.userId = userId;
    this.addBreadcrumb('user', `User identified: ${userId}`, 'info', userInfo);
  }

  setTag(key: string, value: string): void {
    this.addBreadcrumb('user', `Tag set: ${key}=${value}`, 'info', { [key]: value });
  }

  setContext(key: string, context: Record<string, any>): void {
    this.addBreadcrumb('user', `Context set: ${key}`, 'info', { [key]: context });
  }

  startTransaction(name: string): string {
    const transactionId = crypto.randomUUID();
    performance.mark(`transaction-${transactionId}-start`);
    this.addBreadcrumb('user', `Transaction started: ${name}`, 'info', { transactionId });
    return transactionId;
  }

  endTransaction(transactionId: string, name: string): void {
    performance.mark(`transaction-${transactionId}-end`);
    performance.measure(
      `transaction-${name}`,
      `transaction-${transactionId}-start`,
      `transaction-${transactionId}-end`
    );
    this.addBreadcrumb('user', `Transaction ended: ${name}`, 'info', { transactionId });
  }

  // Dashboard data methods
  async getDashboardData(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    overview: {
      totalSessions: number;
      uniqueUsers: number;
      pageViews: number;
      errorRate: number;
      averageLoadTime: number;
    };
    performance: {
      webVitals: Record<string, { value: number; rating: string }>;
      topSlowPages: Array<{ page: string; avgLoadTime: number }>;
      apiPerformance: Array<{ endpoint: string; avgResponseTime: number }>;
    };
    errors: {
      totalErrors: number;
      topErrors: Array<{ message: string; count: number; fingerprint: string }>;
      errorTrend: Array<{ timestamp: string; count: number }>;
    };
    users: {
      browserDistribution: Array<{ browser: string; count: number }>;
      osDistribution: Array<{ os: string; count: number }>;
      deviceDistribution: Array<{ device: string; count: number }>;
      topPages: Array<{ page: string; views: number }>;
    };
    alerts: {
      active: number;
      recentAlerts: Array<{ name: string; timestamp: Date; severity: string }>;
    };
  }> {
    const timeRangeHours = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720,
    }[timeRange];

    const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    // Fetch data from Supabase
    const [sessions, metrics, errors, alerts] = await Promise.all([
      this.supabase
        .from('user_sessions')
        .select('*')
        .gte('startTime', startTime.toISOString()),
      this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString()),
      this.supabase
        .from('error_events')
        .select('*')
        .gte('timestamp', startTime.toISOString()),
      this.supabase
        .from('alert_events')
        .select('*, alerts(*)')
        .gte('timestamp', startTime.toISOString()),
    ]);

    // Process and return dashboard data
    return {
      overview: {
        totalSessions: sessions.data?.length || 0,
        uniqueUsers: new Set(sessions.data?.map(s => s.userId).filter(Boolean)).size,
        pageViews: sessions.data?.reduce((sum, s) => sum + (s.pageViews || 0), 0) || 0,
        errorRate: sessions.data?.length ?
          ((errors.data?.length || 0) / sessions.data.length) * 100 : 0,
        averageLoadTime: this.calculateAverageLoadTime(metrics.data || []),
      },
      performance: {
        webVitals: this.processWebVitals(metrics.data || []),
        topSlowPages: this.getTopSlowPages(metrics.data || []),
        apiPerformance: this.getApiPerformance(metrics.data || []),
      },
      errors: {
        totalErrors: errors.data?.length || 0,
        topErrors: this.getTopErrors(errors.data || []),
        errorTrend: this.getErrorTrend(errors.data || [], timeRangeHours),
      },
      users: {
        browserDistribution: this.getBrowserDistribution(sessions.data || []),
        osDistribution: this.getOSDistribution(sessions.data || []),
        deviceDistribution: this.getDeviceDistribution(sessions.data || []),
        topPages: this.getTopPages(sessions.data || []),
      },
      alerts: {
        active: this.alerts.size,
        recentAlerts: this.getRecentAlerts(alerts.data || []),
      },
    };
  }

  // Helper methods for dashboard data processing
  private calculateAverageLoadTime(metrics: PerformanceMetric[]): number {
    const loadTimeMetrics = metrics.filter(m => m.name === 'page_load_time');
    return loadTimeMetrics.length > 0 ?
      loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length : 0;
  }

  private processWebVitals(metrics: PerformanceMetric[]): Record<string, { value: number; rating: string }> {
    const vitals = ['cls', 'fid', 'fcp', 'lcp', 'ttfb'];
    const result: Record<string, { value: number; rating: string }> = {};

    vitals.forEach(vital => {
      const vitalMetrics = metrics.filter(m => m.name === vital);
      if (vitalMetrics.length > 0) {
        const avgValue = vitalMetrics.reduce((sum, m) => sum + m.value, 0) / vitalMetrics.length;
        result[vital] = {
          value: avgValue,
          rating: this.getWebVitalRating(vital, avgValue),
        };
      }
    });

    return result;
  }

  private getWebVitalRating(vital: string, value: number): string {
    const thresholds: Record<string, [number, number]> = {
      cls: [0.1, 0.25],
      fid: [100, 300],
      fcp: [1800, 3000],
      lcp: [2500, 4000],
      ttfb: [800, 1800],
    };

    const [good, poor] = thresholds[vital] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private getTopSlowPages(metrics: PerformanceMetric[]): Array<{ page: string; avgLoadTime: number }> {
    const pageMetrics = new Map<string, number[]>();

    metrics
      .filter(m => m.name === 'page_load_time')
      .forEach(m => {
        const page = new URL(m.url).pathname;
        if (!pageMetrics.has(page)) {
          pageMetrics.set(page, []);
        }
        pageMetrics.get(page)!.push(m.value);
      });

    return Array.from(pageMetrics.entries())
      .map(([page, times]) => ({
        page,
        avgLoadTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      }))
      .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
      .slice(0, 10);
  }

  private getApiPerformance(metrics: PerformanceMetric[]): Array<{ endpoint: string; avgResponseTime: number }> {
    const apiMetrics = new Map<string, number[]>();

    metrics
      .filter(m => m.type === 'api_request')
      .forEach(m => {
        const endpoint = m.tags.resource || 'unknown';
        if (!apiMetrics.has(endpoint)) {
          apiMetrics.set(endpoint, []);
        }
        apiMetrics.get(endpoint)!.push(m.value);
      });

    return Array.from(apiMetrics.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        avgResponseTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 10);
  }

  private getTopErrors(errors: ErrorEvent[]): Array<{ message: string; count: number; fingerprint: string }> {
    const errorGroups = new Map<string, { message: string; count: number; fingerprint: string }>();

    errors.forEach(error => {
      const fingerprint = error.fingerprint || 'unknown';
      if (errorGroups.has(fingerprint)) {
        errorGroups.get(fingerprint)!.count++;
      } else {
        errorGroups.set(fingerprint, {
          message: error.message,
          count: 1,
          fingerprint,
        });
      }
    });

    return Array.from(errorGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getErrorTrend(errors: ErrorEvent[], timeRangeHours: number): Array<{ timestamp: string; count: number }> {
    const bucketSize = timeRangeHours <= 24 ? 60 : 60 * 24; // 1 hour or 1 day buckets
    const buckets = new Map<string, number>();

    errors.forEach(error => {
      const bucketKey = new Date(
        Math.floor(error.timestamp.getTime() / (bucketSize * 60 * 1000)) * bucketSize * 60 * 1000
      ).toISOString();

      buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private getBrowserDistribution(sessions: UserSession[]): Array<{ browser: string; count: number }> {
    const browsers = new Map<string, number>();

    sessions.forEach(session => {
      const browser = session.browser || 'Unknown';
      browsers.set(browser, (browsers.get(browser) || 0) + 1);
    });

    return Array.from(browsers.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getOSDistribution(sessions: UserSession[]): Array<{ os: string; count: number }> {
    const oses = new Map<string, number>();

    sessions.forEach(session => {
      const os = session.os || 'Unknown';
      oses.set(os, (oses.get(os) || 0) + 1);
    });

    return Array.from(oses.entries())
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getDeviceDistribution(sessions: UserSession[]): Array<{ device: string; count: number }> {
    const devices = new Map<string, number>();

    sessions.forEach(session => {
      const device = session.device || 'Unknown';
      devices.set(device, (devices.get(device) || 0) + 1);
    });

    return Array.from(devices.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getTopPages(sessions: UserSession[]): Array<{ page: string; views: number }> {
    const pages = new Map<string, number>();

    sessions.forEach(session => {
      const page = new URL(session.landingPage).pathname;
      pages.set(page, (pages.get(page) || 0) + (session.pageViews || 1));
    });

    return Array.from(pages.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private getRecentAlerts(alertEvents: any[]): Array<{ name: string; timestamp: Date; severity: string }> {
    return alertEvents
      .map(event => ({
        name: event.alerts?.name || 'Unknown Alert',
        timestamp: new Date(event.timestamp),
        severity: event.alerts?.severity || 'unknown',
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }
}

// Create singleton instance
export const apmService = new APMService();

// Export types
export type {
  PerformanceMetric,
  ErrorEvent,
  UserSession,
  BusinessMetric,
  Alert,
  WebVital,
  RealUserMonitoring,
  SyntheticMonitoring,
  PerformanceBudget
};
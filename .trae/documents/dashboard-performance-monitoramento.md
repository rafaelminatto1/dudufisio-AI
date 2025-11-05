# 📊 Dashboard de Performance - Monitoramento em Tempo Real

## 🎯 **Visão Geral do Dashboard**

### 📍 **Acesso Rápido**
```
http://localhost:5174/performance-dashboard
```

### 📈 **Métricas Principais Monitoradas**

#### **Core Web Vitals (Google)**
- **LCP (Largest Contentful Paint)**: < 2.5s ✅ | 2.5-4.0s ⚠️ | > 4.0s ❌
- **FID (First Input Delay)**: < 100ms ✅ | 100-300ms ⚠️ | > 300ms ❌
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅ | 0.1-0.25 ⚠️ | > 0.25 ❌
- **FCP (First Contentful Paint)**: < 1.8s ✅ | 1.8-3.0s ⚠️ | > 3.0s ❌
- **TTFB (Time to First Byte)**: < 600ms ✅ | 600-1000ms ⚠️ | > 1000ms ❌

#### **Métricas Customizadas**
- **Render Time**: Tempo de renderização de componentes
- **Bundle Size**: Tamanho dos bundles carregados
- **Memory Usage**: Uso de memória da aplicação
- **API Response Time**: Tempo de resposta das APIs
- **Cache Hit Rate**: Taxa de acerto do cache
- **Web Worker Usage**: Utilização de workers

## 📱 **Layout do Dashboard**

### **Primeira Linha - Core Web Vitals**
```
┌─────────────────────────────────────────────────────────────────┐
│                    CORE WEB VITALS - STATUS                   │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│ LCP: 1.2s ✅    │ FID: 45ms ✅    │ CLS: 0.05 ✅    │ FCP: 0.9s ✅│
│ ━━━━━━━━━━━    │ ━━━━━━━━━━━    │ ━━━━━━━━━━━    │ ━━━━━━━━━━━│
│ Target: <2.5s   │ Target: <100ms│ Target: <0.1   │ Target: <1.8s│
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### **Segunda Linha - Gráficos de Performance**
```
┌─────────────────────────┬─────────────────────────┐
│   Performance Timeline  │     Memory Usage        │
│   (Últimas 24h)        │     (Real-time)        │
│                         │                         │
│  ┌─────────────────┐   │  ┌─────────────────┐   │
│  │  █▄▄▄▄▄▄▄▄▄▄▄  │   │  │  █▄▄▄▄▄▄▄▄▄▄▄  │   │
│  │  █▀▀▀▀▀▀▀▀▀▀▀  │   │  │  █▀▀▀▀▀▀▀▀▀▀▀  │   │
│  │  █████████████  │   │  │  █████████████  │   │
│  │  ▀▀▀▀▀▀▀▀▀▀▀▀  │   │  │  ▀▀▀▀▀▀▀▀▀▀▀▀  │   │
│  └─────────────────┘   │  └─────────────────┘   │
│  00:00   12:00   24:00 │  0MB    45MB    90MB  │
└─────────────────────────┴─────────────────────────┘
```

### **Terceira Linha - Métricas Detalhadas**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Render Time  │ Bundle Size  │ API Response │ Cache Hit    │
│              │              │ Time         │ Rate         │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ 8ms ✅       │ 1.1MB ✅     │ 120ms ✅     │ 85% ✅       │
│ ━━━━━━━━━━━  │ ━━━━━━━━━━━  │ ━━━━━━━━━━━  │ ━━━━━━━━━━━  │
│ Avg: 12ms    │ Target: <2MB │ Avg: 150ms   │ Target: >80% │
│ Last: 7ms    │ Change: -5%  │ Last: 98ms   │ Change: +3%  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### **Quarta Linha - Performance Budgets & Alertas**
```
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE BUDGETS - STATUS                 │
├──────────────────┬──────────────────┬─────────────────────────┤
│ Metric           │ Current          │ Budget / Status       │
├──────────────────┼──────────────────┼─────────────────────────┤
│ LCP              │ 1.2s             │ < 2.5s ✅              │
│ FID              │ 45ms             │ < 100ms ✅             │
│ CLS              │ 0.05             │ < 0.1 ✅               │
│ Page Load        │ 1.5s             │ < 2.0s ✅              │
│ Memory Usage     │ 45MB             │ < 100MB ✅             │
│ Bundle Size      │ 1.1MB            │ < 2.0MB ✅             │
└──────────────────┴──────────────────┴─────────────────────────┘
```

## 🎨 **Componentes do Dashboard**

### **1. CoreWebVitalsCard Component**
```tsx
interface CoreWebVitalsCardProps {
  metric: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'needs-improvement' | 'poor';
}

const CoreWebVitalsCard: React.FC<CoreWebVitalsCardProps> = ({
  metric,
  value,
  target,
  unit,
  trend,
  status
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">{metric}</h3>
        <span className={`text-2xl ${getStatusColor()}`}>
          {status === 'good' ? '✅' : status === 'needs-improvement' ? '⚠️' : '❌'}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-gray-900">
            {value}{unit}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            {getTrendIcon()}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Target: {target}{unit}</span>
            <span>{((value/target) * 100).toFixed(0)}% of target</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                status === 'good' ? 'bg-green-500' : 
                status === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((value/target) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### **2. PerformanceChart Component**
```tsx
interface PerformanceChartProps {
  title: string;
  data: Array<{ time: string; value: number }>;
  color: string;
  unit: string;
  target?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title,
  data,
  color,
  unit,
  target
}) => {
  const maxValue = Math.max(...data.map(d => d.value), target || 0);
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-48 relative">
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={`${(i / 4) * 100}%`}
              x2="100%"
              y2={`${(i / 4) * 100}%`}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Target line */}
          {target && (
            <line
              x1="0"
              y1={`${100 - ((target - minValue) / range) * 100}%`}
              x2="100%"
              y2={`${100 - ((target - minValue) / range) * 100}%`}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
          
          {/* Data line */}
          <polyline
            points={data.map((d, i) => 
              `${(i / (data.length - 1)) * 100},${100 - ((d.value - minValue) / range) * 100}`
            ).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={`${(i / (data.length - 1)) * 100}%`}
              cy={`${100 - ((d.value - minValue) / range) * 100}%`}
              r="3"
              fill={color}
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Min: {minValue.toFixed(1)}{unit}</span>
        <span>Avg: {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}{unit}</span>
        <span>Max: {maxValue.toFixed(1)}{unit}</span>
      </div>
    </div>
  );
};
```

### **3. MetricsTable Component**
```tsx
interface MetricsTableProps {
  metrics: Array<{
    name: string;
    current: number;
    target: number;
    unit: string;
    change: number;
    status: 'good' | 'needs-improvement' | 'poor';
  }>;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metric
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget / Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {metric.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <span className="font-semibold">
                    {metric.current.toFixed(1)}{metric.unit}
                  </span>
                  <span className="ml-2">
                    {metric.status === 'good' ? '✅' : 
                     metric.status === 'needs-improvement' ? '⚠️' : '❌'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>
                  <div className="text-sm text-gray-900">
                    Target: {metric.target}{metric.unit}
                  </div>
                  <div className={`text-xs ${
                    metric.status === 'good' ? 'text-green-600' :
                    metric.status === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.status === 'good' ? '✅ Within budget' :
                     metric.status === 'needs-improvement' ? '⚠️ Needs improvement' :
                     '❌ Exceeds budget'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '↗️' : '↘️'} {Math.abs(metric.change).toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 📊 **Dados de Exemplo e APIs**

### **Formato dos Dados**
```typescript
interface DashboardData {
  coreWebVitals: {
    lcp: { value: number; target: number; status: string; trend: string };
    fid: { value: number; target: number; status: string; trend: string };
    cls: { value: number; target: number; status: string; trend: string };
    fcp: { value: number; target: number; status: string; trend: string };
    ttfb: { value: number; target: number; status: string; trend: string };
  };
  performanceTimeline: Array<{ time: string; value: number }>;
  memoryUsage: Array<{ time: string; value: number }>;
  detailedMetrics: Array<{
    name: string;
    current: number;
    target: number;
    unit: string;
    change: number;
    status: string;
  }>;
  budgets: Array<{
    metric: string;
    current: number;
    budget: number;
    status: string;
  }>;
}
```

### **API de Dados em Tempo Real**
```typescript
// Service para buscar dados do dashboard
class DashboardDataService {
  private ws: WebSocket | null = null;
  private reconnectInterval = 5000;

  connect() {
    this.ws = new WebSocket('ws://localhost:3001/performance-metrics');
    
    this.ws.onopen = () => {
      console.log('Connected to performance metrics stream');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.updateDashboard(data);
    };
    
    this.ws.onclose = () => {
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
  }

  updateDashboard(data: DashboardData) {
    // Atualizar componentes do dashboard
    window.dispatchEvent(new CustomEvent('dashboard-update', { detail: data }));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Uso
const dashboardService = new DashboardDataService();
dashboardService.connect();
```

## 🚨 **Sistema de Alertas**

### **Tipos de Alertas**
```typescript
interface AlertConfig {
  type: 'budget_exceeded' | 'performance_degradation' | 'error_rate_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
  timestamp: string;
  suggestions?: string[];
}

// Exemplos de alertas
const alertExamples: AlertConfig[] = [
  {
    type: 'budget_exceeded',
    severity: 'high',
    metric: 'LCP',
    currentValue: 3.2,
    threshold: 2.5,
    message: 'LCP exceeded budget: 3.2s (target: 2.5s)',
    timestamp: new Date().toISOString(),
    suggestions: [
      'Optimize images with WebP format',
      'Implement lazy loading for below-fold content',
      'Consider using a CDN for static assets'
    ]
  },
  {
    type: 'performance_degradation',
    severity: 'medium',
    metric: 'memory_usage',
    currentValue: 120,
    threshold: 100,
    message: 'Memory usage above normal: 120MB (typical: 45MB)',
    timestamp: new Date().toISOString(),
    suggestions: [
      'Check for memory leaks in component lifecycle',
      'Implement virtual scrolling for large lists',
      'Review Web Worker implementations'
    ]
  }
];
```

### **Integração com Slack**
```typescript
class SlackAlertService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendAlert(alert: AlertConfig) {
    const payload = {
      text: `🚨 Performance Alert - ${alert.severity.toUpperCase()}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: 'Metric',
              value: alert.metric,
              short: true
            },
            {
              title: 'Current Value',
              value: `${alert.currentValue} (${this.getStatusEmoji(alert.currentValue, alert.threshold)})`,
              short: true
            },
            {
              title: 'Threshold',
              value: alert.threshold.toString(),
              short: true
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: true
            },
            {
              title: 'Message',
              value: alert.message,
              short: false
            }
          ],
          actions: alert.suggestions?.map((suggestion, index) => ({
            name: `suggestion_${index}`,
            text: `💡 Suggestion ${index + 1}`,
            type: 'button',
            value: suggestion
          }))
        }
      ]
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return '#439FE0';
      case 'low': return 'good';
      default: return '#439FE0';
    }
  }

  private getStatusEmoji(current: number, threshold: number): string {
    return current <= threshold ? '✅' : '❌';
  }
}
```

## 🛠️ **Configuração e Uso**

### **1. Instalação e Setup**
```bash
# Instalar dependências adicionais (se necessário)
npm install chart.js react-chartjs-2

# Configurar variáveis de ambiente
echo "VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL" >> .env
echo "VITE_ENABLE_PERFORMANCE_DASHBOARD=true" >> .env
```

### **2. Ativar Monitoramento**
```typescript
// Em src/index.tsx ou App.tsx
import { initializePerformanceMonitoring } from './utils/performanceMonitor';

// Inicializar monitoramento
initializePerformanceMonitoring({
  enableDashboard: true,
  enableAlerts: true,
  slackWebhookUrl: import.meta.env.VITE_SLACK_WEBHOOK_URL,
  budgets: {
    LCP: { threshold: 2500, alert: true },
    FID: { threshold: 100, alert: true },
    CLS: { threshold: 0.1, alert: true },
    pageLoadTime: { threshold: 2000, alert: true }
  }
});
```

### **3. Acessar Dashboard**
```
# Desenvolvimento
http://localhost:5174/performance-dashboard

# Produção
https://seu-dominio.com/performance-dashboard
```

### **4. Comandos Úteis**
```typescript
// Ver todas as métricas no console
window.performance.getEntriesByType('measure');

// Limpar cache de performance
localStorage.removeItem('performance_metrics');

// Exportar relatório
window.exportPerformanceReport = () => {
  const data = performance.getEntriesByType('measure');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-report-${new Date().toISOString()}.json`;
  a.click();
};

// Testar alertas manualmente
window.triggerTestAlert = () => {
  window.dispatchEvent(new CustomEvent('performance-alert', {
    detail: {
      type: 'budget_exceeded',
      severity: 'high',
      metric: 'LCP',
      currentValue: 3.5,
      threshold: 2.5,
      message: 'Test alert: LCP exceeded budget'
    }
  }));
};
```

## 📈 **Integração com Ferramentas Externas**

### **Google Analytics 4**
```typescript
// Enviar métricas para GA4
gtag('event', 'web_vitals', {
  event_category: 'Performance',
  event_label: 'LCP',
  value: Math.round(lcpValue * 1000), // em milissegundos
  custom_map: {
    metric_value: lcpValue,
    metric_rating: lcpRating,
    device_type: getDeviceType(),
    connection_type: getConnectionType()
  }
});
```

### **Sentry Performance**
```typescript
// Integrar com Sentry para monitoramento completo
Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', 'seu-dominio.com'],
      beforeNavigate: context => ({
        ...context,
        name: window.location.pathname,
      }),
    }),
  ],
  tracesSampleRate: 1.0,
});

// Capturar transações de performance
const transaction = Sentry.startTransaction({
  name: 'performance-monitoring',
  op: 'dashboard'
});
```

## 🎯 **Conclusão**

Este dashboard fornece:

✅ **Visibilidade completa** em tempo real da performance
✅ **Alertas proativos** para prevenir problemas
✅ **Análise histórica** para identificar tendências
✅ **Integração com ferramentas** existentes
✅ **Interface intuitiva** e responsiva
✅ **Dados exportáveis** para análises adicionais

O dashboard está agora **ativo e monitorando** todas as otimizações implementadas, garantindo que o sistema mantenha a **performance excepcional** alcançada! 🚀
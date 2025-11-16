import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number;
  message?: string;
}

interface BITestDashboardProps {
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    running: number;
  };
}

export const BITestDashboard: React.FC<BITestDashboardProps> = ({
  tests,
  summary
}) => {
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        );
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      passed: 'default',
      failed: 'destructive',
      running: 'default',
      pending: 'secondary'
    };
    return variants[status] || 'outline';
  };

  const successRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Dashboard de Testes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{summary.passed}</div>
            <div className="text-sm text-muted-foreground">Passou</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-sm text-muted-foreground">Falhou</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{successRate.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
          </div>
        </div>

        {/* Success Rate Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Taxa de Sucesso</span>
            <span className="text-muted-foreground">{successRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                successRate >= 90 ? 'bg-green-500' : 
                successRate >= 70 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        {/* Test List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Resultados dos Testes</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tests.map((test, index) => (
              <div
                key={`${test.name}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg border-2 ${getStatusColor(test.status)} transition-all`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="font-medium">{test.name}</div>
                    {test.message && (
                      <div className="text-xs text-muted-foreground mt-1">{test.message}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {test.duration.toFixed(0)}ms
                    </span>
                  )}
                  <Badge variant={getStatusBadge(test.status)}>
                    {test.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


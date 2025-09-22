// Web Worker for heavy data processing tasks
// This runs in a separate thread to avoid blocking the main UI

interface WorkerMessage {
  type: string;
  id: string;
  data: any;
}

interface WorkerResponse {
  type: string;
  id: string;
  result?: any;
  error?: string;
}

// Data processing functions
const processPatientData = (patients: any[]) => {
  return patients.map(patient => ({
    ...patient,
    age: calculateAge(patient.dateOfBirth),
    riskScore: calculateRiskScore(patient),
    recommendations: generateRecommendations(patient),
  }));
};

const processAppointmentAnalytics = (appointments: any[]) => {
  const now = new Date();
  const thisMonth = appointments.filter(apt =>
    new Date(apt.startTime).getMonth() === now.getMonth()
  );

  return {
    total: appointments.length,
    thisMonth: thisMonth.length,
    averageDuration: calculateAverageDuration(appointments),
    completionRate: calculateCompletionRate(appointments),
    busyHours: analyzeBusyHours(appointments),
    therapistUtilization: analyzeTherapistUtilization(appointments),
  };
};

const processFinancialData = (transactions: any[]) => {
  const revenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyRevenue = groupTransactionsByMonth(transactions);
  const forecast = generateRevenueForecast(monthlyRevenue);

  return {
    totalRevenue: revenue,
    monthlyRevenue,
    forecast,
    averageTransactionValue: revenue / transactions.length,
    paymentMethodDistribution: analyzePaymentMethods(transactions),
  };
};

const processExerciseData = (exercises: any[], userProgress: any[]) => {
  return exercises.map(exercise => ({
    ...exercise,
    completionRate: calculateExerciseCompletionRate(exercise.id, userProgress),
    averageRating: calculateAverageRating(exercise.id, userProgress),
    difficultyAdjustment: suggestDifficultyAdjustment(exercise, userProgress),
    popularityScore: calculatePopularityScore(exercise.id, userProgress),
  }));
};

const generateInsights = (data: any) => {
  const insights = [];

  // Revenue insights
  if (data.revenue) {
    const growth = calculateGrowthRate(data.revenue.monthlyRevenue);
    if (growth > 0.1) {
      insights.push({
        type: 'success',
        category: 'revenue',
        title: 'Crescimento de Receita Acelerado',
        description: `Receita cresceu ${(growth * 100).toFixed(1)}% no último período`,
        impact: 'high',
        actionItems: ['Manter estratégias atuais', 'Considerar expansão'],
      });
    }
  }

  // Patient insights
  if (data.patients) {
    const highRiskPatients = data.patients.filter((p: any) => p.riskScore > 7);
    if (highRiskPatients.length > 0) {
      insights.push({
        type: 'warning',
        category: 'patients',
        title: 'Pacientes de Alto Risco',
        description: `${highRiskPatients.length} pacientes requerem atenção especial`,
        impact: 'medium',
        actionItems: ['Agendar consultas de acompanhamento', 'Revisar planos de tratamento'],
      });
    }
  }

  // Appointment insights
  if (data.appointments) {
    const cancellationRate = data.appointments.cancellationRate;
    if (cancellationRate > 0.15) {
      insights.push({
        type: 'warning',
        category: 'appointments',
        title: 'Alta Taxa de Cancelamento',
        description: `Taxa de cancelamento de ${(cancellationRate * 100).toFixed(1)}% está acima do ideal`,
        impact: 'medium',
        actionItems: ['Implementar confirmações automáticas', 'Revisar políticas de cancelamento'],
      });
    }
  }

  return insights;
};

// Utility functions
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const calculateRiskScore = (patient: any): number => {
  let score = 0;

  // Age factor
  const age = calculateAge(patient.dateOfBirth);
  if (age > 65) score += 2;
  else if (age > 50) score += 1;

  // Medical history factors
  if (patient.medicalHistory?.chronicConditions?.length > 0) score += 3;
  if (patient.medicalHistory?.surgeries?.length > 2) score += 2;
  if (patient.medicalHistory?.medications?.length > 5) score += 1;

  // Lifestyle factors
  if (patient.lifestyle?.smoking) score += 2;
  if (patient.lifestyle?.alcohol === 'heavy') score += 1;
  if (patient.lifestyle?.exercise === 'sedentary') score += 2;

  return Math.min(score, 10); // Cap at 10
};

const generateRecommendations = (patient: any): string[] => {
  const recommendations = [];
  const age = calculateAge(patient.dateOfBirth);
  const riskScore = calculateRiskScore(patient);

  if (riskScore > 7) {
    recommendations.push('Monitoramento frequente necessário');
    recommendations.push('Considerara consulta médica adicional');
  }

  if (age > 65) {
    recommendations.push('Exercícios de equilíbrio e prevenção de quedas');
    recommendations.push('Fortalecimento muscular adaptado');
  }

  if (patient.medicalHistory?.chronicConditions?.includes('diabetes')) {
    recommendations.push('Cuidados especiais com cicatrização');
    recommendations.push('Monitoramento glicêmico durante exercícios');
  }

  return recommendations;
};

const calculateAverageDuration = (appointments: any[]): number => {
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  if (completedAppointments.length === 0) return 0;

  const totalDuration = completedAppointments.reduce((sum, apt) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    return sum + (end.getTime() - start.getTime());
  }, 0);

  return totalDuration / completedAppointments.length / (1000 * 60); // Convert to minutes
};

const calculateCompletionRate = (appointments: any[]): number => {
  if (appointments.length === 0) return 0;
  const completed = appointments.filter(apt => apt.status === 'completed').length;
  return completed / appointments.length;
};

const analyzeBusyHours = (appointments: any[]) => {
  const hourCounts = new Array(24).fill(0);

  appointments.forEach(apt => {
    const hour = new Date(apt.startTime).getHours();
    hourCounts[hour]++;
  });

  return hourCounts.map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count);
};

const analyzeTherapistUtilization = (appointments: any[]) => {
  const therapistStats = new Map();

  appointments.forEach(apt => {
    if (!therapistStats.has(apt.therapistId)) {
      therapistStats.set(apt.therapistId, {
        total: 0,
        completed: 0,
        canceled: 0,
      });
    }

    const stats = therapistStats.get(apt.therapistId);
    stats.total++;

    if (apt.status === 'completed') stats.completed++;
    if (apt.status === 'canceled') stats.canceled++;
  });

  return Array.from(therapistStats.entries()).map(([therapistId, stats]) => ({
    therapistId,
    ...stats,
    completionRate: stats.completed / stats.total,
    cancellationRate: stats.canceled / stats.total,
  }));
};

const groupTransactionsByMonth = (transactions: any[]) => {
  const monthlyData = new Map();

  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { revenue: 0, count: 0 });
    }

    const data = monthlyData.get(monthKey);
    if (transaction.status === 'completed') {
      data.revenue += transaction.amount;
      data.count++;
    }
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const generateRevenueForecast = (monthlyRevenue: any[]) => {
  if (monthlyRevenue.length < 3) return [];

  // Simple linear regression for forecast
  const lastThreeMonths = monthlyRevenue.slice(-3);
  const avgGrowth = lastThreeMonths.reduce((sum, month, index) => {
    if (index === 0) return 0;
    const growth = (month.revenue - lastThreeMonths[index - 1].revenue) / lastThreeMonths[index - 1].revenue;
    return sum + growth;
  }, 0) / (lastThreeMonths.length - 1);

  const lastRevenue = monthlyRevenue[monthlyRevenue.length - 1].revenue;
  const forecast = [];

  for (let i = 1; i <= 6; i++) {
    const forecastedRevenue = lastRevenue * Math.pow(1 + avgGrowth, i);
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    forecast.push({
      month: monthKey,
      revenue: forecastedRevenue,
      confidence: Math.max(0.5, 1 - (i * 0.1)), // Decreasing confidence over time
    });
  }

  return forecast;
};

const analyzePaymentMethods = (transactions: any[]) => {
  const methodCounts = new Map();

  transactions.forEach(transaction => {
    const method = transaction.paymentMethod || 'unknown';
    methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
  });

  return Array.from(methodCounts.entries())
    .map(([method, count]) => ({ method, count, percentage: count / transactions.length }))
    .sort((a, b) => b.count - a.count);
};

const calculateExerciseCompletionRate = (exerciseId: string, userProgress: any[]): number => {
  const exerciseProgress = userProgress.filter(p => p.exerciseId === exerciseId);
  if (exerciseProgress.length === 0) return 0;

  const completed = exerciseProgress.filter(p => p.completed).length;
  return completed / exerciseProgress.length;
};

const calculateAverageRating = (exerciseId: string, userProgress: any[]): number => {
  const ratings = userProgress
    .filter(p => p.exerciseId === exerciseId && p.rating)
    .map(p => p.rating);

  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

const suggestDifficultyAdjustment = (exercise: any, userProgress: any[]): string => {
  const completionRate = calculateExerciseCompletionRate(exercise.id, userProgress);
  const averageRating = calculateAverageRating(exercise.id, userProgress);

  if (completionRate < 0.5 && averageRating < 3) {
    return 'decrease'; // Too difficult
  } else if (completionRate > 0.9 && averageRating > 4) {
    return 'increase'; // Too easy
  }

  return 'maintain';
};

const calculatePopularityScore = (exerciseId: string, userProgress: any[]): number => {
  const exerciseProgress = userProgress.filter(p => p.exerciseId === exerciseId);
  const uniqueUsers = new Set(exerciseProgress.map(p => p.userId)).size;
  const totalSessions = exerciseProgress.length;

  return uniqueUsers * 0.7 + totalSessions * 0.3; // Weighted score
};

const calculateGrowthRate = (monthlyData: any[]): number => {
  if (monthlyData.length < 2) return 0;

  const latest = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];

  return (latest.revenue - previous.revenue) / previous.revenue;
};

// Message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, id, data } = e.data;

  try {
    let result;

    switch (type) {
      case 'PROCESS_PATIENTS':
        result = processPatientData(data);
        break;

      case 'PROCESS_APPOINTMENTS':
        result = processAppointmentAnalytics(data);
        break;

      case 'PROCESS_FINANCIAL':
        result = processFinancialData(data);
        break;

      case 'PROCESS_EXERCISES':
        result = processExerciseData(data.exercises, data.userProgress);
        break;

      case 'GENERATE_INSIGHTS':
        result = generateInsights(data);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response: WorkerResponse = {
      type: `${type}_SUCCESS`,
      id,
      result,
    };

    self.postMessage(response);

  } catch (error) {
    const response: WorkerResponse = {
      type: `${type}_ERROR`,
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    self.postMessage(response);
  }
};

// Export for TypeScript
export {};
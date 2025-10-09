/**
 * Página de Analytics de Exercícios
 * Dashboard com métricas e insights
 */

import React, { useState } from 'react';
import { useExercise } from '../contexts/ExerciseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Award,
  Users,
  Target,
  Zap,
} from 'lucide-react';

const ExerciseAnalyticsPage: React.FC = () => {
  const { exercises, assignments } = useExercise();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Exercícios mais usados
  const topExercises = exercises
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)
    .map(ex => ({
      name: ex.name.substring(0, 20),
      uso: ex.usageCount,
      rating: ex.averageRating || 0,
    }));

  // Distribuição por dificuldade
  const difficultyData = [
    {
      name: 'Iniciante',
      value: exercises.filter(ex => ex.difficulty === 'beginner').length,
      color: '#10B981',
    },
    {
      name: 'Intermediário',
      value: exercises.filter(ex => ex.difficulty === 'intermediate').length,
      color: '#3B82F6',
    },
    {
      name: 'Avançado',
      value: exercises.filter(ex => ex.difficulty === 'advanced').length,
      color: '#F59E0B',
    },
    {
      name: 'Expert',
      value: exercises.filter(ex => ex.difficulty === 'expert').length,
      color: '#EF4444',
    },
  ];

  // Uso ao longo do tempo (mock)
  const usageOverTime = [
    { mes: 'Jan', novos: 5, usados: 12 },
    { mes: 'Fev', novos: 8, usados: 18 },
    { mes: 'Mar', novos: 6, usados: 22 },
    { mes: 'Abr', novos: 10, usados: 28 },
  ];

  const stats = {
    totalExercises: exercises.length,
    activeAssignments: assignments.filter(a => a.isActive).length,
    avgUsage: exercises.length > 0
      ? Math.round(exercises.reduce((sum, ex) => sum + ex.usageCount, 0) / exercises.length)
      : 0,
    topRated: exercises
      .filter(ex => ex.averageRating)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))[0],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics de Exercícios</h1>
          <p className="text-gray-500 mt-1">
            Métricas e insights sobre uso de exercícios
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
            <SelectItem value="365">1 ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExercises}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atribuições Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUsage}x</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Avaliado</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {stats.topRated?.name || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.topRated?.averageRating?.toFixed(1)}/10
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Exercícios */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Exercícios Mais Usados</CardTitle>
            <CardDescription>Exercícios mais atribuídos aos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topExercises} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="uso" fill="#3B82F6" name="Vezes Usado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Dificuldade */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Dificuldade</CardTitle>
            <CardDescription>Nível dos exercícios cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crescimento ao Longo do Tempo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crescimento da Biblioteca</CardTitle>
            <CardDescription>Novos exercícios e uso ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="novos"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Novos Exercícios"
                />
                <Line
                  type="monotone"
                  dataKey="usados"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Total de Usos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Tendência Positiva</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Exercícios de fortalecimento aumentaram 25% no último mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Recomendação</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Considere adicionar mais exercícios de equilíbrio para idosos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Destaque</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Protocolos estão sendo 3x mais usados que exercícios individuais
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExerciseAnalyticsPage;


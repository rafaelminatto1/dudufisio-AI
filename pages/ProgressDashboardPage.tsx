/**
 * Dashboard de Progresso
 * Visualização de evolução e métricas de exercícios
 */

import React, { useState, useEffect } from 'react';
import { useExercise } from '../contexts/ExerciseContext';
import { usePatient } from '../contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Calendar,
} from 'lucide-react';

const ProgressDashboardPage: React.FC = () => {
  const { assignments, exercises } = useExercise();
  const { patients, getAllPatients } = usePatient();

  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');

  useEffect(() => {
    getAllPatients();
  }, []);

  // Filtrar dados
  const filteredAssignments = selectedPatient === 'all'
    ? assignments
    : assignments.filter(a => a.patientId === selectedPatient);

  // Dados para gráficos
  const progressData = [
    { name: 'Sem 1', volume: 120, completionRate: 85, painLevel: 3 },
    { name: 'Sem 2', volume: 150, completionRate: 90, painLevel: 2 },
    { name: 'Sem 3', volume: 180, completionRate: 95, painLevel: 2 },
    { name: 'Sem 4', volume: 200, completionRate: 100, painLevel: 1 },
  ];

  const categoryData = [
    { name: 'Mobilidade', value: 35, color: '#3B82F6' },
    { name: 'Fortalecimento', value: 45, color: '#EF4444' },
    { name: 'Alongamento', value: 15, color: '#10B981' },
    { name: 'Equilíbrio', value: 5, color: '#F59E0B' },
  ];

  const stats = {
    totalSessions: filteredAssignments.reduce((sum, a) => sum + (a.progress?.length || 0), 0),
    avgCompletionRate: 92,
    avgPainLevel: 2.1,
    improvement: 15,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Progresso</h1>
          <p className="text-gray-500 mt-1">
            Visualize a evolução dos pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos os Pacientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Pacientes</SelectItem>
              {patients.map(patient => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {selectedPeriod} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionRate}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível de Dor Médio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPainLevel}/10</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.8 vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhoria</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.improvement}%</div>
            <p className="text-xs text-muted-foreground">
              Evolução geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Volume</CardTitle>
            <CardDescription>Volume total de exercícios ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Volume Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de Conclusão */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conclusão</CardTitle>
            <CardDescription>Porcentagem de conclusão semanal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completionRate"
                  fill="#10B981"
                  name="Conclusão (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nível de Dor */}
        <Card>
          <CardHeader>
            <CardTitle>Nível de Dor</CardTitle>
            <CardDescription>Evolução da percepção de dor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="painLevel"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Nível de Dor"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Tipos de exercícios realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressDashboardPage;


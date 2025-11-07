/**
 * AI Unified Dashboard
 * Integrates all AI features: Churn Prediction, BI Insights, Treatment Plans
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingDown,
  TrendingUp,
  Users,
  AlertTriangle,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChurnPredictionWidget } from './widgets/ChurnPredictionWidget';
import { BIInsightsWidget } from './widgets/BIInsightsWidget';
import { TreatmentPlanWidget } from './widgets/TreatmentPlanWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

interface DashboardConfig {
  showChurn: boolean;
  showBI: boolean;
  showTreatment: boolean;
  showActions: boolean;
}

export function AIUnifiedDashboard() {
  const [config, setConfig] = useState<DashboardConfig>({
    showChurn: true,
    showBI: true,
    showTreatment: true,
    showActions: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard de IA
              </h1>
              <p className="text-slate-600">
                Insights inteligentes para otimizar sua clínica
              </p>
            </div>
          </div>

          <button
            onClick={() => {/* TODO: Open settings */}}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Configurações do Dashboard"
            aria-label="Abrir configurações do dashboard"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </motion.div>

      {/* AI Status Banner */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-slate-900">
                    IA Ativa - Google Gemini Pro
                  </p>
                  <p className="text-sm text-slate-600">
                    Todos os modelos operacionais
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="churn" className="gap-2">
            <TrendingDown className="w-4 h-4" />
            Predição de Churn
          </TabsTrigger>
          <TabsTrigger value="bi" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="treatment" className="gap-2">
            <FileText className="w-4 h-4" />
            Planos de Tratamento
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
              <QuickActionsWidget />
            </motion.div>

            {/* Churn Summary */}
            {config.showChurn && (
              <motion.div variants={itemVariants}>
                <ChurnPredictionWidget variant="summary" />
              </motion.div>
            )}

            {/* BI Summary */}
            {config.showBI && (
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <BIInsightsWidget variant="summary" />
              </motion.div>
            )}

            {/* Treatment Plans */}
            {config.showTreatment && (
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <TreatmentPlanWidget variant="recent" />
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* Churn Tab */}
        <TabsContent value="churn">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ChurnPredictionWidget variant="full" />
          </motion.div>
        </TabsContent>

        {/* BI Tab */}
        <TabsContent value="bi">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BIInsightsWidget variant="full" />
          </motion.div>
        </TabsContent>

        {/* Treatment Tab */}
        <TabsContent value="treatment">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TreatmentPlanWidget variant="generator" />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

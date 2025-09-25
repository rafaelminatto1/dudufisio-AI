"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Settings, 
  Shield, 
  BarChart3, 
  User,
  Database,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { MedicalRecordsDashboard } from './MedicalRecordsDashboard';
import { ClinicalTemplatesManager } from './ClinicalTemplatesManager';
import { DigitalSignatureManager } from './DigitalSignatureManager';
import { ClinicalReportsGenerator } from './ClinicalReportsGenerator';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  fhir: 'active' | 'inactive' | 'error';
  signatures: 'active' | 'inactive' | 'error';
  compliance: 'compliant' | 'warning' | 'error';
}

export function MedicalRecordsSystem() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'connected',
    fhir: 'active',
    signatures: 'active',
    compliance: 'compliant'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'compliant':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'disconnected':
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard Principal',
      description: 'Visão geral dos prontuários e pacientes',
      icon: <FileText className="h-5 w-5" />,
      component: <MedicalRecordsDashboard />
    },
    {
      id: 'templates',
      name: 'Templates Clínicos',
      description: 'Gerenciar templates dinâmicos',
      icon: <Settings className="h-5 w-5" />,
      component: <ClinicalTemplatesManager />
    },
    {
      id: 'signatures',
      name: 'Assinaturas Digitais',
      description: 'Gerenciar certificados e assinaturas',
      icon: <Shield className="h-5 w-5" />,
      component: <DigitalSignatureManager />
    },
    {
      id: 'reports',
      name: 'Relatórios Clínicos',
      description: 'Gerar relatórios de progresso e alta',
      icon: <BarChart3 className="h-5 w-5" />,
      component: <ClinicalReportsGenerator />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Sistema de Prontuário Eletrônico Médico
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema completo seguindo padrões HL7 FHIR com compliance CFM/COFFITO
              </p>
            </div>
            
            {/* System Status */}
            <div className="flex gap-2">
              <Badge className={getStatusColor(systemStatus.database)}>
                {getStatusIcon(systemStatus.database)}
                <Database className="h-3 w-3 ml-1" />
                Database
              </Badge>
              <Badge className={getStatusColor(systemStatus.fhir)}>
                {getStatusIcon(systemStatus.fhir)}
                FHIR
              </Badge>
              <Badge className={getStatusColor(systemStatus.signatures)}>
                {getStatusIcon(systemStatus.signatures)}
                <Shield className="h-3 w-3 ml-1" />
                Assinaturas
              </Badge>
              <Badge className={getStatusColor(systemStatus.compliance)}>
                {getStatusIcon(systemStatus.compliance)}
                Compliance
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {modules.map((module) => (
              <TabsTrigger key={module.id} value={module.id} className="flex items-center gap-2">
                {module.icon}
                <span className="hidden sm:inline">{module.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Module Content */}
          {modules.map((module) => (
            <TabsContent key={module.id} value={module.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {module.icon}
                    {module.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    {module.description}
                  </p>
                </CardHeader>
                <CardContent>
                  {module.component}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* System Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Arquitetura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Backend:</strong> Supabase + PostgreSQL</p>
                <p><strong>Frontend:</strong> React 19 + TypeScript</p>
                <p><strong>UI:</strong> shadcn/ui + TailwindCSS</p>
                <p><strong>Padrões:</strong> HL7 FHIR R4</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>CFM:</strong> Conselho Federal de Medicina</p>
                <p><strong>COFFITO:</strong> Conselho Federal de Fisioterapia</p>
                <p><strong>LGPD:</strong> Lei Geral de Proteção de Dados</p>
                <p><strong>Assinatura:</strong> ICP-Brasil</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Versionamento:</strong> Controle de versões automático</p>
                <p><strong>Auditoria:</strong> Trilha completa de alterações</p>
                <p><strong>Templates:</strong> Formulários dinâmicos</p>
                <p><strong>Relatórios:</strong> Geração automática</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => setActiveModule('dashboard')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Novo Prontuário</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => setActiveModule('templates')}
                >
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">Criar Template</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => setActiveModule('signatures')}
                >
                  <Shield className="h-6 w-6 mb-2" />
                  <span className="text-sm">Assinar Documento</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => setActiveModule('reports')}
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gerar Relatório</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


/**
 * Componente: Visualizador de Documentos Clínicos
 * Visualizador completo com suporte a assinatura digital e compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
} from '@/components/ui/button';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle,
  Shield,
  FileText,
  Activity,
  Target,
  Calendar,
  User,
  Heart,
  Brain,
  Bone,
  Lungs,
  Baby,
  Zap,
  Stethoscope,
  Download,
  Print,
  Eye,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  PainChart,
  BarChart3,
  PieChart,
  LineChart,
  Lock,
  Unlock,
  Signature,
  Certificate,
  Verified,
  Warning,
  Info,
  ExternalLink,
  Copy,
  Share,
  Bookmark,
  Star,
  Flag,
  MessageSquare,
  Send,
  Archive,
  History,
  Settings,
  MoreHorizontal
} from 'lucide-react';

interface ClinicalDocument {
  id: string;
  type: 'initial_assessment' | 'session_evolution' | 'treatment_plan' | 'discharge_summary' | 'referral_letter' | 'progress_report';
  title: string;
  content: any;
  metadata: {
    version: number;
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    specialty: string;
    sessionId?: string;
    templateId?: string;
  };
  signature?: {
    isSigned: boolean;
    signedBy?: string;
    signedAt?: Date;
    certificate?: string;
    algorithm?: string;
    integrity?: boolean;
  };
  compliance?: {
    cfm: {
      score: number;
      violations: Array<{
        code: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
    };
    coffito: {
      score: number;
      violations: Array<{
        code: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
    };
    lgpd: {
      score: number;
      violations: Array<{
        code: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
    };
  };
  auditTrail?: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    details: any;
  }>;
}

interface DocumentViewerProps {
  document: ClinicalDocument;
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onSign?: (documentId: string) => void;
  onExport?: (documentId: string, format: 'pdf' | 'json' | 'xml') => void;
  onPrint?: (documentId: string) => void;
  onShare?: (documentId: string) => void;
  onArchive?: (documentId: string) => void;
  onViewHistory?: (documentId: string) => void;
  onViewCompliance?: (documentId: string) => void;
  onViewSignature?: (documentId: string) => void;
  onViewAuditTrail?: (documentId: string) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSign?: boolean;
  canExport?: boolean;
  canPrint?: boolean;
  canShare?: boolean;
  canArchive?: boolean;
}

export function DocumentViewer({
  document,
  onEdit,
  onDelete,
  onSign,
  onExport,
  onPrint,
  onShare,
  onArchive,
  onViewHistory,
  onViewCompliance,
  onViewSignature,
  onViewAuditTrail,
  isLoading = false,
  canEdit = false,
  canDelete = false,
  canSign = false,
  canExport = false,
  canPrint = false,
  canShare = false,
  canArchive = false
}: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);
  const [showSignatureDetails, setShowSignatureDetails] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'initial_assessment': return FileText;
      case 'session_evolution': return Activity;
      case 'treatment_plan': return Target;
      case 'discharge_summary': return CheckCircle;
      case 'referral_letter': return User;
      case 'progress_report': return BarChart3;
      default: return FileText;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'initial_assessment': return 'bg-blue-100 text-blue-600';
      case 'session_evolution': return 'bg-green-100 text-green-600';
      case 'treatment_plan': return 'bg-purple-100 text-purple-600';
      case 'discharge_summary': return 'bg-emerald-100 text-emerald-600';
      case 'referral_letter': return 'bg-orange-100 text-orange-600';
      case 'progress_report': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'physiotherapy': return Heart;
      case 'neurological_physiotherapy': return Brain;
      case 'orthopedic_physiotherapy': return Bone;
      case 'respiratory_physiotherapy': return Lungs;
      case 'pediatric_physiotherapy': return Baby;
      case 'sports_physiotherapy': return Zap;
      default: return Stethoscope;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-yellow-100 text-yellow-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Warning;
      case 'low': return Info;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const DocumentIcon = getDocumentIcon(document.type);
  const SpecialtyIcon = getSpecialtyIcon(document.metadata.specialty);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${getDocumentColor(document.type)}`}>
            <DocumentIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h1>
            <p className="text-gray-600">
              {document.type.replace('_', ' ').toUpperCase()} • v{document.metadata.version}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Status Badges */}
          {document.signature?.isSigned && (
            <Badge className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Assinado
            </Badge>
          )}
          
          {document.compliance && (
            <Badge className={getComplianceBadge(document.compliance.cfm.score)}>
              <Shield className="h-3 w-3 mr-1" />
              {document.compliance.cfm.score}% Compliance
            </Badge>
          )}
          
          <Badge variant="outline">
            <SpecialtyIcon className="h-3 w-3 mr-1" />
            {document.metadata.specialty.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory?.(document.id)}
            className="flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComplianceDetails(true)}
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </Button>
          
          {document.signature?.isSigned && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignatureDetails(true)}
              className="flex items-center space-x-2"
            >
              <Signature className="h-4 w-4" />
              <span>Assinatura</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAuditTrail(true)}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Auditoria</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(document.id)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          )}
          
          {canSign && !document.signature?.isSigned && (
            <Button
              size="sm"
              onClick={() => onSign?.(document.id)}
              className="flex items-center space-x-2"
            >
              <Signature className="h-4 w-4" />
              <span>Assinar</span>
            </Button>
          )}
          
          {canExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.(document.id, 'pdf')}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
          )}
          
          {canPrint && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint?.(document.id)}
              className="flex items-center space-x-2"
            >
              <Print className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
          )}
          
          {canShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare?.(document.id)}
              className="flex items-center space-x-2"
            >
              <Share className="h-4 w-4" />
              <span>Compartilhar</span>
            </Button>
          )}
          
          {canArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive?.(document.id)}
              className="flex items-center space-x-2"
            >
              <Archive className="h-4 w-4" />
              <span>Arquivar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Document Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Conteúdo</span>
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Metadados</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Auditoria</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Conteúdo do Documento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {renderDocumentContent(document)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Metadados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID do Documento</label>
                    <p className="text-sm text-gray-900">{document.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo</label>
                    <p className="text-sm text-gray-900">{document.type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Especialidade</label>
                    <p className="text-sm text-gray-900">{document.metadata.specialty.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Versão</label>
                    <p className="text-sm text-gray-900">{document.metadata.version}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Criado por</label>
                    <p className="text-sm text-gray-900">{document.metadata.createdBy}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Criação</label>
                    <p className="text-sm text-gray-900">{formatDate(document.metadata.createdAt)}</p>
                  </div>
                  
                  {document.metadata.updatedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Atualizado por</label>
                      <p className="text-sm text-gray-900">{document.metadata.updatedBy}</p>
                    </div>
                  )}
                  
                  {document.metadata.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Atualização</label>
                      <p className="text-sm text-gray-900">{formatDate(document.metadata.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {document.compliance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CFM Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>CFM</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getComplianceColor(document.compliance.cfm.score)}`}>
                        {document.compliance.cfm.score}%
                      </div>
                      <div className="text-sm text-gray-600">Compliance Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Violações:</div>
                      {document.compliance.cfm.violations.map((violation, index) => {
                        const SeverityIcon = getSeverityIcon(violation.severity);
                        return (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <SeverityIcon className={`h-4 w-4 ${getSeverityColor(violation.severity)}`} />
                            <span className="text-gray-700">{violation.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* COFFITO Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>COFFITO</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getComplianceColor(document.compliance.coffito.score)}`}>
                        {document.compliance.coffito.score}%
                      </div>
                      <div className="text-sm text-gray-600">Compliance Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Violações:</div>
                      {document.compliance.coffito.violations.map((violation, index) => {
                        const SeverityIcon = getSeverityIcon(violation.severity);
                        return (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <SeverityIcon className={`h-4 w-4 ${getSeverityColor(violation.severity)}`} />
                            <span className="text-gray-700">{violation.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* LGPD Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>LGPD</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getComplianceColor(document.compliance.lgpd.score)}`}>
                        {document.compliance.lgpd.score}%
                      </div>
                      <div className="text-sm text-gray-600">Compliance Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Violações:</div>
                      {document.compliance.lgpd.violations.map((violation, index) => {
                        const SeverityIcon = getSeverityIcon(violation.severity);
                        return (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <SeverityIcon className={`h-4 w-4 ${getSeverityColor(violation.severity)}`} />
                            <span className="text-gray-700">{violation.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Trilha de Auditoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.auditTrail?.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{entry.action}</h4>
                        <span className="text-sm text-gray-500">{formatDate(entry.performedAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">Por: {entry.performedBy}</p>
                      {entry.details && (
                        <p className="text-sm text-gray-500 mt-1">
                          {JSON.stringify(entry.details, null, 2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Details Dialog */}
      <Dialog open={showComplianceDetails} onOpenChange={setShowComplianceDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes de Compliance</DialogTitle>
            <DialogDescription>
              Análise detalhada de conformidade com regulamentações
            </DialogDescription>
          </DialogHeader>
          {/* Implementar detalhes de compliance */}
        </DialogContent>
      </Dialog>

      {/* Signature Details Dialog */}
      <Dialog open={showSignatureDetails} onOpenChange={setShowSignatureDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Assinatura Digital</DialogTitle>
            <DialogDescription>
              Informações sobre a assinatura digital do documento
            </DialogDescription>
          </DialogHeader>
          {/* Implementar detalhes da assinatura */}
        </DialogContent>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={showAuditTrail} onOpenChange={setShowAuditTrail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Trilha de Auditoria Completa</DialogTitle>
            <DialogDescription>
              Histórico completo de todas as ações realizadas no documento
            </DialogDescription>
          </DialogHeader>
          {/* Implementar trilha de auditoria completa */}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Renderiza o conteúdo do documento baseado no tipo
 */
function renderDocumentContent(document: ClinicalDocument): React.ReactNode {
  switch (document.type) {
    case 'initial_assessment':
      return renderInitialAssessment(document.content);
    case 'session_evolution':
      return renderSessionEvolution(document.content);
    case 'treatment_plan':
      return renderTreatmentPlan(document.content);
    case 'discharge_summary':
      return renderDischargeSummary(document.content);
    case 'referral_letter':
      return renderReferralLetter(document.content);
    case 'progress_report':
      return renderProgressReport(document.content);
    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Conteúdo não disponível para visualização</p>
        </div>
      );
  }
}

function renderInitialAssessment(content: any): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Queixa Principal</h3>
        <p className="text-gray-700">{content.chiefComplaint?.description}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">História Clínica</h3>
        <p className="text-gray-700">{content.medicalHistory?.pastMedicalHistory}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Exame Físico</h3>
        <p className="text-gray-700">{content.physicalExam?.inspection}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Diagnóstico</h3>
        <p className="text-gray-700">{content.diagnosis?.primaryDiagnosis}</p>
      </div>
    </div>
  );
}

function renderSessionEvolution(content: any): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Avaliação Subjetiva</h3>
        <p className="text-gray-700">{content.subjectiveAssessment}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Achados Objetivos</h3>
        <p className="text-gray-700">{content.objectiveFindings}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Técnicas Aplicadas</h3>
        <ul className="list-disc list-inside text-gray-700">
          {content.techniquesApplied?.map((technique: any, index: number) => (
            <li key={index}>{technique.name}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Resposta do Paciente</h3>
        <p className="text-gray-700">{content.patientResponse}</p>
      </div>
    </div>
  );
}

function renderTreatmentPlan(content: any): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Metas do Tratamento</h3>
        <ul className="list-disc list-inside text-gray-700">
          {content.goals?.map((goal: any, index: number) => (
            <li key={index}>{goal.description}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Intervenções</h3>
        <ul className="list-disc list-inside text-gray-700">
          {content.interventions?.map((intervention: any, index: number) => (
            <li key={index}>{intervention.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function renderDischargeSummary(content: any): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Resumo do Tratamento</h3>
        <p className="text-gray-700">{content.treatmentSummary}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Resultados</h3>
        <p className="text-gray-700">{content.outcomes}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Recomendações</h3>
        <p className="text-gray-700">{content.recommendations}</p>
      </div>
    </div>
  );
}

function renderReferralLetter(content: any): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Encaminhamento</h3>
        <p className="text-gray-700">{content.referralText}</p>
      </div>
    </div>
  );
}

function renderProgressReport(content: any): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Evolução da Dor</h3>
        <p className="text-gray-700">
          Nível inicial: {content.painEvolution?.initialLevel}/10
        </p>
        <p className="text-gray-700">
          Nível final: {content.painEvolution?.finalLevel}/10
        </p>
        <p className="text-gray-700">
          Melhora: {content.painEvolution?.improvement} pontos
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Progresso Funcional</h3>
        <p className="text-gray-700">{content.functionalProgress}</p>
      </div>
    </div>
  );
}


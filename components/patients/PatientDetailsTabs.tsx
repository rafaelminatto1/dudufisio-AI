/**
 * components/patients/PatientDetailsTabs.tsx
 * 
 * Componente completo de detalhes do paciente com tabs
 * Usa shadcn/ui tabs e accordion
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  usePatientComplete, 
  useUpdatePatient, 
  useUploadDocument,
  useAddPatientNote 
} from '@/hooks/usePatients.query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Upload,
  Download,
  Trash2,
  AlertCircle,
  TrendingUp,
  Activity,
  DollarSign,
  Clock
} from 'lucide-react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

export const PatientDetailsTabs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { patient, kpis, timeline, documents, notes, isLoading, error } = usePatientComplete(id);
  const uploadMutation = useUploadDocument();
  const addNoteMutation = useAddPatientNote();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }
  
  if (error || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Erro ao Carregar Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              {error?.message || 'Paciente não encontrado'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    
    uploadMutation.mutate({
      patientId: id,
      file,
      metadata: {
        document_type: 'other',
        title: file.name,
        document_date: new Date().toISOString().split('T')[0],
      },
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {patient.avatarUrl ? (
              <img 
                src={patient.avatarUrl} 
                alt={patient.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-slate-200 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold shadow-md border-4 border-slate-200">
                {patient.name.charAt(0)}
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <span>{patient.code}</span>
                <span>•</span>
                <span>{patient.age} anos</span>
                <span>•</span>
                <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                  {patient.status}
                </Badge>
              </p>
            </div>
          </div>
          
          <Button variant="outline">Editar Paciente</Button>
        </div>
      </div>
      
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de Sessões</p>
                <p className="text-2xl font-bold text-slate-900">{kpis?.total_sessions || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Aderência</p>
                <p className="text-2xl font-bold text-green-600">{kpis?.adherence_rate || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Gasto</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {(kpis?.total_spent || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Última Sessão</p>
                <p className="text-sm font-semibold text-slate-900">
                  {kpis?.last_session_date 
                    ? format(new Date(kpis.last_session_date), 'dd/MM/yyyy', { locale: ptBR })
                    : 'N/A'
                  }
                </p>
                <p className="text-xs text-slate-500">
                  {kpis?.days_since_last_session 
                    ? `há ${kpis.days_since_last_session} dias`
                    : ''
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline ({timeline?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documentos ({documents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notas ({notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="clinical">Clínico</TabsTrigger>
        </TabsList>
        
        {/* TAB: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium">{patient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Telefone</p>
                    <p className="text-sm font-medium">{patient.phone}</p>
                    {patient.phone2 && <p className="text-sm text-slate-600">{patient.phone2}</p>}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Endereço</p>
                    <p className="text-sm font-medium">
                      {patient.address?.street}, {patient.address?.number}
                    </p>
                    <p className="text-sm text-slate-600">
                      {patient.address?.neighborhood} - {patient.address?.city}/{patient.address?.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Data de Nascimento</p>
                    <p className="text-sm font-medium">
                      {format(new Date(patient.birthDate), 'dd/MM/yyyy', { locale: ptBR })} ({patient.age} anos)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Informações Clínicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Clínicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Diagnóstico Principal</p>
                  <p className="text-sm font-medium">{patient.mainDiagnosis || 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">Médico Solicitante</p>
                  <p className="text-sm font-medium">
                    {patient.referringDoctor || 'Não informado'}
                    {patient.referringDoctorCRM && ` (${patient.referringDoctorCRM})`}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">Convênio</p>
                  <p className="text-sm font-medium">
                    {patient.insurance?.provider || 'Particular'}
                    {patient.insurance?.planName && ` - ${patient.insurance.planName}`}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">Data de Cadastro</p>
                  <p className="text-sm font-medium">
                    {format(new Date(patient.registrationDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Histórico Médico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico Médico</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {patient.medicalHistory?.allergies?.length > 0 && (
                  <AccordionItem value="allergies">
                    <AccordionTrigger>
                      Alergias ({patient.medicalHistory.allergies.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1">
                        {patient.medicalHistory.allergies.map((allergy, i) => (
                          <li key={i} className="text-sm text-slate-700">{allergy}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {patient.medicalHistory?.chronicDiseases?.length > 0 && (
                  <AccordionItem value="chronic">
                    <AccordionTrigger>
                      Doenças Crônicas ({patient.medicalHistory.chronicDiseases.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1">
                        {patient.medicalHistory.chronicDiseases.map((disease, i) => (
                          <li key={i} className="text-sm text-slate-700">{disease}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {patient.medicalHistory?.currentMedications?.length > 0 && (
                  <AccordionItem value="medications">
                    <AccordionTrigger>
                      Medicamentos Atuais ({patient.medicalHistory.currentMedications.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1">
                        {patient.medicalHistory.currentMedications.map((med, i) => (
                          <li key={i} className="text-sm text-slate-700">{med}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB: Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
              <CardDescription>
                Linha do tempo completa de todas as atividades do paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="relative">
                  {/* Linha vertical */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                  
                  {timeline.map((event) => (
                    <div key={event.id} className="relative pl-12 pb-8 last:pb-0">
                      {/* Ponto na linha */}
                      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white shadow ${getEventColor(event.event_type)}`} />
                      
                      {/* Conteúdo */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{event.title}</h4>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                            {format(new Date(event.event_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                          
                          {(event.importance === 'high' || event.importance === 'critical') && (
                            <Badge variant="destructive" className="text-xs">
                              {event.importance === 'critical' ? 'Crítico' : 'Importante'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">Nenhum evento registrado ainda</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB: Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>
                    Exames, laudos, receitas e outros documentos
                  </CardDescription>
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadMutation.isPending ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="w-10 h-10 text-blue-500" />
                        <div className="flex gap-2">
                          <button 
                            className="text-slate-500 hover:text-slate-700"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-slate-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-slate-900 mb-1 truncate">
                        {doc.title}
                      </h4>
                      
                      {doc.description && (
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {doc.document_type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(doc.uploaded_at), 'dd/MM/yy', { locale: ptBR })}
                        </span>
                      </div>
                      
                      {doc.file_size && (
                        <p className="text-xs text-slate-400 mt-1">
                          {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Nenhum documento anexado ainda</p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Primeiro Documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB: Notas */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notas e Observações</CardTitle>
                  <CardDescription>
                    Anotações administrativas e clínicas
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  + Nova Nota
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notes && notes.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {notes.map((note) => (
                    <AccordionItem key={note.id} value={note.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium">
                            {note.title || 'Nota sem título'}
                          </span>
                          {note.is_important && (
                            <Badge variant="destructive" className="text-xs">Importante</Badge>
                          )}
                          {note.is_alert && (
                            <Badge variant="destructive" className="text-xs">Alerta</Badge>
                          )}
                          {note.is_pinned && (
                            <Badge variant="secondary" className="text-xs">Fixada</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                            <span>
                              {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {note.note_type}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Nenhuma nota registrada ainda</p>
                  <Button variant="outline">
                    + Adicionar Primeira Nota
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB: Clínico */}
        <TabsContent value="clinical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Métricas de Dor */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Dor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Dor Inicial</span>
                      <span className="font-semibold">{kpis?.avg_pain_before || 'N/A'}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(kpis?.avg_pain_before || 0) * 10}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Dor Atual</span>
                      <span className="font-semibold">{kpis?.avg_pain_after || 'N/A'}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(kpis?.avg_pain_after || 0) * 10}%` }}
                      />
                    </div>
                  </div>
                  
                  {kpis?.avg_pain_before && kpis?.avg_pain_after && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-slate-600">Melhora</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((kpis.avg_pain_before - kpis.avg_pain_after) / kpis.avg_pain_before * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Satisfação */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfação do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white mb-4">
                    <span className="text-4xl font-bold">
                      {kpis?.avg_satisfaction?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Média de Satisfação</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Baseado em {kpis?.completed_sessions || 0} sessões
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Condições */}
          {patient.conditions && patient.conditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Condições Clínicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.conditions.map((condition: any) => (
                    <div key={condition.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{condition.name}</h4>
                        <Badge variant={condition.status === 'active' ? 'default' : 'secondary'}>
                          {condition.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Diagnosticado em: {format(new Date(condition.diagnosisDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {condition.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function para cores dos eventos
function getEventColor(eventType: string): string {
  const colors: Record<string, string> = {
    registration: 'bg-blue-500',
    appointment_scheduled: 'bg-sky-500',
    appointment_completed: 'bg-green-500',
    appointment_cancelled: 'bg-yellow-500',
    no_show: 'bg-red-500',
    payment_received: 'bg-emerald-500',
    payment_overdue: 'bg-orange-500',
    document_uploaded: 'bg-purple-500',
    status_changed: 'bg-indigo-500',
    note_added: 'bg-pink-500',
    discharge: 'bg-slate-500',
  };
  
  return colors[eventType] || 'bg-slate-400';
}

export default PatientDetailsTabs;


"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Calendar, BarChart3, TrendingUp, User, Clock, Target, CheckCircle, AlertTriangle, Printer, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
export function ClinicalReportsGenerator() {
    const [patients, setPatients] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedReportType, setSelectedReportType] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [generatedReport, setGeneratedReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('generate');
    // Mock data - em produção viria do Supabase
    useEffect(() => {
        const mockPatients = [
            {
                id: '1',
                name: 'João Silva',
                birthDate: '1985-03-15',
                gender: 'M',
                lastVisit: new Date('2024-01-15'),
                status: 'active'
            },
            {
                id: '2',
                name: 'Maria Santos',
                birthDate: '1990-07-22',
                gender: 'F',
                lastVisit: new Date('2024-01-10'),
                status: 'discharged'
            }
        ];
        const mockDocuments = [
            {
                id: 'doc1',
                patientId: '1',
                type: 'initial_assessment',
                version: 1,
                content: {
                    chiefComplaint: 'Dor lombar há 3 semanas',
                    painLevel: 8,
                    diagnosis: 'Lombalgia aguda',
                    treatmentPlan: 'Fisioterapia manual e exercícios'
                },
                isSigned: true,
                signedBy: 'Dr. Ana Costa',
                signedAt: new Date('2024-01-15'),
                createdBy: 'Dr. Ana Costa',
                createdAt: new Date('2024-01-15'),
                status: 'signed'
            },
            {
                id: 'doc2',
                patientId: '1',
                type: 'session_evolution',
                version: 1,
                content: {
                    subjectiveAssessment: 'Paciente relata melhora da dor',
                    painLevelBefore: 7,
                    painLevelAfter: 4,
                    techniquesApplied: ['Massagem', 'Alongamento']
                },
                isSigned: true,
                signedBy: 'Dr. Ana Costa',
                signedAt: new Date('2024-01-16'),
                createdBy: 'Dr. Ana Costa',
                createdAt: new Date('2024-01-16'),
                status: 'signed'
            },
            {
                id: 'doc3',
                patientId: '1',
                type: 'session_evolution',
                version: 1,
                content: {
                    subjectiveAssessment: 'Paciente continua melhorando',
                    painLevelBefore: 4,
                    painLevelAfter: 2,
                    techniquesApplied: ['Exercícios', 'Pilates']
                },
                isSigned: true,
                signedBy: 'Dr. Ana Costa',
                signedAt: new Date('2024-01-18'),
                createdBy: 'Dr. Ana Costa',
                createdAt: new Date('2024-01-18'),
                status: 'signed'
            }
        ];
        setPatients(mockPatients);
        setDocuments(mockDocuments);
    }, []);
    const handleGenerateReport = async () => {
        if (!selectedPatient || !selectedReportType) {
            toast({
                title: "Dados Incompletos",
                description: "Selecione um paciente e o tipo de relatório.",
                variant: "destructive"
            });
            return;
        }
        setIsGenerating(true);
        try {
            // Simular geração de relatório
            await new Promise(resolve => setTimeout(resolve, 2000));
            const patientDocuments = documents.filter(doc => doc.patientId === selectedPatient.id);
            const initialAssessment = patientDocuments.find(doc => doc.type === 'initial_assessment') || null;
            const sessionEvolutions = patientDocuments.filter(doc => doc.type === 'session_evolution');
            if (selectedReportType === 'progress') {
                const progressReport = {
                    patient: selectedPatient,
                    initialAssessment,
                    sessionEvolutions,
                    painEvolution: {
                        summary: 'Redução significativa da dor de 8/10 para 2/10',
                        details: [
                            { date: '2024-01-15', pain: 8 },
                            { date: '2024-01-16', pain: 4 },
                            { date: '2024-01-18', pain: 2 }
                        ]
                    },
                    functionalProgress: {
                        summary: 'Melhora progressiva da funcionalidade e mobilidade',
                        totalSessions: sessionEvolutions.length
                    },
                    treatmentCompliance: {
                        summary: 'Paciente aderiu bem ao tratamento e exercícios domiciliares',
                        rate: 95
                    },
                    recommendations: 'Continuar com o plano de tratamento atual, focando em fortalecimento muscular',
                    generatedAt: new Date()
                };
                setGeneratedReport(progressReport);
            }
            else if (selectedReportType === 'discharge') {
                const dischargeReport = {
                    patient: selectedPatient,
                    treatmentSummary: 'Tratamento de lombalgia aguda com 3 sessões de fisioterapia',
                    outcomeMeasures: {
                        initialPain: 8,
                        finalPain: 2,
                        painImprovement: 6
                    },
                    finalRecommendations: 'Manter exercícios de fortalecimento e alongamento em casa',
                    followUpPlan: 'Retorno em 30 dias para reavaliação',
                    generatedAt: new Date()
                };
                setGeneratedReport(dischargeReport);
            }
            toast({
                title: "Relatório Gerado!",
                description: "O relatório clínico foi gerado com sucesso.",
            });
            setActiveTab('view');
        }
        catch (error) {
            toast({
                title: "Erro na Geração",
                description: "Não foi possível gerar o relatório. Tente novamente.",
                variant: "destructive"
            });
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleExportReport = async (format) => {
        if (!generatedReport) {
            toast({
                title: "Erro",
                description: "Nenhum relatório gerado para exportar.",
                variant: "destructive"
            });
            return;
        }
        try {
            toast({
                title: "Exportando Relatório",
                description: `Exportando relatório em formato ${format.toUpperCase()}...`,
            });
            // Generate content based on format
            let content;
            let fileName;
            let mimeType;
            switch (format) {
                case 'pdf':
                    // Use the simple PDF service for PDF generation
                    const { SimplePDFService } = await import('../../services/simplePdfService');
                    await SimplePDFService.generateClinicalReportPDF(generatedReport);
                    return;
                case 'docx':
                    content = generateDocxFromReport(generatedReport);
                    fileName = `relatorio_clinico_${generatedReport.id}_${new Date().toISOString().split('T')[0]}.docx`;
                    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
                case 'html':
                    content = generateHtmlFromReport(generatedReport);
                    fileName = `relatorio_clinico_${generatedReport.id}_${new Date().toISOString().split('T')[0]}.html`;
                    mimeType = 'text/html';
                    break;
                default:
                    throw new Error(`Formato ${format} não suportado`);
            }
            // Create and download file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Clean up
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
            toast({
                title: "Sucesso",
                description: `Relatório exportado em ${format.toUpperCase()} com sucesso!`,
            });
        }
        catch (error) {
            console.error('Erro ao exportar relatório:', error);
            toast({
                title: "Erro na Exportação",
                description: "Não foi possível exportar o relatório. Tente novamente.",
                variant: "destructive"
            });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'discharged': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gerador de Relatórios Clínicos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gere relatórios de progresso e alta com base nos dados clínicos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
            <TabsTrigger value="view">Visualizar Relatório</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5"/>
                  Configurações do Relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="patient">Paciente</Label>
                    <Select value={selectedPatient?.id || ''} onValueChange={(value) => {
            const patient = patients.find(p => p.id === value);
            setSelectedPatient(patient || null);
        }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente"/>
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (<SelectItem key={patient.id} value={patient.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{patient.name}</span>
                              <Badge className={getStatusColor(patient.status)}>
                                {patient.status}
                              </Badge>
                            </div>
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reportType">Tipo de Relatório</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de relatório"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress">Relatório de Progresso</SelectItem>
                        <SelectItem value="discharge">Relatório de Alta</SelectItem>
                        <SelectItem value="summary">Resumo Clínico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input id="startDate" type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}/>
                  </div>

                  <div>
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input id="endDate" type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}/>
                  </div>
                </div>

                <Button onClick={handleGenerateReport} disabled={isGenerating || !selectedPatient || !selectedReportType} className="w-full">
                  {isGenerating ? (<>
                      <Clock className="h-4 w-4 mr-2 animate-spin"/>
                      Gerando Relatório...
                    </>) : (<>
                      <BarChart3 className="h-4 w-4 mr-2"/>
                      Gerar Relatório
                    </>)}
                </Button>
              </CardContent>
            </Card>

            {selectedPatient && (<Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5"/>
                    Informações do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Nome</h3>
                      <p className="text-gray-600">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Data de Nascimento</h3>
                      <p className="text-gray-600">
                        {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sexo</h3>
                      <p className="text-gray-600">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Última Visita</h3>
                      <p className="text-gray-600">
                        {selectedPatient.lastVisit.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            {generatedReport ? (<>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Relatório Gerado</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExportReport('pdf')}>
                      <Download className="h-4 w-4 mr-2"/>
                      PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExportReport('docx')}>
                      <Download className="h-4 w-4 mr-2"/>
                      DOCX
                    </Button>
                    <Button variant="outline" onClick={() => handleExportReport('html')}>
                      <Download className="h-4 w-4 mr-2"/>
                      HTML
                    </Button>
                    <Button variant="outline">
                      <Printer className="h-4 w-4 mr-2"/>
                      Imprimir
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2"/>
                      Compartilhar
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">
                      {selectedReportType === 'progress' ? 'Relatório de Progresso' : 'Relatório de Alta'}
                    </CardTitle>
                    <div className="text-center text-sm text-gray-600">
                      Gerado em {generatedReport.generatedAt.toLocaleDateString('pt-BR')} às {generatedReport.generatedAt.toLocaleTimeString('pt-BR')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-6">
                        {/* Informações do Paciente */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <User className="h-5 w-5"/>
                            Informações do Paciente
                          </h3>
                          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p><strong>Nome:</strong> {generatedReport.patient.name}</p>
                              <p><strong>Data de Nascimento:</strong> {new Date(generatedReport.patient.birthDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                              <p><strong>Sexo:</strong> {generatedReport.patient.gender}</p>
                              <p><strong>Status:</strong> {generatedReport.patient.status}</p>
                            </div>
                          </div>
                        </div>

                        {selectedReportType === 'progress' && generatedReport.painEvolution && (<>
                            {/* Evolução da Dor */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5"/>
                                Evolução da Dor
                              </h3>
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="mb-2">{generatedReport.painEvolution.summary}</p>
                                <div className="space-y-1">
                                  {generatedReport.painEvolution.details.map((detail, index) => (<div key={index} className="flex justify-between text-sm">
                                      <span>{new Date(detail.date).toLocaleDateString('pt-BR')}</span>
                                      <span>Dor: {detail.pain}/10</span>
                                    </div>))}
                                </div>
                              </div>
                            </div>

                            {/* Progresso Funcional */}
                            {generatedReport.functionalProgress && (<div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                  <Target className="h-5 w-5"/>
                                  Progresso Funcional
                                </h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <p className="mb-2">{generatedReport.functionalProgress.summary}</p>
                                  <p className="text-sm">Total de sessões: {generatedReport.functionalProgress.totalSessions}</p>
                                </div>
                              </div>)}

                            {/* Adesão ao Tratamento */}
                            {generatedReport.treatmentCompliance && (<div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5"/>
                                  Adesão ao Tratamento
                                </h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <p className="mb-2">{generatedReport.treatmentCompliance.summary}</p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${generatedReport.treatmentCompliance.rate}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium">{generatedReport.treatmentCompliance.rate}%</span>
                                  </div>
                                </div>
                              </div>)}
                          </>)}

                        {selectedReportType === 'discharge' && generatedReport.treatmentSummary && (<>
                            {/* Resumo do Tratamento */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5"/>
                                Resumo do Tratamento
                              </h3>
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p>{generatedReport.treatmentSummary}</p>
                              </div>
                            </div>

                            {/* Medidas de Resultado */}
                            {generatedReport.outcomeMeasures && (<div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                  <BarChart3 className="h-5 w-5"/>
                                  Medidas de Resultado
                                </h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                      <p className="text-sm text-gray-600">Dor Inicial</p>
                                      <p className="text-2xl font-bold text-red-600">{generatedReport.outcomeMeasures.initialPain}/10</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Dor Final</p>
                                      <p className="text-2xl font-bold text-green-600">{generatedReport.outcomeMeasures.finalPain}/10</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Melhora</p>
                                      <p className="text-2xl font-bold text-blue-600">{generatedReport.outcomeMeasures.painImprovement}/10</p>
                                    </div>
                                  </div>
                                </div>
                              </div>)}
                          </>)}

                        {/* Recomendações */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5"/>
                            Recomendações
                          </h3>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p>{selectedReportType === 'progress' ? generatedReport.recommendations : generatedReport.finalRecommendations}</p>
                          </div>
                        </div>

                        {selectedReportType === 'discharge' && (<div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Calendar className="h-5 w-5"/>
                              Plano de Acompanhamento
                            </h3>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p>{generatedReport.followUpPlan}</p>
                            </div>
                          </div>)}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>) : (<Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                  <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                    Nenhum Relatório Gerado
                  </h2>
                  <p className="text-gray-500">
                    Gere um relatório clínico para visualizá-lo aqui
                  </p>
                </CardContent>
              </Card>)}
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}
// Helper functions for export
async function generatePDFFromReport(report) {
    try {
        // Use jsPDF directly for a more reliable solution
        const jsPDF = (await import('jspdf')).jsPDF;
        const doc = new jsPDF();
        // Set font and add title
        doc.setFontSize(20);
        doc.text(report.title || 'Relatório Clínico', 20, 30);
        // Add patient info
        doc.setFontSize(12);
        doc.text(`Paciente: ${report.patientName || 'N/A'}`, 20, 45);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 55);
        // Add summary section
        doc.setFontSize(16);
        doc.text('Resumo do Tratamento', 20, 75);
        doc.setFontSize(10);
        const summaryText = report.summary || 'Resumo não disponível';
        const splitSummary = doc.splitTextToSize(summaryText, 170);
        doc.text(splitSummary, 20, 90);
        // Add clinical progress
        let yPosition = 110;
        doc.setFontSize(16);
        doc.text('Progresso Clínico', 20, yPosition);
        doc.setFontSize(10);
        yPosition += 15;
        const progressText = report.clinicalProgress || 'Progresso não documentado';
        const splitProgress = doc.splitTextToSize(progressText, 170);
        doc.text(splitProgress, 20, yPosition);
        // Add outcome measures if available
        if (report.outcomeMeasures) {
            yPosition += splitProgress.length * 5 + 20;
            doc.setFontSize(16);
            doc.text('Medidas de Resultado', 20, yPosition);
            doc.setFontSize(10);
            yPosition += 15;
            doc.text(`Dor Inicial: ${report.outcomeMeasures.painInitial || 'N/A'}`, 20, yPosition);
            doc.text(`Dor Atual: ${report.outcomeMeasures.painCurrent || 'N/A'}`, 20, yPosition + 10);
            doc.text(`Funcionalidade: ${report.outcomeMeasures.functionality || 'N/A'}`, 20, yPosition + 20);
        }
        // Add recommendations if available
        if (report.recommendations) {
            yPosition += 50;
            doc.setFontSize(16);
            doc.text('Recomendações', 20, yPosition);
            doc.setFontSize(10);
            yPosition += 15;
            const recText = doc.splitTextToSize(report.recommendations, 170);
            doc.text(recText, 20, yPosition);
        }
        // Add footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.text('Relatório gerado automaticamente pelo sistema DuduFisio-AI', 20, pageHeight - 20);
        doc.text(`ID do Relatório: ${report.id}`, 20, pageHeight - 10);
        // Generate blob and convert to base64
        const pdfBlob = doc.output('blob');
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(pdfBlob);
        });
    }
    catch (error) {
        console.error('Erro ao gerar PDF:', error);
        // Fallback: create a simple text content
        const fallbackContent = `
RELATÓRIO CLÍNICO
Paciente: ${report.patientName || 'N/A'}
Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO DO TRATAMENTO:
${report.summary || 'Resumo não disponível'}

PROGRESSO CLÍNICO:
${report.clinicalProgress || 'Progresso não documentado'}

MEDIDAS DE RESULTADO:
${report.outcomeMeasures ? `
- Dor Inicial: ${report.outcomeMeasures.painInitial || 'N/A'}
- Dor Atual: ${report.outcomeMeasures.painCurrent || 'N/A'}
- Funcionalidade: ${report.outcomeMeasures.functionality || 'N/A'}
` : 'Não disponível'}

RECOMENDAÇÕES:
${report.recommendations || 'Não disponível'}

ID do Relatório: ${report.id}
Gerado pelo sistema DuduFisio-AI
    `;
        return `data:text/plain;base64,${btoa(fallbackContent)}`;
    }
}
function generateDocxFromReport(report) {
    // Simple HTML-like content for DOCX (in a real implementation, you'd use a proper DOCX library)
    return generateHtmlFromReport(report);
}
function generateHtmlFromReport(report) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .section h2 { color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
        .section h3 { color: #34495e; margin-top: 15px; }
        .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${report.title}</h1>
        <p>Paciente: ${report.patientName}</p>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="section">
        <h2>Resumo do Tratamento</h2>
        <p>${report.summary || 'Resumo do tratamento não disponível.'}</p>
      </div>
      
      <div class="section">
        <h2>Progresso Clínico</h2>
        <p>${report.clinicalProgress || 'Progresso clínico não documentado.'}</p>
      </div>
      
      ${report.outcomeMeasures ? `
        <div class="section">
          <h2>Medidas de Resultado</h2>
          <div class="metric">
            <strong>Dor Inicial:</strong> ${report.outcomeMeasures.painInitial || 'N/A'}
          </div>
          <div class="metric">
            <strong>Dor Atual:</strong> ${report.outcomeMeasures.painCurrent || 'N/A'}
          </div>
          <div class="metric">
            <strong>Funcionalidade:</strong> ${report.outcomeMeasures.functionality || 'N/A'}
          </div>
        </div>
      ` : ''}
      
      ${report.recommendations ? `
        <div class="section">
          <h2>Recomendações</h2>
          <p>${report.recommendations}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Relatório gerado automaticamente pelo sistema DuduFisio-AI</p>
        <p>ID do Relatório: ${report.id}</p>
      </div>
    </body>
    </html>
  `;
}

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save, 
  X,
  FileText,
  Settings,
  Code
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ClinicalTemplate {
  id: string;
  name: string;
  type: string;
  specialty: string;
  templateSchema: any;
  defaultValues: any;
  validationRules: any;
  active: boolean;
  version: number;
  createdAt: Date;
  createdBy: string;
}

const DOCUMENT_TYPES = [
  { value: 'initial_assessment', label: 'Avaliação Inicial' },
  { value: 'session_evolution', label: 'Evolução de Sessão' },
  { value: 'treatment_plan', label: 'Plano de Tratamento' },
  { value: 'discharge_summary', label: 'Relatório de Alta' },
  { value: 'referral_letter', label: 'Carta de Encaminhamento' },
  { value: 'progress_report', label: 'Relatório de Progresso' }
];

const SPECIALTIES = [
  { value: 'physiotherapy', label: 'Fisioterapia' },
  { value: 'occupational_therapy', label: 'Terapia Ocupacional' },
  { value: 'speech_therapy', label: 'Fonoaudiologia' },
  { value: 'sports_physiotherapy', label: 'Fisioterapia Esportiva' },
  { value: 'neurological_physiotherapy', label: 'Fisioterapia Neurológica' },
  { value: 'orthopedic_physiotherapy', label: 'Fisioterapia Ortopédica' },
  { value: 'respiratory_physiotherapy', label: 'Fisioterapia Respiratória' },
  { value: 'pediatric_physiotherapy', label: 'Fisioterapia Pediátrica' }
];

export function ClinicalTemplatesManager() {
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ClinicalTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specialty: '',
    templateSchema: '{}',
    defaultValues: '{}',
    validationRules: '{}',
    active: true
  });

  // Mock data - em produção viria do Supabase
  useEffect(() => {
    const mockTemplates: ClinicalTemplate[] = [
      {
        id: '1',
        name: 'Avaliação Inicial - Fisioterapia Ortopédica',
        type: 'initial_assessment',
        specialty: 'orthopedic_physiotherapy',
        templateSchema: {
          type: 'object',
          properties: {
            chiefComplaint: { type: 'string', title: 'Queixa Principal' },
            painLevel: { type: 'number', title: 'Nível de Dor (0-10)' },
            medicalHistory: { type: 'string', title: 'Histórico Médico' }
          },
          required: ['chiefComplaint', 'painLevel']
        },
        defaultValues: {
          painLevel: 0
        },
        validationRules: {
          painLevel: { min: 0, max: 10 }
        },
        active: true,
        version: 1,
        createdAt: new Date('2024-01-01'),
        createdBy: 'Dr. Ana Costa'
      },
      {
        id: '2',
        name: 'Evolução de Sessão - Fisioterapia',
        type: 'session_evolution',
        specialty: 'physiotherapy',
        templateSchema: {
          type: 'object',
          properties: {
            subjectiveAssessment: { type: 'string', title: 'Avaliação Subjetiva' },
            painLevelBefore: { type: 'number', title: 'Dor Antes (0-10)' },
            painLevelAfter: { type: 'number', title: 'Dor Depois (0-10)' },
            techniquesApplied: { type: 'array', title: 'Técnicas Aplicadas' }
          },
          required: ['subjectiveAssessment', 'techniquesApplied']
        },
        defaultValues: {
          painLevelBefore: 0,
          painLevelAfter: 0
        },
        validationRules: {
          painLevelBefore: { min: 0, max: 10 },
          painLevelAfter: { min: 0, max: 10 }
        },
        active: true,
        version: 1,
        createdAt: new Date('2024-01-01'),
        createdBy: 'Dr. Ana Costa'
      }
    ];

    setTemplates(mockTemplates);
  }, []);

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      type: '',
      specialty: '',
      templateSchema: '{}',
      defaultValues: '{}',
      validationRules: '{}',
      active: true
    });
    setActiveTab('form');
  };

  const handleEditTemplate = (template: ClinicalTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      name: template.name,
      type: template.type,
      specialty: template.specialty,
      templateSchema: JSON.stringify(template.templateSchema, null, 2),
      defaultValues: JSON.stringify(template.defaultValues, null, 2),
      validationRules: JSON.stringify(template.validationRules, null, 2),
      active: template.active
    });
    setActiveTab('form');
  };

  const handleSaveTemplate = () => {
    try {
      // Validar JSONs
      JSON.parse(formData.templateSchema);
      JSON.parse(formData.defaultValues);
      JSON.parse(formData.validationRules);

      const newTemplate: ClinicalTemplate = {
        id: selectedTemplate?.id || Date.now().toString(),
        name: formData.name,
        type: formData.type,
        specialty: formData.specialty,
        templateSchema: JSON.parse(formData.templateSchema),
        defaultValues: JSON.parse(formData.defaultValues),
        validationRules: JSON.parse(formData.validationRules),
        active: formData.active,
        version: selectedTemplate?.version || 1,
        createdAt: selectedTemplate?.createdAt || new Date(),
        createdBy: selectedTemplate?.createdBy || 'Current User'
      };

      if (isCreating) {
        setTemplates([...templates, newTemplate]);
        toast({
          title: "Template Criado!",
          description: "O template clínico foi criado com sucesso.",
        });
      } else {
        setTemplates(templates.map(t => t.id === newTemplate.id ? newTemplate : t));
        toast({
          title: "Template Atualizado!",
          description: "O template clínico foi atualizado com sucesso.",
        });
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedTemplate(null);
      setActiveTab('list');
    } catch (error) {
      toast({
        title: "Erro de Validação",
        description: "Verifique se os JSONs estão formatados corretamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: "Template Removido!",
      description: "O template clínico foi removido com sucesso.",
    });
  };

  const handleDuplicateTemplate = (template: ClinicalTemplate) => {
    const duplicatedTemplate: ClinicalTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      version: 1,
      createdAt: new Date()
    };
    setTemplates([...templates, duplicatedTemplate]);
    toast({
      title: "Template Duplicado!",
      description: "Uma cópia do template foi criada com sucesso.",
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getSpecialtyLabel = (specialty: string) => {
    return SPECIALTIES.find(s => s.value === specialty)?.label || specialty;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gerenciador de Templates Clínicos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie e gerencie templates dinâmicos para documentos clínicos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Templates</TabsTrigger>
            <TabsTrigger value="form">
              {isCreating ? 'Novo Template' : isEditing ? 'Editar Template' : 'Formulário'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Templates Disponíveis</h2>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {getDocumentTypeLabel(template.type)}
                          </Badge>
                          <Badge variant="outline">
                            {getSpecialtyLabel(template.specialty)}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {template.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Versão: {template.version}</p>
                      <p>Criado por: {template.createdBy}</p>
                      <p>Data: {template.createdAt.toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isCreating ? 'Criar Novo Template' : 'Editar Template'}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab('list')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Avaliação Inicial - Fisioterapia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Documento</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor="active">Template Ativo</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Schema do Template (JSON)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="templateSchema">Defina a estrutura do formulário</Label>
                <Textarea
                  id="templateSchema"
                  value={formData.templateSchema}
                  onChange={(e) => setFormData({ ...formData, templateSchema: e.target.value })}
                  placeholder='{"type": "object", "properties": {...}}'
                  rows={10}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores Padrão (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="defaultValues">Valores iniciais dos campos</Label>
                <Textarea
                  id="defaultValues"
                  value={formData.defaultValues}
                  onChange={(e) => setFormData({ ...formData, defaultValues: e.target.value })}
                  placeholder='{"painLevel": 0, "status": "active"}'
                  rows={6}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regras de Validação (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="validationRules">Regras de validação dos campos</Label>
                <Textarea
                  id="validationRules"
                  value={formData.validationRules}
                  onChange={(e) => setFormData({ ...formData, validationRules: e.target.value })}
                  placeholder='{"painLevel": {"min": 0, "max": 10}}'
                  rows={6}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Preview Modal */}
        {selectedTemplate && !isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Schema do Template:</h3>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(selectedTemplate.templateSchema, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Valores Padrão:</h3>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(selectedTemplate.defaultValues, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Regras de Validação:</h3>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(selectedTemplate.validationRules, null, 2)}
                      </pre>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


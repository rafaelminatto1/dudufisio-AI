import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePatient } from '../contexts/PatientContext';
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Phone,
  Heart,
  FileText,
  Calendar,
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { PersonalDataForm } from '../components/patients/forms/PersonalDataForm';
import { AddressForm } from '../components/patients/forms/AddressForm';
import { EmergencyContactForm } from '../components/patients/forms/EmergencyContactForm';
import { HealthForm } from '../components/patients/forms/HealthForm';
import { TreatmentForm } from '../components/patients/forms/TreatmentForm';
import { ObservationsForm } from '../components/patients/forms/ObservationsForm';
import type { Patient, PatientFormData } from '../types/patient';

// Schema de validação completo
const patientSchema = z.object({
  // Dados Pessoais
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  phone2: z.string().optional(),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional(),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'other']),
  occupation: z.string().optional(),
  
  // Endereço
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  
  // Contato de Emergência
  emergencyName: z.string().min(2, 'Nome do contato de emergência é obrigatório'),
  emergencyRelationship: z.string().min(2, 'Relacionamento é obrigatório'),
  emergencyPhone: z.string().min(10, 'Telefone de emergência inválido'),
  emergencyPhone2: z.string().optional(),
  emergencyEmail: z.string().email().optional().or(z.literal('')),
  
  // Informações de Saúde
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  height: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  currentMedications: z.string().optional(),
  previousSurgeries: z.string().optional(),
  familyHistory: z.string().optional(),
  smokingStatus: z.enum(['never', 'former', 'current']),
  alcoholConsumption: z.enum(['never', 'occasional', 'moderate', 'heavy']),
  physicalActivityLevel: z.enum(['sedentary', 'light', 'moderate', 'intense']),
  
  // Diagnóstico
  mainDiagnosis: z.string().optional(),
  conditions: z.string().optional(),
  referringDoctor: z.string().optional(),
  referringDoctorCRM: z.string().optional(),
  
  // Plano de Tratamento
  totalPlannedSessions: z.number().min(1).optional(),
  
  // Convênio
  insuranceType: z.enum(['none', 'private', 'public', 'both']),
  insuranceProvider: z.string().optional(),
  insurancePlanName: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceValidUntil: z.string().optional(),
  
  // Status e Observações
  status: z.enum(['Active', 'Inactive', 'Discharged', 'Suspended']),
  observations: z.string().optional(),
  internalNotes: z.string().optional(),
  
  // Consentimentos
  hasConsentForm: z.boolean(),
  hasDataPrivacyConsent: z.boolean(),
});

const PatientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewPatient = id === 'new';
  const { currentPatient, getPatient, createPatient, updatePatient, isLoading } = usePatient();

  // Carregar dados do paciente
  useEffect(() => {
    if (!isNewPatient && id) {
      getPatient(id);
    }
  }, [id, isNewPatient, getPatient]);

  // Dados mock para novo paciente
  const mockPatient: Patient = {
    id: id || '1',
    code: 'PAC-0001',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    phone2: '(11) 88888-8888',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '1985-03-15',
    age: 39,
    gender: 'male',
    maritalStatus: 'married',
    occupation: 'Engenheiro',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
    emergencyContact: {
      name: 'Maria Silva',
      relationship: 'Esposa',
      phone: '(11) 77777-7777',
      phone2: '(11) 66666-6666',
      email: 'maria.silva@email.com',
    },
    bloodType: 'O+',
    height: 175,
    weight: 80,
    bmi: 26.1,
    medicalHistory: {
      allergies: ['Dipirona', 'Penicilina'],
      chronicDiseases: ['Hipertensão'],
      previousSurgeries: ['Apendicectomia (2010)'],
      currentMedications: ['Losartana 50mg', 'Anlodipino 5mg'],
      familyHistory: ['Diabetes (pai)', 'Hipertensão (mãe)'],
      smokingStatus: 'former',
      alcoholConsumption: 'occasional',
      physicalActivityLevel: 'moderate',
      observations: 'Pratica corrida 3x por semana',
    },
    conditions: [
      {
        id: '1',
        name: 'Dor lombar crônica',
        diagnosisDate: '2024-01-10',
        severity: 'moderate',
        status: 'active',
        description: 'Dor lombar há 6 meses, irradiação para membro inferior direito',
        treatmentPlan: 'Fortalecimento core + alongamentos + analgesia',
      },
      {
        id: '2',
        name: 'Hérnia de disco L4-L5',
        diagnosisDate: '2024-01-15',
        severity: 'moderate',
        status: 'active',
        description: 'Confirmado por RM',
      },
    ],
    mainDiagnosis: 'Hérnia de disco L4-L5 com compressão radicular',
    referringDoctor: 'Dr. Carlos Medeiros',
    referringDoctorCRM: 'CRM 123456',
    status: 'Active',
    registrationDate: '2024-01-10',
    firstAppointmentDate: '2024-01-15',
    lastAppointmentDate: '2024-02-20',
    sessionProgress: {
      currentSession: 6,
      totalPlannedSessions: 20,
      completedSessions: 6,
      canceledSessions: 1,
      noShowSessions: 0,
      firstSessionDate: '2024-01-15',
      lastSessionDate: '2024-02-20',
      weeksInTreatment: 5,
      daysInTreatment: 36,
      averageSessionsPerWeek: 1.2,
      adherenceRate: 85.7,
      nextScheduledSession: '2024-02-27',
    },
    treatmentMetrics: {
      painLevel: {
        initial: 8,
        current: 4,
        improvement: 50,
      },
      mobility: {
        initial: 50,
        current: 75,
        improvement: 50,
      },
      functionality: {
        initial: 40,
        current: 70,
        improvement: 75,
      },
      satisfaction: 8,
      goals: [
        'Reduzir dor para nível 3 ou menos',
        'Retornar às atividades esportivas',
        'Melhorar mobilidade da coluna',
        'Fortalecer musculatura core',
      ],
      goalsAchieved: 2,
    },
    insurance: {
      type: 'private',
      provider: 'Unimed',
      planName: 'Unimed Premium',
      policyNumber: '123456789',
      validUntil: '2024-12-31',
      coveragePercentage: 80,
    },
    financialInfo: {
      totalSpent: 1200,
      totalPending: 400,
      totalPaid: 800,
      averageSessionCost: 200,
      lastPaymentDate: '2024-02-20',
      paymentMethod: 'credit_card',
      hasOutstandingBalance: true,
      outstandingBalance: 400,
    },
    hasConsentForm: true,
    hasDataPrivacyConsent: true,
    createdBy: 'admin',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-02-20T15:30:00Z',
    tags: ['hérnia', 'dor crônica', 'atleta'],
  };

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: isNewPatient ? {
      name: '',
      email: '',
      phone: '',
      phone2: '',
      cpf: '',
      rg: '',
      birthDate: '',
      gender: '',
      maritalStatus: '',
      occupation: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: '',
      height: 0,
      weight: 0,
      bloodType: '',
      allergies: '',
      medications: '',
      previousSurgeries: '',
      chronicDiseases: '',
      familyHistory: '',
      currentSymptoms: '',
      painLevel: 0,
      painLocation: '',
      painDuration: '',
      exerciseFrequency: '',
      smoking: '',
      alcohol: '',
      sleep: '',
      diagnosis: '',
      secondaryDiagnosis: '',
      treatmentPlan: '',
      goals: '',
      contraindications: '',
      specialInstructions: '',
      insuranceProvider: '',
      insuranceNumber: '',
      paymentMethod: '',
      totalValue: 0,
      paidValue: 0,
      pendingValue: 0,
      notes: '',
      internalNotes: '',
      nextAppointmentNotes: '',
      tags: '',
      category: '',
      priority: '',
      attachments: '',
      referralSource: '',
      previousTherapist: '',
      specialRequests: '',
      hasConsentForm: false,
      hasDataPrivacyConsent: false,
    } : {
      name: currentPatient?.name || mockPatient.name,
      email: mockPatient.email,
      phone: mockPatient.phone,
      phone2: mockPatient.phone2,
      cpf: mockPatient.cpf,
      rg: mockPatient.rg,
      birthDate: mockPatient.birthDate,
      gender: mockPatient.gender,
      maritalStatus: mockPatient.maritalStatus,
      occupation: mockPatient.occupation,
      street: mockPatient.address.street,
      number: mockPatient.address.number,
      complement: mockPatient.address.complement,
      neighborhood: mockPatient.address.neighborhood,
      city: mockPatient.address.city,
      state: mockPatient.address.state,
      zipCode: mockPatient.address.zipCode,
      emergencyName: mockPatient.emergencyContact.name,
      emergencyRelationship: mockPatient.emergencyContact.relationship,
      emergencyPhone: mockPatient.emergencyContact.phone,
      emergencyPhone2: mockPatient.emergencyContact.phone2,
      emergencyEmail: mockPatient.emergencyContact.email,
      bloodType: mockPatient.bloodType,
      height: mockPatient.height,
      weight: mockPatient.weight,
      allergies: mockPatient.medicalHistory.allergies.join(', '),
      chronicDiseases: mockPatient.medicalHistory.chronicDiseases.join(', '),
      currentMedications: mockPatient.medicalHistory.currentMedications.join(', '),
      previousSurgeries: mockPatient.medicalHistory.previousSurgeries.join(', '),
      familyHistory: mockPatient.medicalHistory.familyHistory.join(', '),
      smokingStatus: mockPatient.medicalHistory.smokingStatus,
      alcoholConsumption: mockPatient.medicalHistory.alcoholConsumption,
      physicalActivityLevel: mockPatient.medicalHistory.physicalActivityLevel,
      mainDiagnosis: mockPatient.mainDiagnosis,
      conditions: mockPatient.conditions.map(c => c.name).join(', '),
      referringDoctor: mockPatient.referringDoctor,
      referringDoctorCRM: mockPatient.referringDoctorCRM,
      totalPlannedSessions: mockPatient.sessionProgress.totalPlannedSessions,
      insuranceType: mockPatient.insurance.type,
      insuranceProvider: mockPatient.insurance.provider,
      insurancePlanName: mockPatient.insurance.planName,
      insurancePolicyNumber: mockPatient.insurance.policyNumber,
      insuranceValidUntil: mockPatient.insurance.validUntil,
      status: mockPatient.status,
      observations: mockPatient.observations,
      internalNotes: mockPatient.internalNotes,
      hasConsentForm: mockPatient.hasConsentForm,
      hasDataPrivacyConsent: mockPatient.hasDataPrivacyConsent,
    },
  });

  // Atualizar formulário quando o paciente carregar
  useEffect(() => {
    if (currentPatient && !isNewPatient) {
      form.reset({
        name: currentPatient.name,
        email: currentPatient.email,
        phone: currentPatient.phone,
        phone2: currentPatient.phone2 || '',
        cpf: currentPatient.cpf,
        rg: currentPatient.rg || '',
        birthDate: currentPatient.birthDate,
        gender: currentPatient.gender,
        maritalStatus: currentPatient.maritalStatus || '',
        occupation: currentPatient.profession || '',
        street: currentPatient.address?.street || '',
        number: currentPatient.address?.number || '',
        complement: currentPatient.address?.complement || '',
        neighborhood: currentPatient.address?.neighborhood || '',
        city: currentPatient.address?.city || '',
        state: currentPatient.address?.state || '',
        zipCode: currentPatient.address?.zipCode || '',
        emergencyName: currentPatient.emergencyContact?.name || '',
        emergencyPhone: currentPatient.emergencyContact?.phone || '',
        emergencyRelation: currentPatient.emergencyContact?.relationship || '',
        height: currentPatient.physicalData?.height || 0,
        weight: currentPatient.physicalData?.weight || 0,
        bloodType: currentPatient.physicalData?.bloodType || '',
        allergies: Array.isArray(currentPatient.physicalData?.allergies) 
          ? currentPatient.physicalData.allergies.join(', ') : '',
        medications: Array.isArray(currentPatient.physicalData?.medications)
          ? currentPatient.physicalData.medications.join(', ') : '',
        previousSurgeries: Array.isArray(currentPatient.medicalHistory?.previousSurgeries)
          ? currentPatient.medicalHistory.previousSurgeries.join(', ') : '',
        chronicDiseases: Array.isArray(currentPatient.medicalHistory?.chronicDiseases)
          ? currentPatient.medicalHistory.chronicDiseases.join(', ') : '',
        familyHistory: Array.isArray(currentPatient.medicalHistory?.familyHistory)
          ? currentPatient.medicalHistory.familyHistory.join(', ') : '',
        currentSymptoms: Array.isArray(currentPatient.medicalHistory?.currentSymptoms)
          ? currentPatient.medicalHistory.currentSymptoms.join(', ') : '',
        painLevel: 0,
        painLocation: '',
        painDuration: '',
        exerciseFrequency: '',
        smoking: '',
        alcohol: '',
        sleep: '',
        diagnosis: currentPatient.treatmentData?.diagnosis || '',
        secondaryDiagnosis: Array.isArray(currentPatient.treatmentData?.secondaryDiagnosis)
          ? currentPatient.treatmentData.secondaryDiagnosis.join(', ') : '',
        treatmentPlan: Array.isArray(currentPatient.treatmentData?.treatmentPlan)
          ? currentPatient.treatmentData.treatmentPlan.join(', ') : '',
        goals: Array.isArray(currentPatient.treatmentData?.goals)
          ? currentPatient.treatmentData.goals.join(', ') : '',
        contraindications: Array.isArray(currentPatient.treatmentData?.contraindications)
          ? currentPatient.treatmentData.contraindications.join(', ') : '',
        specialInstructions: '',
        insuranceProvider: currentPatient.financial?.insuranceProvider || '',
        insuranceNumber: currentPatient.financial?.insuranceNumber || '',
        paymentMethod: currentPatient.financial?.paymentMethod || '',
        totalValue: currentPatient.financial?.totalValue || 0,
        paidValue: currentPatient.financial?.paidValue || 0,
        pendingValue: currentPatient.financial?.pendingValue || 0,
        notes: currentPatient.notes || '',
        internalNotes: '',
        nextAppointmentNotes: '',
        tags: Array.isArray(currentPatient.tags) ? currentPatient.tags.join(', ') : '',
        category: '',
        priority: '',
        attachments: Array.isArray(currentPatient.attachments) 
          ? currentPatient.attachments.join(', ') : '',
        referralSource: '',
        previousTherapist: '',
        specialRequests: '',
        hasConsentForm: false,
        hasDataPrivacyConsent: false,
      });
    }
  }, [currentPatient, isNewPatient, form]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isNewPatient) {
        await createPatient({
          ...data,
          id: '', // Será gerado pelo contexto
          registrationDate: new Date().toISOString().split('T')[0],
          lastUpdate: new Date().toISOString().split('T')[0],
          status: 'Active',
        });
      } else {
        await updatePatient(id!, data);
      }
      navigate('/patients');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-yellow-100 text-yellow-800',
      Discharged: 'bg-slate-100 text-slate-800',
      Suspended: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patients')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isNewPatient ? 'Novo Paciente' : (currentPatient?.name || 'Carregando...')}
              </h1>
              {!isNewPatient && (
                <p className="text-slate-600 mt-1">
                  Código: {currentPatient?.id || 'N/A'} • Cadastrado em{' '}
                  {currentPatient?.registrationDate || 'N/A'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isNewPatient && (
              <Badge className={getStatusColor(currentPatient?.status || 'Active')}>
                {currentPatient?.status || 'Active'}
              </Badge>
            )}
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Progress Cards - Only show if not new */}
        {!isNewPatient && currentPatient && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-sky-500" />
                  Sessões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentPatient.sessionTracking?.completedSessions || 0}/{currentPatient.sessionTracking?.totalSessions || 0}
                </div>
                <Progress 
                  value={currentPatient.sessionTracking?.totalSessions ? 
                    ((currentPatient.sessionTracking.completedSessions || 0) / currentPatient.sessionTracking.totalSessions) * 100 : 0
                  } 
                  className="mt-2"
                />
                <p className="text-xs text-slate-600 mt-2">
                  {Math.floor(((currentPatient.sessionTracking?.completedSessions || 0) / 3))} semanas de tratamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Dor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{mockPatient.treatmentMetrics.painLevel.current}</span>
                  <span className="text-sm text-slate-600">/10</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600 font-medium">
                    -{mockPatient.treatmentMetrics.painLevel.improvement}%
                  </span>
                  <span className="text-xs text-slate-600 ml-2">desde o início</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-purple-500" />
                  Aderência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPatient.sessionProgress.adherenceRate}%
                </div>
                <Progress value={mockPatient.sessionProgress.adherenceRate} className="mt-2" />
                <p className="text-xs text-slate-600 mt-2">
                  {mockPatient.sessionProgress.completedSessions} sessões realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
                  Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {mockPatient.financialInfo.totalPaid.toFixed(2)}
                </div>
                {mockPatient.financialInfo.hasOutstandingBalance && (
                  <div className="flex items-center mt-2">
                    <AlertCircle className="w-3 h-3 text-orange-500 mr-1" />
                    <span className="text-xs text-orange-600">
                      Pendente: R$ {mockPatient.financialInfo.outstandingBalance}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form Tabs */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="personal">
                  <User className="w-4 h-4 mr-2" />
                  Pessoal
                </TabsTrigger>
                <TabsTrigger value="address">
                  <MapPin className="w-4 h-4 mr-2" />
                  Endereço
                </TabsTrigger>
                <TabsTrigger value="emergency">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergência
                </TabsTrigger>
                <TabsTrigger value="medical">
                  <Heart className="w-4 h-4 mr-2" />
                  Saúde
                </TabsTrigger>
                <TabsTrigger value="treatment">
                  <Activity className="w-4 h-4 mr-2" />
                  Tratamento
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="w-4 h-4 mr-2" />
                  Observações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <PersonalDataForm form={form} />
              </TabsContent>

              <TabsContent value="address" className="space-y-6">
                <AddressForm form={form} />
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6">
                <EmergencyContactForm form={form} />
              </TabsContent>

              <TabsContent value="health" className="space-y-6">
                <HealthForm form={form} />
              </TabsContent>

              <TabsContent value="treatment" className="space-y-6">
                <TreatmentForm form={form} />
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <ObservationsForm form={form} />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PatientEditPage;


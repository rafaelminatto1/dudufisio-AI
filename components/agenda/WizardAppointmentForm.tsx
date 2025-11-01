import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Appointment, Patient, Therapist } from '../../types';
import { ChevronRight, ChevronLeft, Check, Calendar, User, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface WizardAppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => Promise<boolean>;
  patients: Patient[];
  therapists: Therapist[];
  appointmentToEdit?: Appointment;
}

type WizardStep = 'patient' | 'datetime' | 'details' | 'confirm';

const steps: Array<{ id: WizardStep; label: string; icon: any }> = [
  { id: 'patient', label: 'Paciente', icon: User },
  { id: 'datetime', label: 'Data e Hora', icon: Calendar },
  { id: 'details', label: 'Detalhes', icon: FileText },
  { id: 'confirm', label: 'Confirmar', icon: Check },
];

const WizardAppointmentForm: React.FC<WizardAppointmentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  therapists,
  appointmentToEdit
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('patient');
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canGoNext = () => {
    // Validação por etapa
    switch (currentStep) {
      case 'patient':
        return !!formData.patientId;
      case 'datetime':
        return !!formData.startTime && !!formData.endTime && !!formData.therapistId;
      case 'details':
        return !!formData.type;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.startTime || !formData.endTime || !formData.therapistId || !formData.type) {
      return;
    }

    const appointment: Appointment = {
      id: appointmentToEdit?.id || `apt_${Date.now()}`,
      patientId: formData.patientId,
      patientName: patients.find(p => p.id === formData.patientId)?.name || '',
      patientAvatarUrl: patients.find(p => p.id === formData.patientId)?.avatarUrl || '',
      therapistId: formData.therapistId,
      startTime: formData.startTime,
      endTime: formData.endTime,
      title: formData.title || 'Consulta',
      type: formData.type,
      status: formData.status || 'scheduled',
      value: formData.value || 0,
      paymentStatus: formData.paymentStatus || 'pending',
      observations: formData.observations,
    };

    const success = await onSave(appointment);
    if (success) {
      onClose();
      setFormData({});
      setCurrentStep('patient');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do agendamento em etapas
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Etapa {currentStepIndex + 1} de {steps.length}
            </span>
            <span className="font-semibold text-blue-600">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-between py-4 border-y border-slate-200">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    isActive && "scale-110",
                    index > currentStepIndex && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isActive && !isCompleted && "bg-blue-600 text-white ring-4 ring-blue-100",
                    !isActive && !isCompleted && "bg-slate-200 text-slate-600"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    isActive && "text-blue-600 font-semibold",
                    !isActive && "text-slate-600"
                  )}>
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    index < currentStepIndex ? "bg-green-500" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'patient' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Selecione o Paciente</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-96 overflow-auto">
                    {patients.map(patient => (
                      <button
                        key={patient.id}
                        onClick={() => setFormData({ ...formData, patientId: patient.id })}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                          formData.patientId === patient.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="font-semibold">{patient.name}</div>
                        <div className="text-sm text-slate-600">{patient.phone}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'datetime' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Data, Hora e Terapeuta</h3>
                  <p className="text-sm text-slate-600">Configure quando será o atendimento</p>
                  {/* Implementação dos campos de data/hora */}
                  <div className="p-8 bg-slate-50 rounded-lg text-center text-slate-500">
                    Formulário de data/hora aqui
                  </div>
                </div>
              )}

              {currentStep === 'details' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Detalhes do Atendimento</h3>
                  <p className="text-sm text-slate-600">Tipo, valor e observações</p>
                  <div className="p-8 bg-slate-50 rounded-lg text-center text-slate-500">
                    Formulário de detalhes aqui
                  </div>
                </div>
              )}

              {currentStep === 'confirm' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Confirmar Agendamento</h3>
                  <div className="p-6 bg-slate-50 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Paciente:</span>
                      <span className="font-semibold">
                        {patients.find(p => p.id === formData.patientId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Terapeuta:</span>
                      <span className="font-semibold">
                        {therapists.find(t => t.id === formData.therapistId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tipo:</span>
                      <span className="font-semibold">{formData.type}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300 w-full justify-center py-2">
                    <Check className="w-4 h-4 mr-2" />
                    Tudo pronto para agendar!
                  </Badge>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            {currentStep === 'confirm' ? (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Confirmar Agendamento
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WizardAppointmentForm;


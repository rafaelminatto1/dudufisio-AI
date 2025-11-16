import React, { useState, useEffect } from 'react';
import { AlertCircle, UserPlus, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Patient } from '../../types';
import { useNavigate } from 'react-router-dom';

interface IncompleteRegistrationsCardProps {
  patients: Patient[];
  className?: string;
}

export const IncompleteRegistrationsCard: React.FC<IncompleteRegistrationsCardProps> = ({
  patients,
  className,
}) => {
  const [incompletePatients, setIncompletePatients] = useState<Patient[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Filtrar pacientes com cadastros incompletos
    const incomplete = patients.filter(patient => {
      // Considerar incompleto se telefone ou email começam com "temp_"
      const hasTemporaryPhone = patient.phone?.startsWith('temp_');
      const hasTemporaryEmail = patient.email?.startsWith('temp_');
      const noCPF = !patient.cpf || patient.cpf.startsWith('TEMP-');
      const noBirthDate = !patient.birthDate;

      return hasTemporaryPhone || hasTemporaryEmail || noCPF || noBirthDate;
    });

    setIncompletePatients(incomplete);
  }, [patients]);

  const handleCompleteRegistration = (patientId: string) => {
    navigate(`/patients/${patientId}/edit`);
  };

  const handleSendForm = (patientId: string) => {
    // TODO: Implementar envio de formulário
    console.log('Enviando formulário para paciente:', patientId);
  };

  if (incompletePatients.length === 0 || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn('relative', className)}
      >
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          {/* Botão de Fechar */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-1">
                  Cadastros Incompletos
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {incompletePatients.length} {incompletePatients.length === 1 ? 'paciente precisa' : 'pacientes precisam'} completar o cadastro
                </p>
              </div>
            </div>

            {/* Lista de Pacientes */}
            <div className="space-y-3">
              {incompletePatients.slice(0, 2).map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-800/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cadastrado em {new Date(patient.registrationDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteRegistration(patient.id)}
                      className="text-xs"
                    >
                      Completar
                    </Button>
                    {/* <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSendForm(patient.id)}
                      className="text-xs"
                      title="Enviar formulário para o paciente"
                    >
                      <UserPlus className="w-3 h-3" />
                    </Button> */}
                  </div>
                </motion.div>
              ))}

              {incompletePatients.length > 2 && (
                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/patients?filter=incomplete')}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                  >
                    Ver todos os {incompletePatients.length} cadastros incompletos
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

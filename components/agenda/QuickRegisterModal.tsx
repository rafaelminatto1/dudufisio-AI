import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface QuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone?: string) => Promise<void>;
  initialName: string;
}

export const QuickRegisterModal: React.FC<QuickRegisterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialName,
}) => {
  const [step, setStep] = useState<'confirm' | 'form'>('confirm');
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(name.trim(), phone.trim() || undefined);
      onClose();
      // Reset state
      setStep('confirm');
      setName(initialName);
      setPhone('');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setName(initialName);
    setPhone('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
            {/* Confirmation Step */}
            {step === 'confirm' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Cadastrar Novo Paciente?
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Nenhum paciente foi encontrado com o nome:
                  </p>
                  <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {initialName}
                    </p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-4">
                    Deseja criar um cadastro rápido para este paciente?
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Sim, Cadastrar
                  </Button>
                </div>
              </div>
            )}

            {/* Form Step */}
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Cadastro Rápido de Paciente
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Crie um cadastro básico agora e complete as informações depois.
                </p>

                {/* Warning Box */}
                <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                        Cadastro Incompleto
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Este paciente será marcado como "cadastro incompleto" e você receberá lembretes para completar os dados.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="patient-name" className="text-slate-700 dark:text-slate-300">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="patient-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite o nome completo"
                      className="mt-1"
                      required
                      minLength={3}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="patient-phone" className="text-slate-700 dark:text-slate-300">
                      Telefone (Opcional)
                    </Label>
                    <Input
                      id="patient-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Você pode adicionar o telefone depois
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || name.trim().length < 3}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="mr-2"
                        >
                          <UserPlus className="w-4 h-4" />
                        </motion.div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Criar Paciente
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

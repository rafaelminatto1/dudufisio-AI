/**
 * SaveBlockingDialog - Diálogo de bloqueio de salvamento
 * Nível B: Bloqueia o salvamento se medições obrigatórias não foram feitas
 */

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface PendingTest {
  id: string;
  testName: string;
  testType: string;
  frequencyType: string;
  notes?: string;
}

interface SaveBlockingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAnyway: () => void;
  onCancel: () => void;
  pendingTests: PendingTest[];
}

export const SaveBlockingDialog: React.FC<SaveBlockingDialogProps> = ({
  isOpen,
  onClose,
  onSaveAnyway,
  onCancel,
  pendingTests
}) => {
  const [showConfirmSaveAnyway, setShowConfirmSaveAnyway] = useState(false);

  const handleSaveAnyway = () => {
    setShowConfirmSaveAnyway(true);
  };

  const handleConfirmSaveAnyway = () => {
    onSaveAnyway();
    setShowConfirmSaveAnyway(false);
    onClose();
  };

  if (showConfirmSaveAnyway) {
    return (
      <AlertDialog open={showConfirmSaveAnyway}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Salvamento sem Medições
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-700">
              Você está prestes a salvar esta sessão sem registrar as medições obrigatórias.
              <br /><br />
              <strong>Isso pode:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Comprometer o acompanhamento do protocolo de tratamento</li>
                <li>Dificultar a análise da evolução do paciente</li>
                <li>Gerar não conformidade com o plano de cuidados</li>
              </ul>
              <br />
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmSaveAnyway(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSaveAnyway}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Salvar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="w-6 h-6" />
            Medições Obrigatórias Pendentes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-700">
            Você não pode salvar esta sessão sem registrar as medições obrigatórias configuradas para este paciente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Testes Obrigatórios Não Realizados ({pendingTests.length})
            </h4>
            
            <div className="space-y-2">
              {pendingTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900">{test.testName}</span>
                      {test.frequencyType === 'every_session' && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatória
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Tipo: {test.testType}
                      {test.notes && (
                        <span className="ml-2">• {test.notes}</span>
                      )}
                    </div>
                  </div>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-700 mt-0.5" />
                <div className="text-xs text-yellow-900">
                  <strong>Sugestão:</strong> Registre as medições obrigatórias antes de salvar a sessão.
                  Isso garante a qualidade do acompanhamento e conformidade com o protocolo de tratamento.
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSaveAnyway}
            className="bg-red-600 hover:bg-red-700"
          >
            Salvar Mesmo Assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveBlockingDialog;


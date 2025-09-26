import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { SoapNote } from '../../types';
import RichTextEditor from '../ui/RichTextEditor';

interface RepeatConductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (noteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => void;
  previousNote: SoapNote;
  patientName: string;
}

interface RepeatConductData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const RepeatConductModal: React.FC<RepeatConductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  previousNote,
  patientName
}) => {
  const [conductData, setConductData] = useState<RepeatConductData>({
    subjective: previousNote.subjective,
    objective: previousNote.objective,
    assessment: previousNote.assessment,
    plan: previousNote.plan
  });

  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set());

  const handleFieldChange = (field: keyof RepeatConductData, value: string) => {
    setConductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopyField = (field: keyof RepeatConductData) => {
    const fieldValue = previousNote[field];
    handleFieldChange(field, fieldValue);
    setCopiedFields(prev => new Set(prev).add(field));
    
    // Remove o indicador de copiado após 2 segundos
    setTimeout(() => {
      setCopiedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }, 2000);
  };

  const handleConfirm = () => {
    onConfirm({
      ...conductData,
      date: new Date().toISOString().split('T')[0],
      sessionNumber: (previousNote.sessionNumber || 1) + 1,
      therapist: 'Fisioterapeuta', // Implementar com usuário atual
      painScale: undefined // Sempre começar com escala de dor vazia
    });
    onClose();
  };

  const CopyButton: React.FC<{ field: keyof RepeatConductData; label: string }> = ({ field, label }) => (
    <button
      type="button"
      onClick={() => handleCopyField(field)}
      className={`flex items-center px-3 py-1 text-xs rounded-lg transition-colors ${
        copiedFields.has(field)
          ? 'bg-green-100 text-green-700'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
    >
      {copiedFields.has(field) ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          {label}
        </>
      )}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Repetir Conduta</h2>
            <p className="text-sm text-slate-600 mt-1">
              Copiando dados da sessão #{previousNote.sessionNumber} de {patientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </header>

        {/* Warning */}
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Atenção</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Você está copiando os dados da última sessão. Revise e ajuste conforme necessário 
                antes de confirmar a nova sessão.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subjetivo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    S
                  </span>
                  Subjetivo
                </h3>
                <CopyButton field="subjective" label="Copiar" />
              </div>
              <RichTextEditor
                value={conductData.subjective}
                onChange={(value) => handleFieldChange('subjective', value)}
                placeholder="Descreva as queixas e relatos do paciente..."
                className="min-h-32"
              />
            </div>

            {/* Objetivo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    O
                  </span>
                  Objetivo
                </h3>
                <CopyButton field="objective" label="Copiar" />
              </div>
              <RichTextEditor
                value={conductData.objective}
                onChange={(value) => handleFieldChange('objective', value)}
                placeholder="Descreva os achados objetivos da avaliação..."
                className="min-h-32"
              />
            </div>

            {/* Avaliação */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    A
                  </span>
                  Avaliação
                </h3>
                <CopyButton field="assessment" label="Copiar" />
              </div>
              <RichTextEditor
                value={conductData.assessment}
                onChange={(value) => handleFieldChange('assessment', value)}
                placeholder="Descreva sua avaliação clínica..."
                className="min-h-32"
              />
            </div>

            {/* Plano */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    P
                  </span>
                  Plano
                </h3>
                <CopyButton field="plan" label="Copiar" />
              </div>
              <RichTextEditor
                value={conductData.plan}
                onChange={(value) => handleFieldChange('plan', value)}
                placeholder="Descreva o plano de tratamento..."
                className="min-h-32"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-3">Ações Rápidas</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleCopyField('subjective');
                  handleCopyField('objective');
                  handleCopyField('assessment');
                  handleCopyField('plan');
                }}
                className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Tudo
              </button>
              <button
                onClick={() => {
                  setConductData({
                    subjective: '',
                    objective: '',
                    assessment: '',
                    plan: ''
                  });
                }}
                className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Tudo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar Nova Sessão
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RepeatConductModal;

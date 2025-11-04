// components/atendimento/layout/AtendimentoSidebar.tsx
import React from 'react';
import { Repeat, BrainCircuit, Camera, Paperclip, ChevronLeft, Clock, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AtendimentoSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRepeatConduct?: () => void;
  onGenerateAI?: () => void;
  onTakePhoto?: () => void;
  onAddAttachment?: () => void;
  sessionCount?: number;
  treatmentDays?: number;
}

export const AtendimentoSidebar: React.FC<AtendimentoSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onRepeatConduct,
  onGenerateAI,
  onTakePhoto,
  onAddAttachment,
  sessionCount = 0,
  treatmentDays = 0,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        // Estado Colapsado
        <motion.div
          key="collapsed"
          initial={{ width: 0 }}
          animate={{ width: '48px' }}
          exit={{ width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 bg-white border-r border-slate-200 overflow-hidden"
        >
          <div className="flex flex-col items-center py-4 gap-4">
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Expandir sidebar"
              title="Expandir sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 rotate-180" />
            </button>

            {/* Ícones compactos */}
            <div className="w-8 h-px bg-slate-200" />

            <button
              onClick={onRepeatConduct}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
              aria-label="Repetir conduta"
              title="Repetir conduta (Ctrl+R)"
            >
              <Repeat className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={onGenerateAI}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
              aria-label="Sugestão IA"
              title="Sugestão IA (Ctrl+G)"
            >
              <BrainCircuit className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </button>

            <button
              onClick={onTakePhoto}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
              aria-label="Tirar foto"
              title="Tirar foto"
            >
              <Camera className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
            </button>

            <button
              onClick={onAddAttachment}
              className="p-2 hover:bg-amber-50 rounded-lg transition-colors group"
              aria-label="Adicionar anexo"
              title="Adicionar anexo"
            >
              <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
            </button>
          </div>
        </motion.div>
      ) : (
        // Estado Expandido
        <motion.div
          key="expanded"
          initial={{ width: 0 }}
          animate={{ width: '240px' }}
          exit={{ width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 bg-white border-r border-slate-200 overflow-hidden"
        >
          <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Ações Rápidas</h3>
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Colapsar sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2 mb-6">
              <button
                onClick={onRepeatConduct}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
              >
                <Repeat className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span className="flex-1 text-left">Repetir Conduta</span>
                <kbd className="hidden group-hover:block text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  Ctrl+R
                </kbd>
              </button>

              <button
                onClick={onGenerateAI}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors group"
              >
                <BrainCircuit className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                <span className="flex-1 text-left">Sugestão IA</span>
                <kbd className="hidden group-hover:block text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  Ctrl+G
                </kbd>
              </button>

              <button
                onClick={onTakePhoto}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors group"
              >
                <Camera className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                <span className="flex-1 text-left">Tirar Foto</span>
              </button>

              <button
                onClick={onAddAttachment}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors group"
              >
                <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                <span className="flex-1 text-left">Adicionar Anexo</span>
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-4" />

            {/* Resumo da Sessão */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Resumo</h4>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{sessionCount} sessões</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{treatmentDays} dias trat.</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Em progresso</span>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Dica de Atalhos */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-1">💡 Dica</p>
              <p className="text-xs text-blue-600">
                Use <kbd className="bg-white px-1 py-0.5 rounded text-[10px] border border-blue-300">Ctrl+1-4</kbd> para navegar entre tabs
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

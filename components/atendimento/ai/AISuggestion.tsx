// components/atendimento/ai/AISuggestion.tsx
import React, { useState } from 'react';
import { Check, Edit, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISuggestionProps {
  title: string;
  content: string;
  isLoading?: boolean;
  onApply?: (content: string) => void;
  onDiscard?: () => void;
  fieldColor?: string;
}

export const AISuggestion: React.FC<AISuggestionProps> = ({
  title,
  content,
  isLoading = false,
  onApply,
  onDiscard,
  fieldColor = 'blue',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleApply = () => {
    if (isEditing) {
      onApply?.(editedContent);
      setIsEditing(false);
    } else {
      onApply?.(content);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${colorClasses[fieldColor as keyof typeof colorClasses] || colorClasses.blue}`}>
        <div className="flex items-center gap-2 mb-3">
          <Loader className="w-4 h-4 animate-spin text-slate-600" />
          <h4 className="font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border ${colorClasses[fieldColor as keyof typeof colorClasses] || colorClasses.blue}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-2xl ${iconColorClasses[fieldColor as keyof typeof iconColorClasses] || iconColorClasses.blue}`}>💡</span>
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={8}
              autoFocus
            />
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-slate-700 whitespace-pre-wrap mb-4"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        {isEditing ? (
          <>
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Aplicar Editado
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Aplicar
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar e Aplicar
            </button>
            <button
              onClick={onDiscard}
              className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              title="Descartar sugestão"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

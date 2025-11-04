/**
 * EmptyState Component - DuduFisio-AI
 * 
 * Componente reutilizável para estados vazios
 * quando não há dados para exibir.
 * 
 * ♿ Acessibilidade:
 * - role="status" para informar estado vazio
 * - aria-label descritivo
 * - Botões com foco gerenciável
 */

import React, { memo } from 'react';
import { Plus, Search, Calendar, Users, FileText, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  /** Ícone a ser exibido */
  icon?: React.ReactNode;
  /** Título do estado vazio */
  title: string;
  /** Descrição do estado vazio */
  description?: string;
  /** Texto do botão de ação */
  actionText?: string;
  /** Função chamada ao clicar no botão */
  onAction?: () => void;
  /** Tipo de estado vazio para ícone padrão */
  type?: 'default' | 'search' | 'calendar' | 'users' | 'documents' | 'alerts';
  /** Classe CSS adicional */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  icon,
  title,
  description,
  actionText,
  onAction,
  type = 'default',
  className = ''
}) => {
  // Ícones padrão por tipo
  const getDefaultIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12 text-gray-400" aria-hidden="true" />;
      case 'calendar':
        return <Calendar className="w-12 h-12 text-gray-400" aria-hidden="true" />;
      case 'users':
        return <Users className="w-12 h-12 text-gray-400" aria-hidden="true" />;
      case 'documents':
        return <FileText className="w-12 h-12 text-gray-400" aria-hidden="true" />;
      case 'alerts':
        return <AlertCircle className="w-12 h-12 text-gray-400" aria-hidden="true" />;
      default:
        return <Plus className="w-12 h-12 text-gray-400" aria-hidden="true" />;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="status"
      aria-label={`${title}. ${description || ''}`}
    >
      <div className="mb-6">
        <div className="mb-4">
          {displayIcon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 max-w-md">
            {description}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="flex items-center gap-2"
          aria-label={actionText}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {actionText}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Componentes pré-configurados para casos comuns
export const EmptyPatientsState: React.FC<{ onCreatePatient?: () => void }> = ({ onCreatePatient }) => (
  <EmptyState
    type="users"
    title="Nenhum paciente cadastrado"
    description="Comece adicionando seu primeiro paciente para gerenciar consultas e tratamentos."
    actionText="Cadastrar primeiro paciente"
    onAction={onCreatePatient}
  />
);

export const EmptyAppointmentsState: React.FC<{ onCreateAppointment?: () => void }> = ({ onCreateAppointment }) => (
  <EmptyState
    type="calendar"
    title="Nenhum agendamento encontrado"
    description="Não há consultas agendadas para o período selecionado."
    actionText="Agendar consulta"
    onAction={onCreateAppointment}
  />
);

export const EmptySearchState: React.FC<{ searchTerm?: string }> = ({ searchTerm }) => (
  <EmptyState
    type="search"
    title="Nenhum resultado encontrado"
    description={searchTerm ? `Não encontramos resultados para "${searchTerm}"` : 'Tente ajustar os filtros de busca.'}
  />
);

export const EmptyDocumentsState: React.FC<{ onUpload?: () => void }> = ({ onUpload }) => (
  <EmptyState
    type="documents"
    title="Nenhum documento encontrado"
    description="Ainda não há documentos anexados a este paciente."
    actionText="Anexar documento"
    onAction={onUpload}
  />
);

export default EmptyState;

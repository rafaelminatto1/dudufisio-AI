/**
 * utils/toast.ts
 * Utilitário profissional para notificações toast
 */

import { toast, ToastOptions, TypeOptions } from 'react-toastify';

// ============================================================================
// TYPES
// ============================================================================

interface ToastConfig extends Partial<ToastOptions> {
  title?: string;
  description?: string;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// ============================================================================
// TOAST UTILITIES
// ============================================================================

/**
 * Cria uma mensagem toast com formatação consistente
 */
function createToastMessage(title?: string, description?: string): string | React.ReactNode {
  if (!title && !description) return '';
  
  if (title && description) {
    return (
      <div>
        <strong>{title}</strong>
        <div style={{ marginTop: '4px', fontSize: '0.9em' }}>{description}</div>
      </div>
    );
  }
  
  return title || description || '';
}

/**
 * Exibe notificação de sucesso
 */
export function showSuccess(message: string, config?: ToastConfig): void {
  const { title, description, ...options } = config || {};
  const content = title || description ? createToastMessage(title, description) : message;
  
  toast.success(content, {
    ...defaultConfig,
    ...options,
  });
}

/**
 * Exibe notificação de erro
 */
export function showError(message: string, config?: ToastConfig): void {
  const { title, description, ...options } = config || {};
  const content = title || description ? createToastMessage(title, description) : message;
  
  toast.error(content, {
    ...defaultConfig,
    autoClose: 6000, // Erros ficam mais tempo na tela
    ...options,
  });
}

/**
 * Exibe notificação de aviso
 */
export function showWarning(message: string, config?: ToastConfig): void {
  const { title, description, ...options } = config || {};
  const content = title || description ? createToastMessage(title, description) : message;
  
  toast.warning(content, {
    ...defaultConfig,
    ...options,
  });
}

/**
 * Exibe notificação de informação
 */
export function showInfo(message: string, config?: ToastConfig): void {
  const { title, description, ...options } = config || {};
  const content = title || description ? createToastMessage(title, description) : message;
  
  toast.info(content, {
    ...defaultConfig,
    ...options,
  });
}

/**
 * Exibe notificação de carregamento com promise
 */
export async function showPromise<T>(
  promise: Promise<T>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  config?: ToastConfig
): Promise<T> {
  const { ...options } = config || {};
  
  return toast.promise(
    promise,
    {
      pending: messages.pending,
      success: messages.success,
      error: messages.error,
    },
    {
      ...defaultConfig,
      ...options,
    }
  );
}

/**
 * Exibe notificação de carregamento
 */
export function showLoading(message: string, config?: ToastConfig): string | number {
  const { title, description, ...options } = config || {};
  const content = title || description ? createToastMessage(title, description) : message;
  
  return toast.loading(content, {
    ...defaultConfig,
    ...options,
  });
}

/**
 * Atualiza uma notificação de carregamento
 */
export function updateToast(
  toastId: string | number,
  type: TypeOptions,
  message: string,
  config?: ToastConfig
): void {
  const { title, description, ...options } = config || {};
  const content = title || description ? createToastMessage(title, description) : message;
  
  toast.update(toastId, {
    render: content,
    type,
    isLoading: false,
    ...defaultConfig,
    ...options,
  });
}

/**
 * Fecha uma notificação específica
 */
export function dismissToast(toastId?: string | number): void {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
}

// ============================================================================
// PATIENT-SPECIFIC TOASTS
// ============================================================================

export const patientToasts = {
  /**
   * Paciente criado com sucesso
   */
  created: (patientName: string) => {
    showSuccess('Paciente cadastrado', {
      description: `${patientName} foi cadastrado com sucesso!`,
    });
  },

  /**
   * Paciente atualizado com sucesso
   */
  updated: (patientName: string) => {
    showSuccess('Paciente atualizado', {
      description: `Os dados de ${patientName} foram atualizados.`,
    });
  },

  /**
   * Paciente excluído com sucesso
   */
  deleted: (patientName: string) => {
    showSuccess('Paciente excluído', {
      description: `${patientName} foi removido do sistema.`,
    });
  },

  /**
   * Erro ao criar paciente
   */
  createError: (error?: string) => {
    showError('Erro ao cadastrar paciente', {
      description: error || 'Não foi possível cadastrar o paciente. Tente novamente.',
    });
  },

  /**
   * Erro ao atualizar paciente
   */
  updateError: (error?: string) => {
    showError('Erro ao atualizar paciente', {
      description: error || 'Não foi possível atualizar os dados. Tente novamente.',
    });
  },

  /**
   * Erro ao excluir paciente
   */
  deleteError: (error?: string) => {
    showError('Erro ao excluir paciente', {
      description: error || 'Não foi possível excluir o paciente. Tente novamente.',
    });
  },

  /**
   * Erro ao carregar paciente
   */
  loadError: () => {
    showError('Erro ao carregar dados', {
      description: 'Não foi possível carregar os dados do paciente.',
    });
  },

  /**
   * Validação: CPF já cadastrado
   */
  duplicateCPF: () => {
    showWarning('CPF já cadastrado', {
      description: 'Este CPF já está cadastrado no sistema.',
    });
  },

  /**
   * Validação: Email já cadastrado
   */
  duplicateEmail: () => {
    showWarning('Email já cadastrado', {
      description: 'Este email já está cadastrado no sistema.',
    });
  },

  /**
   * Formulário com erros
   */
  validationError: () => {
    showError('Formulário com erros', {
      description: 'Por favor, corrija os erros antes de continuar.',
    });
  },

  /**
   * Dados salvos automaticamente
   */
  autoSaved: () => {
    showInfo('Dados salvos', {
      description: 'Suas alterações foram salvas automaticamente.',
      autoClose: 2000,
    });
  },
};

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

/**
 * Solicita confirmação antes de executar uma ação
 * Retorna uma promise que resolve em true se confirmado
 */
export function confirmAction(
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void {
  const handleConfirm = () => {
    dismissToast();
    onConfirm();
  };

  const handleCancel = () => {
    dismissToast();
    if (onCancel) onCancel();
  };

  toast(
    <div>
      <p>{message}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={handleConfirm}
          style={{
            padding: '6px 12px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Confirmar
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: '6px 12px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>,
    {
      ...defaultConfig,
      autoClose: false,
      closeOnClick: false,
    }
  );
}


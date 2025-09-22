// Advanced Modal Factory with Type Safety
// Architectural solution for complex modal interface type mismatches

import React from 'react';
import type {
  BaseModalProps,
  FormModalProps,
  SelectionModalProps,
  AsyncResult
} from '../types/utils';
import { safeAsync, safeCall, safeLog } from './safety';

// === Base Modal Hook Pattern ===

export interface ModalState<TData = any> {
  isOpen: boolean;
  data?: TData;
  isLoading: boolean;
  error?: string;
}

export interface ModalActions<TData = any> {
  open: (data?: TData) => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string | null) => void;
  reset: () => void;
}

export interface ModalHook<TData = any> {
  state: ModalState<TData>;
  actions: ModalActions<TData>;
}

// === Type-safe Modal Hook ===

function useModal<TData = any>(initialData?: TData): ModalHook<TData> {
  const [state, setState] = React.useState<ModalState<TData>>({
    isOpen: false,
    ...(initialData !== undefined && { data: initialData }),
    isLoading: false,
  });

  const actions: ModalActions<TData> = React.useMemo(
    () => ({
      open: (data?: TData) => {
        setState(prev => ({
          ...prev,
          isOpen: true,
          ...(data !== undefined && { data }),
        }));
      },

      close: () => {
        setState(prev => ({
          ...prev,
          isOpen: false,
          isLoading: false,
        }));
      },

      setLoading: (loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
      },

      setError: (error?: string | null) => {
        setState(prev => ({
          ...prev,
          ...(error !== null && { error }),
        }));
      },

      reset: () => {
        setState({
          isOpen: false,
          ...(initialData !== undefined && { data: initialData }),
          isLoading: false,
        });
      },
    }),
    [initialData]
  );

  return { state, actions };
}

// === Form Modal Factory ===

export interface FormModalHook<TFormData = any> extends ModalHook<TFormData> {
  handleSave: (data: TFormData) => Promise<void>;
  handleCancel: () => void;
}

function useFormModal<TFormData = any>(
  onSave: (data: TFormData) => AsyncResult<void, Error>,
  options: {
    initialData?: TFormData;
    resetOnClose?: boolean;
    validateBeforeSave?: (data: TFormData) => boolean;
  } = {}
): FormModalHook<TFormData> {
  const { initialData, resetOnClose = true, validateBeforeSave } = options;
  const modal = useModal<TFormData>(initialData);

  const handleSave = React.useCallback(
    async (data: TFormData) => {
      // Optional validation
      if (validateBeforeSave && !validateBeforeSave(data)) {
        modal.actions.setError('Por favor, corrija os erros antes de continuar.');
        return;
      }

      modal.actions.setLoading(true);
      modal.actions.setError();

      const result = await safeAsync(onSave(data));

      if (result.success) {
        safeLog('Form modal save successful', { data });
        modal.actions.close();
        if (resetOnClose) {
          modal.actions.reset();
        }
      } else {
        modal.actions.setError(result.error.message);
        safeLog('Form modal save failed', result.error, 'error');
      }

      modal.actions.setLoading(false);
    },
    [modal.actions, onSave, validateBeforeSave, resetOnClose]
  );

  const handleCancel = React.useCallback(() => {
    modal.actions.close();
    if (resetOnClose) {
      modal.actions.reset();
    }
  }, [modal.actions, resetOnClose]);

  return {
    ...modal,
    handleSave,
    handleCancel,
  };
}

// === Selection Modal Factory ===

export interface SelectionModalHook<TItem = any> extends ModalHook<TItem[]> {
  selectedItem?: TItem;
  handleSelect: (item: TItem) => void;
  handleConfirm: () => void;
}

function useSelectionModal<TItem = any>(
  onSelect: (item: TItem) => void | Promise<void>,
  options: {
    items?: TItem[];
    multiSelect?: boolean;
    autoConfirm?: boolean;
  } = {}
): SelectionModalHook<TItem> {
  const { items = [], multiSelect = false, autoConfirm = true } = options;
  const modal = useModal<TItem[]>(items);
  const [selectedItem, setSelectedItem] = React.useState<TItem>();

  const handleSelect = React.useCallback(
    async (item: TItem) => {
      setSelectedItem(item);

      if (autoConfirm && !multiSelect) {
        modal.actions.setLoading(true);

        const result = await safeAsync(
          Promise.resolve(safeCall(onSelect, item))
        );

        if (result.success) {
          modal.actions.close();
          setSelectedItem(undefined);
        } else {
          modal.actions.setError(result.error?.message || 'Erro na seleção');
        }

        modal.actions.setLoading(false);
      }
    },
    [modal.actions, onSelect, autoConfirm, multiSelect]
  );

  const handleConfirm = React.useCallback(async () => {
    if (!selectedItem) return;

    modal.actions.setLoading(true);

    const result = await safeAsync(
      Promise.resolve(safeCall(onSelect, selectedItem))
    );

    if (result.success) {
      modal.actions.close();
      setSelectedItem(undefined);
    } else {
      modal.actions.setError(result.error?.message || 'Erro na confirmação');
    }

    modal.actions.setLoading(false);
  }, [modal.actions, selectedItem, onSelect]);

  return {
    ...modal,
    selectedItem,
    handleSelect,
    handleConfirm,
  };
}

// === Confirmation Modal Factory ===

export interface ConfirmationModalHook {
  state: ModalState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }>;
  actions: ModalActions & {
    confirm: (config: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning' | 'info';
    }) => Promise<boolean>;
  };
}

function useConfirmationModal(
  onConfirm?: () => void | Promise<void>
): ConfirmationModalHook {
  const modal = useModal<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }>();

  const [resolver, setResolver] = React.useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = React.useCallback(
    async (config: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning' | 'info';
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setResolver({ resolve });
        modal.actions.open({
          ...config,
          confirmText: config.confirmText || 'Confirmar',
          cancelText: config.cancelText || 'Cancelar',
          variant: config.variant || 'info',
        });
      });
    },
    [modal.actions]
  );

  const handleConfirm = React.useCallback(async () => {
    modal.actions.setLoading(true);

    try {
      if (onConfirm) {
        await safeAsync(Promise.resolve(onConfirm()));
      }

      resolver?.resolve(true);
      modal.actions.close();
    } catch (error) {
      modal.actions.setError('Erro ao confirmar ação');
      safeLog('Confirmation modal error', error, 'error');
    } finally {
      modal.actions.setLoading(false);
      setResolver(null);
    }
  }, [modal.actions, onConfirm, resolver]);

  const handleCancel = React.useCallback(() => {
    resolver?.resolve(false);
    modal.actions.close();
    setResolver(null);
  }, [modal.actions, resolver]);

  return {
    state: modal.state,
    actions: {
      ...modal.actions,
      confirm,
    },
  };
}

// === Generic Modal Component Props Factory ===

function createModalProps<TData = any>(
  hook: ModalHook<TData>
): BaseModalProps & {
  isLoading: boolean;
  error?: string;
  data?: TData;
} {
  return {
    isOpen: hook.state.isOpen,
    onClose: hook.actions.close,
    isLoading: hook.state.isLoading,
    error: hook.state.error,
    data: hook.state.data,
  };
}

function createFormModalProps<TData = any>(
  hook: FormModalHook<TData>
): FormModalProps<TData> & {
  isLoading: boolean;
  error?: string;
  onCancel: () => void;
} {
  return {
    isOpen: hook.state.isOpen,
    onClose: hook.handleCancel,
    initialData: hook.state.data,
    onSave: hook.handleSave,
    isLoading: hook.state.isLoading,
    error: hook.state.error,
    onCancel: hook.handleCancel,
  };
}

function createSelectionModalProps<TItem = any>(
  hook: SelectionModalHook<TItem>
): SelectionModalProps<TItem> & {
  isLoading: boolean;
  error?: string;
  onConfirm: () => void;
} {
  return {
    isOpen: hook.state.isOpen,
    onClose: hook.actions.close,
    items: hook.state.data || [],
    selectedItem: hook.selectedItem,
    onSelect: hook.handleSelect,
    isLoading: hook.state.isLoading,
    error: hook.state.error,
    onConfirm: hook.handleConfirm,
  };
}

// === Export all patterns ===

export {
  useModal,
  useFormModal,
  useSelectionModal,
  useConfirmationModal,
  createModalProps,
  createFormModalProps,
  createSelectionModalProps,
};
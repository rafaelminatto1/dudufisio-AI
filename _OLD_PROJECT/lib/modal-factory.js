// Advanced Modal Factory with Type Safety
// Architectural solution for complex modal interface type mismatches
import React from 'react';
import { safeAsync, safeCall, safeLog } from './safety';
// === Type-safe Modal Hook ===
function useModal(initialData) {
    const [state, setState] = React.useState({
        isOpen: false,
        ...(initialData !== undefined && { data: initialData }),
        isLoading: false,
    });
    const actions = React.useMemo(() => ({
        open: (data) => {
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
        setLoading: (loading) => {
            setState(prev => ({ ...prev, isLoading: loading }));
        },
        setError: (error) => {
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
    }), [initialData]);
    return { state, actions };
}
function useFormModal(onSave, options = {}) {
    const { initialData, resetOnClose = true, validateBeforeSave } = options;
    const modal = useModal(initialData);
    const handleSave = React.useCallback(async (data) => {
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
        }
        else {
            modal.actions.setError(result.error.message);
            safeLog('Form modal save failed', result.error, 'error');
        }
        modal.actions.setLoading(false);
    }, [modal.actions, onSave, validateBeforeSave, resetOnClose]);
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
function useSelectionModal(onSelect, options = {}) {
    const { items = [], multiSelect = false, autoConfirm = true } = options;
    const modal = useModal(items);
    const [selectedItem, setSelectedItem] = React.useState();
    const handleSelect = React.useCallback(async (item) => {
        setSelectedItem(item);
        if (autoConfirm && !multiSelect) {
            modal.actions.setLoading(true);
            const result = await safeAsync(Promise.resolve(safeCall(onSelect, item)));
            if (result.success) {
                modal.actions.close();
                setSelectedItem(undefined);
            }
            else {
                modal.actions.setError(result.error?.message || 'Erro na seleção');
            }
            modal.actions.setLoading(false);
        }
    }, [modal.actions, onSelect, autoConfirm, multiSelect]);
    const handleConfirm = React.useCallback(async () => {
        if (!selectedItem)
            return;
        modal.actions.setLoading(true);
        const result = await safeAsync(Promise.resolve(safeCall(onSelect, selectedItem)));
        if (result.success) {
            modal.actions.close();
            setSelectedItem(undefined);
        }
        else {
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
function useConfirmationModal(onConfirm) {
    const modal = useModal();
    const [resolver, setResolver] = React.useState(null);
    const confirm = React.useCallback(async (config) => {
        return new Promise((resolve) => {
            setResolver({ resolve });
            modal.actions.open({
                ...config,
                confirmText: config.confirmText || 'Confirmar',
                cancelText: config.cancelText || 'Cancelar',
                variant: config.variant || 'info',
            });
        });
    }, [modal.actions]);
    const handleConfirm = React.useCallback(async () => {
        modal.actions.setLoading(true);
        try {
            if (onConfirm) {
                await safeAsync(Promise.resolve(onConfirm()));
            }
            resolver?.resolve(true);
            modal.actions.close();
        }
        catch (error) {
            modal.actions.setError('Erro ao confirmar ação');
            safeLog('Confirmation modal error', error, 'error');
        }
        finally {
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
        handleConfirm,
        handleCancel,
    };
}
// === Generic Modal Component Props Factory ===
function createModalProps(hook) {
    return {
        isOpen: hook.state.isOpen,
        onClose: hook.actions.close,
        isLoading: hook.state.isLoading,
        error: hook.state.error,
        data: hook.state.data,
    };
}
function createFormModalProps(hook) {
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
function createSelectionModalProps(hook) {
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
export { useModal, useFormModal, useSelectionModal, useConfirmationModal, createModalProps, createFormModalProps, createSelectionModalProps, };

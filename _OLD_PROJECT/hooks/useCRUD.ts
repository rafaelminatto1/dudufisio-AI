import { useState, useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CRUDConfig<T> {
  queryKey: string[];
  fetchFn: () => Promise<T[]>;
  createFn: (data: Partial<T>) => Promise<T>;
  updateFn: (id: string, data: Partial<T>) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: (id: string) => void;
  };
  onError?: {
    create?: (error: Error) => void;
    update?: (error: Error) => void;
    delete?: (error: Error) => void;
  };
  messages?: {
    createSuccess?: string;
    createError?: string;
    updateSuccess?: string;
    updateError?: string;
    deleteSuccess?: string;
    deleteError?: string;
  };
}

export function useCRUD<T extends { id: string }>(config: CRUDConfig<T>) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Query
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: config.queryKey,
    queryFn: config.fetchFn,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: config.createFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(config.messages?.createSuccess || 'Item criado com sucesso!');
      config.onSuccess?.create?.(data);
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(config.messages?.createError || 'Erro ao criar item');
      config.onError?.create?.(error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
      config.updateFn(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(config.messages?.updateSuccess || 'Item atualizado com sucesso!');
      config.onSuccess?.update?.(data);
      setIsFormOpen(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => {
      toast.error(config.messages?.updateError || 'Erro ao atualizar item');
      config.onError?.update?.(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: config.deleteFn,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(config.messages?.deleteSuccess || 'Item excluído com sucesso!');
      config.onSuccess?.delete?.(id);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(config.messages?.deleteError || 'Erro ao excluir item');
      config.onError?.delete?.(error);
    },
  });

  // Handlers
  const handleCreate = useCallback((data: Partial<T>) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleUpdate = useCallback((id: string, data: Partial<T>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const openCreateForm = useCallback(() => {
    setSelectedItem(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((item: T) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedItem(null);
  }, []);

  const openDeleteDialog = useCallback((id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      handleDelete(itemToDelete);
    }
  }, [itemToDelete, handleDelete]);

  return {
    // Data
    data,
    isLoading,
    error,
    refetch,
    
    // Mutations
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Form state
    isFormOpen,
    selectedItem,
    openCreateForm,
    openEditForm,
    closeForm,
    
    // Delete dialog state
    isDeleteDialogOpen,
    itemToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
}


// services/suppliesService.ts
import { supabase } from '../lib/supabase';
import { 
  Supply, 
  Supplier, 
  StockMovement, 
  PurchaseOrder, 
  PurchaseOrderItem,
  SupplyAlert,
  CreateSupplyData,
  UpdateSupplyData,
  CreateStockMovementData,
  CreatePurchaseOrderData,
  SupplyFilters,
  StockMovementFilters,
  PurchaseOrderFilters,
  SuppliesDashboardData,
  SupplyConsumptionReport,
  StockValuationReport,
  MovementType
} from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mapeamento de dados do Supabase para tipos da aplicação
const mapSupabaseSupplierToSupplier = (data: any): Supplier => ({
  id: data.id,
  name: data.name,
  contactPerson: data.contact_person,
  email: data.email,
  phone: data.phone,
  address: data.address,
  cnpj: data.cnpj,
  paymentTerms: data.payment_terms,
  deliveryTimeDays: data.delivery_time_days || 0,
  isActive: data.is_active || false,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString(),
});

const mapSupplierToSupabase = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => ({
  name: supplier.name,
  contact_person: supplier.contactPerson,
  email: supplier.email,
  phone: supplier.phone,
  address: supplier.address,
  cnpj: supplier.cnpj,
  payment_terms: supplier.paymentTerms,
  delivery_time_days: supplier.deliveryTimeDays,
  is_active: supplier.isActive,
});

const mapSupabaseSupplyToSupply = (data: any): Supply => ({
  id: data.id,
  name: data.name,
  description: data.description,
  category: data.category,
  subcategory: data.subcategory,
  brand: data.brand,
  model: data.model,
  unitOfMeasure: data.unit_of_measure || 'unidade',
  currentStock: data.current_stock || 0,
  minimumStock: data.minimum_stock || 0,
  maximumStock: data.maximum_stock,
  unitCost: data.unit_cost,
  supplierId: data.supplier_id,
  supplier: data.supplier ? mapSupabaseSupplierToSupplier(data.supplier) : undefined,
  barcode: data.barcode,
  expirationDate: data.expiration_date,
  storageLocation: data.storage_location,
  isActive: data.is_active || false,
  requiresPrescription: data.requires_prescription || false,
  createdBy: data.created_by,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString(),
});

const mapSupplyToSupabase = (supply: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'>) => ({
  name: supply.name,
  description: supply.description,
  category: supply.category,
  subcategory: supply.subcategory,
  brand: supply.brand,
  model: supply.model,
  unit_of_measure: supply.unitOfMeasure,
  current_stock: supply.currentStock,
  minimum_stock: supply.minimumStock,
  maximum_stock: supply.maximumStock,
  unit_cost: supply.unitCost,
  supplier_id: supply.supplierId,
  barcode: supply.barcode,
  expiration_date: supply.expirationDate,
  storage_location: supply.storageLocation,
  is_active: supply.isActive,
  requires_prescription: supply.requiresPrescription,
  created_by: supply.createdBy,
});

// ============================================================================
// SERVIÇO DE FORNECEDORES
// ============================================================================

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data || []).map(mapSupabaseSupplierToSupplier);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    throw error;
  }
};

export const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([mapSupplierToSupabase(supplierData)])
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseSupplierToSupplier(data);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    throw error;
  }
};

export const updateSupplier = async (id: string, supplierData: Partial<Supplier>): Promise<Supplier> => {
  try {
    const supabaseData = mapSupplierToSupabase(supplierData as Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>);
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...supabaseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseSupplierToSupplier(data);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE INSUMOS
// ============================================================================

export const getSupplies = async (filters?: SupplyFilters): Promise<Supply[]> => {
  try {
    let query = supabase
      .from('supplies')
      .select(`
        *,
        supplier:suppliers(*)
      `);

    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters.lowStock) {
        // Filter for supplies where current_stock <= minimum_stock
        query = query.filter('current_stock', 'lte', 'minimum_stock');
      }
      if (filters.expiring) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        query = query.lte('expiration_date', thirtyDaysFromNow.toISOString().split('T')[0]);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return (data || []).map(mapSupabaseSupplyToSupply);
  } catch (error) {
    console.error('Erro ao buscar insumos:', error);
    throw error;
  }
};

export const getSupplyById = async (id: string): Promise<Supply | undefined> => {
  try {
    const { data, error } = await supabase
      .from('supplies')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapSupabaseSupplyToSupply(data) : undefined;
  } catch (error) {
    console.error('Erro ao buscar insumo:', error);
    throw error;
  }
};

export const createSupply = async (supplyData: CreateSupplyData): Promise<Supply> => {
  try {
    // Simplified approach - create basic supply data
    const basicData = {
      name: supplyData.name,
      description: supplyData.description,
      category: supplyData.category,
      subcategory: supplyData.subcategory,
      brand: supplyData.brand,
      model: supplyData.model,
      unit_of_measure: supplyData.unitOfMeasure || 'unidade',
      current_stock: 0, // Default stock for new supplies
      minimum_stock: supplyData.minimumStock || 0,
      maximum_stock: supplyData.maximumStock,
      unit_cost: supplyData.unitCost,
      supplier_id: supplyData.supplierId,
      barcode: supplyData.barcode,
      expiration_date: supplyData.expirationDate,
      storage_location: supplyData.storageLocation,
      is_active: true, // Default active for new supplies
      requires_prescription: supplyData.requiresPrescription || false,
      created_by: (await supabase.auth.getUser()).data.user?.id
    };

    const { data, error } = await supabase
      .from('supplies')
      .insert([basicData])
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) throw error;
    return mapSupabaseSupplyToSupply(data);
  } catch (error) {
    console.error('Erro ao criar insumo:', error);
    throw error;
  }
};

export const updateSupply = async (id: string, supplyData: UpdateSupplyData): Promise<Supply> => {
  try {
    const { data, error } = await supabase
      .from('supplies')
      .update({ 
        ...supplyData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) throw error;
    return mapSupabaseSupplyToSupply(data);
  } catch (error) {
    console.error('Erro ao atualizar insumo:', error);
    throw error;
  }
};

export const deleteSupply = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('supplies')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir insumo:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE MOVIMENTAÇÕES DE ESTOQUE
// ============================================================================

export const getStockMovements = async (filters?: StockMovementFilters): Promise<StockMovement[]> => {
  try {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        supply:supplies(*)
      `);

    if (filters) {
      if (filters.supplyId) {
        query = query.eq('supply_id', filters.supplyId);
      }
      if (filters.movementType) {
        query = query.eq('movement_type', filters.movementType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters.taskId) {
        query = query.eq('task_id', filters.taskId);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    throw error;
  }
};

export const createStockMovement = async (movementData: CreateStockMovementData): Promise<StockMovement> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const insertData = {
      supply_id: movementData.supplyId,
      movement_type: movementData.movementType,
      quantity: movementData.quantity,
      unit_cost: movementData.unitCost,
      total_cost: movementData.unitCost ? movementData.unitCost * movementData.quantity : null,
      reason: movementData.reason,
      reference_document: movementData.referenceDocument,
      moved_by: user.user?.id || movementData.patientId,
      patient_id: movementData.patientId,
      task_id: movementData.taskId,
      batch_number: movementData.batchNumber,
      expiration_date: movementData.expirationDate
    };

    const { data, error } = await supabase
      .from('stock_movements')
      .insert(insertData)
      .select(`
        *,
        supply:supplies(*)
      `)
      .single();

    if (error) throw error;

    // Update supply stock
    if (data) {
      const { data: supply } = await supabase
        .from('supplies')
        .select('current_stock')
        .eq('id', movementData.supplyId)
        .single();

      if (supply) {
        const newStock = movementData.movementType === 'entrada' 
          ? supply.current_stock + movementData.quantity
          : supply.current_stock - movementData.quantity;

        await supabase
          .from('supplies')
          .update({ current_stock: newStock })
          .eq('id', movementData.supplyId);
      }
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE PEDIDOS DE COMPRA
// ============================================================================

export const getPurchaseOrders = async (filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> => {
  try {
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          supply:supplies(*)
        )
      `);

    if (filters) {
      if (filters.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('order_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('order_date', filters.dateTo);
      }
      if (filters.isAutoGenerated !== undefined) {
        query = query.eq('is_auto_generated', filters.isAutoGenerated);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const createPurchaseOrder = async (orderData: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    // Calculate total amount
    const totalAmount = orderData.items.reduce((sum, item) => {
      return sum + (item.unitCost ? item.unitCost * item.quantityRequested : 0);
    }, 0);

    // Create purchase order
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: orderData.supplierId,
        status: 'pending',
        total_amount: totalAmount,
        requested_by: user.user?.id,
        order_date: new Date().toISOString(),
        expected_delivery: orderData.expectedDelivery,
        notes: orderData.notes,
        is_auto_generated: false
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create purchase order items
    const items = orderData.items.map(item => ({
      purchase_order_id: order.id,
      supply_id: item.supplyId,
      quantity_requested: item.quantityRequested,
      quantity_received: 0,
      unit_cost: item.unitCost,
      total_cost: item.unitCost ? item.unitCost * item.quantityRequested : 0
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(items);

    if (itemsError) throw itemsError;

    // Fetch complete order with relations
    const { data: completeOrder, error: fetchError } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          supply:supplies(*)
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    return completeOrder;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

export const updatePurchaseOrderStatus = async (id: string, status: string, approvedBy?: string): Promise<PurchaseOrder> => {
  try {
    const updateData: any = { status };
    if (approvedBy) {
      updateData.approved_by = approvedBy;
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          supply:supplies(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE ALERTAS
// ============================================================================

export const getSupplyAlerts = async (unreadOnly: boolean = false): Promise<SupplyAlert[]> => {
  try {
    let query = supabase
      .from('supply_alerts')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('is_resolved', false);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    throw error;
  }
};

export const markAlertAsRead = async (alertId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('supply_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar alerta como lido:', error);
    throw error;
  }
};

export const resolveAlert = async (alertId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('supply_alerts')
      .update({ 
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', alertId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao resolver alerta:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE DASHBOARD E RELATÓRIOS
// ============================================================================

export const getSuppliesDashboardData = async (): Promise<SuppliesDashboardData> => {
  try {
    // Buscar dados básicos
    const [supplies, movements, alerts] = await Promise.all([
      getSupplies({ isActive: true }),
      getStockMovements({ dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }),
      getSupplyAlerts(true)
    ]);

    // Calcular métricas
    const totalSupplies = supplies.length;
    const lowStockCount = supplies.filter(s => s.currentStock <= s.minimumStock).length;
    const expiringCount = supplies.filter(s => {
      if (!s.expirationDate) return false;
      const expDate = new Date(s.expirationDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expDate <= thirtyDaysFromNow;
    }).length;
    
    const totalValue = supplies.reduce((sum, supply) => 
      sum + (supply.currentStock * (supply.unitCost || 0)), 0
    );

    // Top insumos mais consumidos
    const consumptionMap = new Map<string, number>();
    movements
      .filter(m => m.movementType === MovementType.Out)
      .forEach(movement => {
        const current = consumptionMap.get(movement.supplyId) || 0;
        consumptionMap.set(movement.supplyId, current + movement.quantity);
      });

    const topConsumedSupplies = Array.from(consumptionMap.entries())
      .map(([supplyId, quantityConsumed]) => {
        const supply = supplies.find(s => s.id === supplyId);
        return {
          supplyId,
          supplyName: supply?.name || 'Insumo não encontrado',
          quantityConsumed
        };
      })
      .sort((a, b) => b.quantityConsumed - a.quantityConsumed)
      .slice(0, 5);

    return {
      totalSupplies,
      lowStockCount,
      expiringCount,
      totalValue,
      recentMovements: movements.slice(0, 10),
      topConsumedSupplies,
      alerts: alerts.slice(0, 10)
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

export const getConsumptionReport = async (
  supplyId?: string, 
  dateFrom?: string, 
  dateTo?: string
): Promise<SupplyConsumptionReport[]> => {
  try {
    const filters: StockMovementFilters = {};
    if (supplyId) filters.supplyId = supplyId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const movements = await getStockMovements(filters);
    const supplies = await getSupplies({ isActive: true });

    const reportMap = new Map<string, SupplyConsumptionReport>();

    supplies.forEach(supply => {
      const supplyMovements = movements.filter(m => m.supplyId === supply.id);
      
      const totalConsumed = supplyMovements
        .filter(m => m.movementType === MovementType.Out)
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalReceived = supplyMovements
        .filter(m => m.movementType === MovementType.In)
        .reduce((sum, m) => sum + m.quantity, 0);

      const daysDiff = dateFrom && dateTo ? 
        Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)) : 30;
      
      const avgMonthlyConsumption = (totalConsumed / daysDiff) * 30;
      const stockTurnover = supply.currentStock > 0 ? totalConsumed / supply.currentStock : 0;

      reportMap.set(supply.id, {
        supplyId: supply.id,
        supplyName: supply.name,
        category: supply.category,
        totalConsumed,
        totalReceived,
        avgMonthlyConsumption,
        currentStock: supply.currentStock,
        stockTurnover,
        period: {
          start: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: dateTo || new Date().toISOString()
        }
      });
    });

    return Array.from(reportMap.values())
      .filter(report => report.totalConsumed > 0 || report.totalReceived > 0)
      .sort((a, b) => b.totalConsumed - a.totalConsumed);
  } catch (error) {
    console.error('Erro ao gerar relatório de consumo:', error);
    throw error;
  }
};

export const getStockValuationReport = async (): Promise<StockValuationReport> => {
  try {
    const supplies = await getSupplies({ isActive: true });
    
    const totalValue = supplies.reduce((sum, supply) => 
      sum + (supply.currentStock * (supply.unitCost || 0)), 0
    );

    // Breakdown por categoria
    const categoryMap = new Map<string, number>();
    supplies.forEach(supply => {
      const value = supply.currentStock * (supply.unitCost || 0);
      const current = categoryMap.get(supply.category) || 0;
      categoryMap.set(supply.category, current + value);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, value]) => ({
        category: category as any,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Breakdown por fornecedor
    const supplierMap = new Map<string, { name: string; value: number }>();
    supplies.forEach(supply => {
      if (supply.supplierId) {
        const value = supply.currentStock * (supply.unitCost || 0);
        const current = supplierMap.get(supply.supplierId) || { name: supply.supplier?.name || 'Fornecedor não encontrado', value: 0 };
        supplierMap.set(supply.supplierId, {
          name: current.name,
          value: current.value + value
        });
      }
    });

    const supplierBreakdown = Array.from(supplierMap.entries())
      .map(([supplierId, data]) => ({
        supplierId,
        supplierName: data.name,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalValue,
      categoryBreakdown,
      supplierBreakdown
    };
  } catch (error) {
    console.error('Erro ao gerar relatório de valorização:', error);
    throw error;
  }
};

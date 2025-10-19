// services/supplies/purchaseAutomationService.ts
import { supabase } from '../../lib/supabase';
import {
  Supply,
  Supplier,
  PurchaseOrder,
  CreatePurchaseOrderData,
  OrderStatus
} from '../../types';

// ============================================================================
// TIPOS PARA AUTOMAÇÃO DE PEDIDOS
// ============================================================================

export interface ReplenishmentRule {
  id: string;
  supplyId: string;
  supply?: Supply;
  isEnabled: boolean;
  reorderPoint: number;
  economicOrderQuantity: number;
  maxStockLevel?: number;
  autoApproveLimit?: number;
  preferredSupplierId?: string;
  preferredSupplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumptionData {
  date: string;
  quantity: number;
}

export interface ReplenishmentSuggestion {
  supply: Supply;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  estimatedCost: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  supplier?: Supplier;
}

export interface ApprovalWorkflow {
  id: string;
  purchaseOrderId: string;
  approverId: string;
  approvalLevel: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

// ============================================================================
// SERVIÇO DE AUTOMAÇÃO DE PEDIDOS
// ============================================================================

class PurchaseAutomationService {
  
  /**
   * Calcula a quantidade ótima de pedido usando a fórmula EOQ
   * EOQ = sqrt((2 * D * S) / H)
   * D = Demanda anual
   * S = Custo por pedido
   * H = Custo de manutenção
   */
  calculateEOQ(
    annualDemand: number,
    orderingCost: number = 50,
    holdingCostRate: number = 0.25,
    unitCost: number = 1
  ): number {
    const holdingCost = unitCost * holdingCostRate;
    
    if (holdingCost === 0 || annualDemand === 0) {
      return 0;
    }
    
    return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
  }

  /**
   * Calcula o ponto de reposição
   * ROP = (Lead Time Demand) + Safety Stock
   */
  calculateReorderPoint(
    averageDailyDemand: number,
    leadTimeDays: number = 7,
    safetyStockDays: number = 3
  ): number {
    const leadTimeDemand = averageDailyDemand * leadTimeDays;
    const safetyStock = averageDailyDemand * safetyStockDays;
    
    return Math.ceil(leadTimeDemand + safetyStock);
  }

  /**
   * Analisa o histórico de consumo e calcula métricas
   */
  async analyzeConsumptionHistory(
    supplyId: string,
    periodDays: number = 90
  ): Promise<{
    averageDailyConsumption: number;
    monthlyConsumption: number;
    annualProjection: number;
    standardDeviation: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data, error } = await supabase
        .from('stock_movements')
        .select('quantity, created_at')
        .eq('supply_id', supplyId)
        .eq('movement_type', 'saida')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data?.length === 0) {
        return {
          averageDailyConsumption: 0,
          monthlyConsumption: 0,
          annualProjection: 0,
          standardDeviation: 0
        };
      }

      // Agrupar por dia
      const dailyConsumption = new Map<string, number>();
      data.forEach(movement => {
        const date = new Date(movement.created_at).toISOString().split('T')[0];
        dailyConsumption.set(date, (dailyConsumption.get(date) || 0) + movement.quantity);
      });

      const consumptionValues = Array.from(dailyConsumption.values());
      const totalConsumed = consumptionValues.reduce((sum, val) => sum + val, 0);
      const averageDailyConsumption = totalConsumed / periodDays;
      
      // Calcular desvio padrão
      const mean = averageDailyConsumption;
      const squaredDiffs = consumptionValues.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / consumptionValues.length;
      const standardDeviation = Math.sqrt(variance);

      return {
        averageDailyConsumption,
        monthlyConsumption: averageDailyConsumption * 30,
        annualProjection: averageDailyConsumption * 365,
        standardDeviation
      };
    } catch (error) {
      console.error('Erro ao analisar histórico de consumo:', error);
      return {
        averageDailyConsumption: 0,
        monthlyConsumption: 0,
        annualProjection: 0,
        standardDeviation: 0
      };
    }
  }

  /**
   * Gera sugestões de reposição baseadas em regras e consumo
   */
  async generateReplenishmentSuggestions(): Promise<ReplenishmentSuggestion[]> {
    try {
      // Buscar insumos com estoque baixo
      const { data: supplies, error } = await supabase
        .from('supplies')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('is_active', true);

      if (error) throw error;
      if (!supplies) return [];

      const suggestions: ReplenishmentSuggestion[] = [];

      for (const supply of supplies) {
        // Analisar consumo histórico
        const consumption = await this.analyzeConsumptionHistory(supply.id);
        
        // Calcular ponto de reposição
        const leadTime = supply.supplier?.delivery_time_days || 7;
        const reorderPoint = this.calculateReorderPoint(
          consumption.averageDailyConsumption,
          leadTime,
          3 // dias de estoque de segurança
        );

        // Verificar se precisa repor
        if (supply.current_stock <= reorderPoint) {
          // Calcular quantidade a pedir
          const eoq = this.calculateEOQ(
            consumption.annualProjection,
            50, // custo fixo por pedido
            0.25, // taxa de manutenção
            supply.unit_cost || 1
          );

          const suggestedQuantity = Math.max(
            eoq,
            reorderPoint * 2 - supply.current_stock // garantir estoque para 2 ciclos
          );

          const estimatedCost = suggestedQuantity * (supply.unit_cost || 0);

          // Determinar urgência
          let urgency: ReplenishmentSuggestion['urgency'] = 'low';
          let reason = 'Estoque em nível normal de reposição';

          if (supply.current_stock === 0) {
            urgency = 'critical';
            reason = 'Estoque zerado - reposição urgente necessária';
          } else if (supply.current_stock < reorderPoint * 0.5) {
            urgency = 'high';
            reason = 'Estoque muito baixo - risco de ruptura';
          } else if (supply.current_stock < reorderPoint) {
            urgency = 'medium';
            reason = 'Estoque abaixo do ponto de reposição';
          }

          suggestions.push({
            supply,
            currentStock: supply.current_stock,
            reorderPoint,
            suggestedQuantity,
            estimatedCost,
            urgency,
            reason,
            supplier: supply.supplier
          });
        }
      }

      // Ordenar por urgência
      return suggestions.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
    } catch (error) {
      console.error('Erro ao gerar sugestões de reposição:', error);
      return [];
    }
  }

  /**
   * Cria pedido de compra automaticamente
   */
  async createAutomaticPurchaseOrder(
    suggestions: ReplenishmentSuggestion[]
  ): Promise<PurchaseOrder> {
    try {
      // Agrupar por fornecedor
      const supplierGroups = new Map<string, ReplenishmentSuggestion[]>();
      
      suggestions.forEach(suggestion => {
        const supplierId = suggestion.supplier?.id || 'unknown';
        if (!supplierGroups.has(supplierId)) {
          supplierGroups.set(supplierId, []);
        }
        supplierGroups.get(supplierId)!.push(suggestion);
      });

      // Criar pedido para cada fornecedor
      const orders: PurchaseOrder[] = [];
      
      for (const [supplierId, items] of supplierGroups.entries()) {
        if (supplierId === 'unknown') continue;

        const totalAmount = items.reduce((sum, item) => sum + item.estimatedCost, 0);
        
        // Criar pedido
        const { data: order, error: orderError } = await supabase
          .from('purchase_orders')
          .insert({
            supplier_id: supplierId,
            status: 'pending',
            total_amount: totalAmount,
            requested_by: (await supabase.auth.getUser()).data.user?.id,
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: `Pedido automático gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            is_auto_generated: true
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Adicionar itens ao pedido
        const orderItems = items.map(item => ({
          purchase_order_id: order.id,
          supply_id: item.supply.id,
          quantity_requested: item.suggestedQuantity,
          unit_cost: item.supply.unitCost || 0,
          total_cost: item.estimatedCost
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Verificar se pode aprovar automaticamente
        const autoApproveLimit = 5000; // R$ 5.000,00
        if (totalAmount <= autoApproveLimit) {
          await this.autoApprovePurchaseOrder(order.id);
          order.status = 'approved' as OrderStatus;
        } else {
          await this.createApprovalWorkflow(order.id, totalAmount);
        }

        orders.push(order);
      }

      return orders[0]; // Retornar o primeiro pedido criado
    } catch (error) {
      console.error('Erro ao criar pedido automático:', error);
      throw error;
    }
  }

  /**
   * Aprova pedido automaticamente
   */
  async autoApprovePurchaseOrder(orderId: string): Promise<void> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'approved',
          approved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Criar registro de aprovação
      await supabase
        .from('purchase_approvals')
        .insert({
          purchase_order_id: orderId,
          approver_id: userId,
          approval_level: 1,
          status: 'approved',
          comments: 'Aprovado automaticamente - valor dentro do limite',
          approved_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Erro ao aprovar pedido automaticamente:', error);
      throw error;
    }
  }

  /**
   * Cria workflow de aprovação baseado no valor
   */
  async createApprovalWorkflow(orderId: string, totalAmount: number): Promise<void> {
    try {
      const approvalLevels = this.determineApprovalLevels(totalAmount);
      
      for (const level of approvalLevels) {
        await supabase
          .from('purchase_approvals')
          .insert({
            purchase_order_id: orderId,
            approver_id: null, // Será preenchido quando alguém aprovar
            approval_level: level,
            status: 'pending',
            comments: null
          });
      }

      // Notificar aprovadores (implementar sistema de notificação)
      await this.notifyApprovers(orderId, totalAmount, approvalLevels[0]);
      
    } catch (error) {
      console.error('Erro ao criar workflow de aprovação:', error);
      throw error;
    }
  }

  /**
   * Determina níveis de aprovação baseado no valor
   */
  determineApprovalLevels(totalAmount: number): number[] {
    if (totalAmount <= 5000) {
      return [1]; // Apenas supervisor
    } else if (totalAmount <= 20000) {
      return [1, 2]; // Supervisor + Gerente
    } else {
      return [1, 2, 3]; // Supervisor + Gerente + Diretor
    }
  }

  /**
   * Notifica aprovadores sobre pedido pendente
   */
  async notifyApprovers(orderId: string, totalAmount: number, level: number): Promise<void> {
    // Implementar sistema de notificação
    // Por enquanto, apenas log
    console.log(`Notificando aprovadores de nível ${level} sobre pedido ${orderId} no valor de R$ ${totalAmount.toFixed(2)}`);
  }

  /**
   * Processa aprovação de pedido
   */
  async approvePurchaseOrder(
    orderId: string,
    approverId: string,
    comments?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar aprovações pendentes
      const { data: pendingApprovals, error: fetchError } = await supabase
        .from('purchase_approvals')
        .select('*')
        .eq('purchase_order_id', orderId)
        .eq('status', 'pending')
        .order('approval_level', { ascending: true });

      if (fetchError) throw fetchError;
      if (pendingApprovals?.length === 0) {
        return { success: false, message: 'Não há aprovações pendentes para este pedido' };
      }

      // Aprovar o nível atual
      const currentLevel = pendingApprovals[0];
      const { error: approvalError } = await supabase
        .from('purchase_approvals')
        .update({
          approver_id: approverId,
          status: 'approved',
          comments,
          approved_at: new Date().toISOString()
        })
        .eq('id', currentLevel.id);

      if (approvalError) throw approvalError;

      // Verificar se há mais níveis pendentes
      if (pendingApprovals.length === 1) {
        // Última aprovação - aprovar o pedido
        const { error: orderError } = await supabase
          .from('purchase_orders')
          .update({
            status: 'approved',
            approved_by: approverId,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (orderError) throw orderError;

        return { success: true, message: 'Pedido aprovado com sucesso' };
      } else {
        // Notificar próximo nível
        await this.notifyApprovers(orderId, 0, pendingApprovals[1].approval_level);
        return { success: true, message: `Aprovação de nível ${currentLevel.approval_level} concluída. Aguardando próximo nível.` };
      }
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
      return { success: false, message: 'Erro ao processar aprovação' };
    }
  }

  /**
   * Rejeita pedido de compra
   */
  async rejectPurchaseOrder(
    orderId: string,
    approverId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Atualizar status do pedido
      const { error: orderError } = await supabase
        .from('purchase_orders')
        .update({
          status: 'cancelled',
          notes: `Rejeitado: ${reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Registrar rejeição
      await supabase
        .from('purchase_approvals')
        .update({
          approver_id: approverId,
          status: 'rejected',
          comments: reason,
          approved_at: new Date().toISOString()
        })
        .eq('purchase_order_id', orderId)
        .eq('status', 'pending');

      return { success: true, message: 'Pedido rejeitado com sucesso' };
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error);
      return { success: false, message: 'Erro ao rejeitar pedido' };
    }
  }

  /**
   * Executa verificação diária de reposição
   */
  async runDailyReplenishmentCheck(): Promise<{
    suggestionsCount: number;
    ordersCreated: number;
    totalValue: number;
  }> {
    try {
      
      
      // Gerar sugestões
      const suggestions = await this.generateReplenishmentSuggestions();
      

      // Filtrar apenas urgentes
      const urgentSuggestions = suggestions.filter(s => 
        s.urgency === 'critical' || s.urgency === 'high'
      );

      if (urgentSuggestions.length === 0) {
        return { suggestionsCount: suggestions.length, ordersCreated: 0, totalValue: 0 };
      }

      // Criar pedidos automáticos para itens urgentes
      const order = await this.createAutomaticPurchaseOrder(urgentSuggestions);
      
      const totalValue = urgentSuggestions.reduce((sum, s) => sum + s.estimatedCost, 0);

      console.log(`Pedido automático criado: ${order.id} - Valor: R$ ${totalValue.toFixed(2)}`);

      return {
        suggestionsCount: suggestions.length,
        ordersCreated: 1,
        totalValue
      };
    } catch (error) {
      console.error('Erro na verificação diária:', error);
      return { suggestionsCount: 0, ordersCreated: 0, totalValue: 0 };
    }
  }

  /**
   * Salva ou atualiza regras de reposição
   */
  async saveReplenishmentRule(rule: Partial<ReplenishmentRule>): Promise<ReplenishmentRule> {
    try {
      const { data, error } = await supabase
        .from('auto_replenishment_rules')
        .upsert({
          supply_id: rule.supplyId,
          is_enabled: rule.isEnabled ?? true,
          reorder_point: rule.reorderPoint || 0,
          economic_order_quantity: rule.economicOrderQuantity || 0,
          max_stock_level: rule.maxStockLevel,
          auto_approve_limit: rule.autoApproveLimit,
          preferred_supplier_id: rule.preferredSupplierId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao salvar regra de reposição:', error);
      throw error;
    }
  }

  /**
   * Busca regras de reposição
   */
  async getReplenishmentRules(supplyId?: string): Promise<ReplenishmentRule[]> {
    try {
      let query = supabase
        .from('auto_replenishment_rules')
        .select(`
          *,
          supply:supplies(*),
          preferred_supplier:suppliers(*)
        `);

      if (supplyId) {
        query = query.eq('supply_id', supplyId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar regras de reposição:', error);
      return [];
    }
  }
}

// Exportar instância singleton
export const purchaseAutomationService = new PurchaseAutomationService();

// Exportar tipos
export type {
  ReplenishmentRule,
  ReplenishmentSuggestion,
  ConsumptionData,
  ApprovalWorkflow
};
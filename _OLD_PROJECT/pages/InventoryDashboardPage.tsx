// pages/InventoryDashboardPage.tsx
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { InventoryItem, InventoryMetrics, Supplier, InventoryCategory, InventoryMovementType } from '../types';
import * as inventoryService from '../services/inventoryService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import { DollarSign, Package, AlertTriangle, PackagePlus } from 'lucide-react';
import ItemCard from '../components/inventory/ItemCard';
import StockMovementModal from '../components/inventory/StockMovementModal';
import ItemFormModal from '../components/inventory/ItemFormModal';

// 🚀 Componente memoizado para StatCard
const StatCard = memo<{ title: string; value: string | number; icon: React.ReactNode }>(
  ({ title, value, icon }) => (
    <div className="bg-white p-lg rounded-lg shadow-cardHover hover:shadow-cardActive transition-all duration-200 border border-neutral-border">
        <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-lg flex items-center justify-center mr-4 border-2 border-primary">{icon}</div>
            <div>
                <p className="text-3xl font-bold text-neutral-text">{value}</p>
                <p className="text-sm font-medium text-neutral-textSecondary">{title}</p>
            </div>
        </div>
    </div>
  )
);
StatCard.displayName = 'StatCard';

const InventoryDashboardPage: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal States
    const [movementModal, setMovementModal] = useState<{ isOpen: boolean, item: InventoryItem | null, type: InventoryMovementType }>({ isOpen: false, item: null, type: 'saida' });
    const [itemFormModal, setItemFormModal] = useState<{ isOpen: boolean, item?: InventoryItem }>({ isOpen: false });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [itemsData, metricsData, suppliersData, categoriesData] = await Promise.all([
                inventoryService.getItems(),
                inventoryService.getDashboardMetrics(),
                inventoryService.getSuppliers(),
                inventoryService.getCategories(),
            ]);
            setItems(itemsData);
            setMetrics(metricsData);
            setSuppliers(suppliersData);
            setCategories(categoriesData);
        } catch (error) {
            showToast('Erro ao carregar dados do inventário.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenMovementModal = (item: InventoryItem, type: MovementType) => {
        setMovementModal({ isOpen: true, item, type });
    };

    const handleSaveMovement = async (itemId: string, type: MovementType, quantity: number, reason: string) => {
        try {
            await inventoryService.addStockMovement(itemId, type, quantity, reason);
            showToast('Movimentação de estoque registrada!', 'success');
            setMovementModal({ isOpen: false, item: null, type: 'saida' });
            fetchData(); // Refresh all data
        } catch (error: any) {
            showToast(error.message || 'Falha ao registrar movimentação.', 'error');
        }
    };

    const handleSaveItem = async (itemData: Omit<InventoryItem, 'id'> & { id?: string }) => {
        try {
            await inventoryService.saveItem(itemData);
            showToast(itemData.id ? 'Item atualizado!' : 'Item adicionado!', 'success');
            setItemFormModal({ isOpen: false });
            fetchData();
        } catch (error) {
            showToast('Falha ao salvar o item.', 'error');
        }
    };

    // 🚀 Memoização de filtros pesados
    const criticalItems = useMemo(
        () => items.filter(item => metrics?.criticalAlerts.some(alert => alert.itemId === item.id)),
        [items, metrics?.criticalAlerts]
    );

    const otherItems = useMemo(
        () => items.filter(item => !metrics?.criticalAlerts.some(alert => alert.itemId === item.id)),
        [items, metrics?.criticalAlerts]
    );

    if (isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    return (
        <>
            <PageHeader title="Painel de Insumos" subtitle="Controle o estoque e receba alertas sobre seus suprimentos.">
                 <button onClick={() => setItemFormModal({ isOpen: true })} className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-md py-sm text-sm font-medium text-white shadow-card hover:bg-teal-600">
                    <PackagePlus className="w-5 h-5 mr-sm" />
                    Novo Item
                </button>
            </PageHeader>
            
            <StockMovementModal
                isOpen={movementModal.isOpen}
                onClose={() => setMovementModal({ isOpen: false, item: null, type: 'saida' })}
                onSave={handleSaveMovement}
                item={movementModal.item}
                movementType={movementModal.type}
            />

            <ItemFormModal
                isOpen={itemFormModal.isOpen}
                onClose={() => setItemFormModal({ isOpen: false })}
                onSave={handleSaveItem}
                itemToEdit={itemFormModal.item}
                suppliers={suppliers}
                categories={categories}
            />

            <div className="space-y-smxl">
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
                    <StatCard title="Valor Total do Estoque" value={`R$ ${metrics?.totalValue.toFixed(2)}`} icon={<DollarSign />} />
                    <StatCard title="Itens no Inventário" value={metrics?.totalItems || 0} icon={<Package />} />
                    <StatCard title="Itens em Nível Baixo" value={metrics?.lowStockItems || 0} icon={<AlertTriangle />} />
                    <StatCard title="Itens Próximos do Venc." value={metrics?.expiringSoon || 0} icon={<AlertTriangle />} />
                </div>

                {/* Critical Alerts */}
                {criticalItems.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-error mb-md">Alertas Críticos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
                            {criticalItems.map(item => (
                                <ItemCard 
                                    key={item.id}
                                    item={item}
                                    suppliers={suppliers}
                                    categories={categories}
                                    onAddStock={() => handleOpenMovementModal(item, 'entrada')}
                                    onRemoveStock={() => handleOpenMovementModal(item, 'saida')}
                                    onEdit={() => setItemFormModal({ isOpen: true, item })}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* All Items */}
                <div>
                    <h2 className="text-xl font-bold text-neutral-text mb-md">Todos os Itens</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
                        {otherItems.map(item => (
                             <ItemCard 
                                key={item.id}
                                item={item}
                                suppliers={suppliers}
                                categories={categories}
                                onAddStock={() => handleOpenMovementModal(item, 'entrada')}
                                onRemoveStock={() => handleOpenMovementModal(item, 'saida')}
                                onEdit={() => setItemFormModal({ isOpen: true, item })}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InventoryDashboardPage;
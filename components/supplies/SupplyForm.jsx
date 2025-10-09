// components/supplies/SupplyForm.tsx
import React, { useState, useEffect } from 'react';
import { useSuppliers } from '../../hooks/useSupplies';
import { X, Save, Package } from 'lucide-react';
const SupplyForm = ({ supply, onSave, onCancel, isLoading = false }) => {
    const { suppliers } = useSuppliers();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'equipamentos',
        subcategory: '',
        brand: '',
        model: '',
        unitOfMeasure: 'unidade',
        minimumStock: 0,
        maximumStock: undefined,
        unitCost: undefined,
        supplierId: undefined,
        barcode: '',
        expirationDate: undefined,
        storageLocation: '',
        requiresPrescription: false
    });
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (supply) {
            setFormData({
                name: supply.name,
                description: supply.description || '',
                category: supply.category,
                subcategory: supply.subcategory || '',
                brand: supply.brand || '',
                model: supply.model || '',
                unitOfMeasure: supply.unitOfMeasure,
                minimumStock: supply.minimumStock,
                maximumStock: supply.maximumStock,
                unitCost: supply.unitCost,
                supplierId: supply.supplierId,
                barcode: supply.barcode || '',
                expirationDate: supply.expirationDate,
                storageLocation: supply.storageLocation || '',
                requiresPrescription: supply.requiresPrescription
            });
        }
    }, [supply]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }
        if (!formData.category) {
            newErrors.category = 'Categoria é obrigatória';
        }
        if (!formData.unitOfMeasure.trim()) {
            newErrors.unitOfMeasure = 'Unidade de medida é obrigatória';
        }
        if (formData.minimumStock < 0) {
            newErrors.minimumStock = 'Estoque mínimo deve ser maior ou igual a zero';
        }
        if (formData.maximumStock !== undefined && formData.maximumStock < formData.minimumStock) {
            newErrors.maximumStock = 'Estoque máximo deve ser maior que o mínimo';
        }
        if (formData.unitCost !== undefined && formData.unitCost < 0) {
            newErrors.unitCost = 'Custo unitário deve ser maior ou igual a zero';
        }
        if (formData.expirationDate && new Date(formData.expirationDate) < new Date()) {
            newErrors.expirationDate = 'Data de vencimento deve ser futura';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const submitData = supply
                ? { id: supply.id, ...formData }
                : formData;
            await onSave(submitData);
        }
        catch (error) {
            console.error('Erro ao salvar insumo:', error);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };
    const categoryOptions = [
        { value: 'equipamentos', label: 'Equipamentos' },
        { value: 'materiais_descartaveis', label: 'Materiais Descartáveis' },
        { value: 'medicamentos_topicos', label: 'Medicamentos Tópicos' },
        { value: 'materiais_limpeza', label: 'Materiais de Limpeza' },
        { value: 'materiais_escritorio', label: 'Materiais de Escritório' },
        { value: 'equipamentos_protecao', label: 'Equipamentos de Proteção' }
    ];
    const unitOptions = [
        { value: 'unidade', label: 'Unidade' },
        { value: 'caixa', label: 'Caixa' },
        { value: 'litro', label: 'Litro' },
        { value: 'kg', label: 'Quilograma' },
        { value: 'grama', label: 'Grama' },
        { value: 'metro', label: 'Metro' },
        { value: 'cm', label: 'Centímetro' },
        { value: 'frasco', label: 'Frasco' },
        { value: 'pacote', label: 'Pacote' },
        { value: 'rolo', label: 'Rolo' }
    ];
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-3"/>
            <h2 className="text-xl font-semibold text-gray-900">
              {supply ? 'Editar Insumo' : 'Adicionar Insumo'}
            </h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6"/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Insumo *
                </label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'}`} placeholder="Ex: Eletrodos Autoadesivos"/>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Descrição detalhada do insumo..."/>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300'}`}>
                  {categoryOptions.map(option => (<option key={option.value} value={option.value}>
                      {option.label}
                    </option>))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Subcategoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria
                </label>
                <input type="text" value={formData.subcategory} onChange={(e) => handleInputChange('subcategory', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Eletroterapia"/>
              </div>
            </div>
          </div>

          {/* Detalhes do Produto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Detalhes do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input type="text" value={formData.brand} onChange={(e) => handleInputChange('brand', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: MedSupply"/>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input type="text" value={formData.model} onChange={(e) => handleInputChange('model', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: EL-001"/>
              </div>

              {/* Código de Barras */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Barras
                </label>
                <input type="text" value={formData.barcode} onChange={(e) => handleInputChange('barcode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: 7891234567890"/>
              </div>

              {/* Fornecedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <select value={formData.supplierId || ''} onChange={(e) => handleInputChange('supplierId', e.target.value || undefined)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map(supplier => (<option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>))}
                </select>
              </div>
            </div>
          </div>

          {/* Controle de Estoque */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Controle de Estoque</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Unidade de Medida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Medida *
                </label>
                <select value={formData.unitOfMeasure} onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.unitOfMeasure ? 'border-red-300' : 'border-gray-300'}`}>
                  {unitOptions.map(option => (<option key={option.value} value={option.value}>
                      {option.label}
                    </option>))}
                </select>
                {errors.unitOfMeasure && <p className="mt-1 text-sm text-red-600">{errors.unitOfMeasure}</p>}
              </div>

              {/* Estoque Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo *
                </label>
                <input type="number" min="0" value={formData.minimumStock} onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.minimumStock ? 'border-red-300' : 'border-gray-300'}`}/>
                {errors.minimumStock && <p className="mt-1 text-sm text-red-600">{errors.minimumStock}</p>}
              </div>

              {/* Estoque Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Máximo
                </label>
                <input type="number" min="0" value={formData.maximumStock || ''} onChange={(e) => handleInputChange('maximumStock', e.target.value ? parseInt(e.target.value) : undefined)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maximumStock ? 'border-red-300' : 'border-gray-300'}`}/>
                {errors.maximumStock && <p className="mt-1 text-sm text-red-600">{errors.maximumStock}</p>}
              </div>
            </div>
          </div>

          {/* Informações Financeiras e Adicionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informações Adicionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custo Unitário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custo Unitário (R$)
                </label>
                <input type="number" min="0" step="0.01" value={formData.unitCost || ''} onChange={(e) => handleInputChange('unitCost', e.target.value ? parseFloat(e.target.value) : undefined)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.unitCost ? 'border-red-300' : 'border-gray-300'}`}/>
                {errors.unitCost && <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>}
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input type="date" value={formData.expirationDate || ''} onChange={(e) => handleInputChange('expirationDate', e.target.value || undefined)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expirationDate ? 'border-red-300' : 'border-gray-300'}`}/>
                {errors.expirationDate && <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>}
              </div>

              {/* Local de Armazenamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local de Armazenamento
                </label>
                <input type="text" value={formData.storageLocation} onChange={(e) => handleInputChange('storageLocation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Estoque A - Prateleira 2"/>
              </div>

              {/* Requer Prescrição */}
              <div className="flex items-center">
                <input type="checkbox" id="requiresPrescription" checked={formData.requiresPrescription} onChange={(e) => handleInputChange('requiresPrescription', e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-700">
                  Requer prescrição médica
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? (<>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>) : (<>
                  <Save className="h-4 w-4 mr-2"/>
                  {supply ? 'Atualizar' : 'Salvar'}
                </>)}
            </button>
          </div>
        </form>
      </div>
    </div>);
};
export default SupplyForm;

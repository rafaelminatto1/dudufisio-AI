import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle, Calendar, FileText, Activity } from 'lucide-react';
import { BodyPoint } from '../types';

interface BodyPointModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (point: Omit<BodyPoint, 'id' | 'created_at'>) => Promise<void>;
    onUpdate?: (id: string, point: Partial<BodyPoint>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    point?: Partial<BodyPoint> | null;
    isEditing?: boolean;
}

const PAIN_TYPES = [
    'Dor muscular',
    'Dor articular',
    'Dor neuropática',
    'Dor inflamatória',
    'Dor crônica',
    'Dor aguda',
    'Rigidez',
    'Espasmo',
    'Formigamento',
    'Queimação',
    'Pontada',
    'Latejamento'
];

const PAIN_DESCRIPTIONS = [
    'Dor constante',
    'Dor intermitente',
    'Piora com movimento',
    'Melhora com repouso',
    'Irradia para outras regiões',
    'Associada a formigamento',
    'Limitação de movimento',
    'Rigidez matinal',
    'Piora à noite',
    'Melhora com calor',
    'Melhora com frio',
    'Relacionada ao trabalho'
];

const BodyPointModal: React.FC<BodyPointModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    onDelete,
    point,
    isEditing = false
}) => {
    const [formData, setFormData] = useState<Omit<BodyPoint, 'id' | 'created_at'>>({
        patient_id: '',
        x_position: 0,
        y_position: 0,
        body_side: 'front',
        pain_level: 5,
        pain_type: 'Dor muscular',
        description: '',
        created_by: 'current_user'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (point) {
            setFormData({
                patient_id: point.patient_id || '',
                x_position: point.x_position || 0,
                y_position: point.y_position || 0,
                body_side: point.body_side || 'front',
                pain_level: point.pain_level || 5,
                pain_type: point.pain_type || 'Dor muscular',
                description: point.description || '',
                created_by: point.created_by || 'current_user'
            });
        }
    }, [point]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditing && point?.id && onUpdate) {
                await onUpdate(point.id, formData);
            } else {
                await onSave(formData);
            }
            onClose();
        } catch (error) {
            console.error('Erro ao salvar ponto:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!point?.id || !onDelete) return;

        const confirmed = window.confirm('Tem certeza que deseja remover este ponto de dor?');
        if (!confirmed) return;

        setIsLoading(true);
        try {
            await onDelete(point.id);
            onClose();
        } catch (error) {
            console.error('Erro ao deletar ponto:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPainIntensityLabel = (level: number) => {
        if (level <= 3) return 'Leve';
        if (level <= 6) return 'Moderada';
        if (level <= 8) return 'Intensa';
        return 'Severa';
    };

    const getPainColor = (level: number) => {
        if (level <= 3) return 'text-green-600 bg-green-50';
        if (level <= 6) return 'text-yellow-600 bg-yellow-50';
        if (level <= 8) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
                            {isEditing ? 'Editar' : 'Adicionar'} Ponto de Dor
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {point?.body_side === 'front' ? 'Vista frontal' : 'Vista das costas'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </header>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Nível de Dor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Nível de Dor (0-10)
                        </label>
                        <div className="space-y-3">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={formData.pain_level}
                                onChange={(e) => setFormData({ ...formData, pain_level: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #22c55e 0%, #eab308 30%, #f97316 70%, #ef4444 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>2</span>
                                <span>4</span>
                                <span>6</span>
                                <span>8</span>
                                <span>10</span>
                            </div>
                            <div className={`text-center p-3 rounded-lg font-semibold ${getPainColor(formData.pain_level)}`}>
                                Dor {formData.pain_level}/10 - {getPainIntensityLabel(formData.pain_level)}
                            </div>
                        </div>
                    </div>

                    {/* Tipo de Dor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo de Dor
                        </label>
                        <select
                            value={formData.pain_type}
                            onChange={(e) => setFormData({ ...formData, pain_type: e.target.value })}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            required
                        >
                            {PAIN_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Descrição e Observações
                        </label>
                        <div className="space-y-2">
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva as características da dor, quando aparece, fatores que melhoram ou pioram..."
                                rows={4}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                            />

                            {/* Sugestões Rápidas */}
                            <div className="flex flex-wrap gap-2">
                                {PAIN_DESCRIPTIONS.slice(0, showAdvanced ? PAIN_DESCRIPTIONS.length : 6).map((desc) => (
                                    <button
                                        key={desc}
                                        type="button"
                                        onClick={() => {
                                            const currentDesc = formData.description;
                                            const newDesc = currentDesc ? `${currentDesc}, ${desc.toLowerCase()}` : desc;
                                            setFormData({ ...formData, description: newDesc });
                                        }}
                                        className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                                    >
                                        + {desc}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="px-3 py-1 text-xs bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 transition-colors"
                                >
                                    {showAdvanced ? '- Menos' : '+ Mais opções'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Informações da Localização */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                            <Activity className="w-4 h-4 mr-2" />
                            Localização
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div>
                                <span className="font-medium">Vista:</span> {formData.body_side === 'front' ? 'Frontal' : 'Costas'}
                            </div>
                            <div>
                                <span className="font-medium">Posição:</span> X: {formData.x_position.toFixed(1)}%, Y: {formData.y_position.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Histórico (se editando) */}
                    {isEditing && point?.created_at && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Informações do Registro
                            </h4>
                            <div className="text-sm text-slate-600">
                                <p>Criado em: {new Date(point.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <footer className="flex items-center justify-between p-6 border-t">
                    <div>
                        {isEditing && onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Atualizar' : 'Salvar'} Ponto
                                </>
                            )}
                        </button>
                    </div>
                </footer>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #0ea5e9;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #0ea5e9;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default BodyPointModal;
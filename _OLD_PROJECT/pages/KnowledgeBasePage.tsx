
import React, { useState, useMemo } from 'react';
import { Library, Plus, Search, BrainCircuit, TestTube2, Workflow, BookCopy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { KnowledgeBaseEntry } from '../types';
import { knowledgeService } from '../services/ai/knowledgeService';
import KnowledgeContributionModal from '../components/KnowledgeContributionModal';

const KnowledgeRow: React.FC<{ entry: KnowledgeBaseEntry, onEdit: (entry: KnowledgeBaseEntry) => void }> = ({ entry, onEdit }) => {
    const typeInfo = {
        protocol: { icon: Workflow, color: 'bg-primary-light text-blue-800', label: 'Protocolo' },
        exercise: { icon: TestTube2, color: 'bg-success-light text-success', label: 'Exercício' },
        technique: { icon: BrainCircuit, color: 'bg-purple-100 text-purple-800', label: 'Técnica' },
        case: { icon: BookCopy, color: 'bg-warning-light text-yellow-800', label: 'Caso Clínico' },
    };
    
    // Validação de segurança: usa 'technique' como fallback se o tipo não existir
    const safeType = entry.type && typeInfo[entry.type] ? entry.type : 'technique';
    const Icon = typeInfo[safeType].icon;
    const typeLabel = typeInfo[safeType].label;
    const typeColor = typeInfo[safeType].color;

    return (
        <tr className="border-b border-neutral-border hover:bg-neutral-bgAlt cursor-pointer" onClick={() => onEdit(entry)}>
            <td className="p-md whitespace-nowrap">
                <div className="flex items-center">
                    <div className={`p-sm rounded-full mr-4 ${typeColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-neutral-text">{entry.title}</div>
                        <div className="text-sm text-neutral-textSecondary">{typeLabel}</div>
                    </div>
                </div>
            </td>
            <td className="p-md text-sm text-neutral-textSecondary max-w-md truncate" title={entry.content}>{entry.content}</td>
            <td className="p-md whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                    {entry.tags.map(tag => (
                        <span key={tag} className="px-sm py-0.5 text-xs bg-neutral-bgDark text-neutral-text rounded-full">{tag}</span>
                    ))}
                </div>
            </td>
        </tr>
    );
};


const KnowledgeBasePage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState<KnowledgeBaseEntry[]>(knowledgeService.getAll());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<KnowledgeBaseEntry | undefined>(undefined);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, entries]);

    const handleOpenModal = (entry?: KnowledgeBaseEntry) => {
        setEntryToEdit(entry);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEntryToEdit(undefined);
    };

    const handleSave = (entryData: Omit<KnowledgeBaseEntry, 'id'>) => {
        if (entryToEdit) {
            knowledgeService.update({ ...entryData, id: entryToEdit.id });
        } else {
            knowledgeService.add(entryData);
        }
        setEntries(knowledgeService.getAll()); // Refresh list
        handleCloseModal();
    };

    return (
        <>
            <PageHeader
                title="Base de Conhecimento"
                subtitle="Gerencie o cérebro da sua clínica: protocolos, exercícios e técnicas."
            >
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-md py-sm text-sm font-medium text-white shadow-card hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                    <Plus className="-ml-xs mr-sm h-5 w-5" />
                    Adicionar Conhecimento
                </button>
            </PageHeader>

            <KnowledgeContributionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                entryToEdit={entryToEdit}
            />

            <div className="bg-white p-lg rounded-cardLarge shadow-card">
                <div className="flex items-center justify-between mb-md">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
                        <input
                            type="text"
                            placeholder="Buscar por título, conteúdo ou tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-neutral-bgAlt">
                            <tr>
                                <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Título</th>
                                <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Conteúdo (Prévia)</th>
                                <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredEntries.map((entry: any) => (
                                <KnowledgeRow key={entry.id} entry={entry} onEdit={handleOpenModal} />
                            ))}
                        </tbody>
                    </table>
                     {filteredEntries.length === 0 && (
                        <div className="text-center p-10">
                            <Library className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-sm text-sm font-medium text-neutral-text">Nenhum conhecimento encontrado</h3>
                            <p className="mt-xs text-sm text-neutral-textSecondary">Tente ajustar sua busca ou adicione um novo conhecimento.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default KnowledgeBasePage;

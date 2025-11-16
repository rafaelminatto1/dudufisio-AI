


// pages/ClinicalLibraryPage.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle2, Search } from 'lucide-react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import useMaterialCategories from '../hooks/useMaterialCategories';
import PageLoader from '../components/ui/PageLoader';
import PageHeader from '../components/PageHeader';
import type { MaterialCategory, Material } from '../types';

interface AccordionItemProps {
    category: MaterialCategory;
    isOpen: boolean;
    onToggle: () => void;
}

type MaterialWithFile = Material & { fileUrl?: string; fileType?: string };

const AccordionItem: React.FC<AccordionItemProps> = ({ category, isOpen, onToggle }) => (
    <div className="border border-neutral-border rounded-lg overflow-hidden bg-white shadow-card">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center p-md bg-neutral-bgAlt hover:bg-neutral-bgDark transition-colors duration-200"
            aria-expanded={isOpen}
            aria-controls={`category-panel-${category.id}`}
        >
            <h2 className="text-lg font-semibold text-neutral-text">{category.name}</h2>
            <ChevronDown className={`transform transition-transform duration-300 text-teal-600 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
            <>
              {category.description && (
                <div className="px-md py-sm bg-neutral-bgAlt text-sm text-neutral-textSecondary border-b border-neutral-border">
                  {category.description}
                </div>
              )}
              <ul
                id={`category-panel-${category.id}`}
                role="region"
                className="p-md bg-white"
              >
                {category.materials.map(material => {
                    const typedMaterial = material as MaterialWithFile;
                    const updatedAt = material.updatedAt
                        ? new Date(material.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                        : null;

                    return (
                    <li key={material.id} className="mb-sm last:mb-0">
                        <ReactRouterDOM.Link
                            to={`/materials/${material.id}`}
                            className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-center md:justify-between p-md hover:bg-neutral-bgAlt rounded-md cursor-pointer transition-colors duration-200 w-full"
                        >
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-teal-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-neutral-text font-medium block">{material.name}</span>
                                    {material.description && (
                                        <p className="text-sm text-neutral-textSecondary mt-1 line-clamp-2">
                                            {material.description}
                                        </p>
                                    )}
                                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-textTertiary">
                                        <span className="uppercase tracking-wide font-semibold text-teal-600">
                                            {material.type}
                                        </span>
                                        {updatedAt && (
                                            <span>{`Atualizado em ${updatedAt}`}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {typedMaterial.fileType && (
                                    <span className="text-xs uppercase tracking-wide text-neutral-textTertiary bg-neutral-bgAlt px-2 py-1 rounded-md">
                                        {typedMaterial.fileType}
                                    </span>
                                )}
                                {typedMaterial.fileUrl && (
                                    <a
                                        href={typedMaterial.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        Baixar
                                    </a>
                                )}
                            </div>
                        </ReactRouterDOM.Link>
                    </li>
                )})}
              </ul>
            </>
        )}
    </div>
);


const ClinicalLibraryPage: React.FC = () => {
  const { categories, isLoading, error } = useMaterialCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  useEffect(() => {
      // Open the first category by default on load if not searching
      if(!isLoading && categories && categories.length > 0 && !searchTerm && categories[0]) {
          setOpenCategoryId(categories[0].id);
      }
  }, [isLoading, categories, searchTerm]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
  };

  const filteredCategories = React.useMemo(() => {
      if (!categories) return [];
      if (!searchTerm.trim()) return categories;

      const lowercasedFilter = searchTerm.toLowerCase();
      
      return categories.map(category => ({
        ...category,
        materials: category.materials.filter(material =>
          material.name.toLowerCase().includes(lowercasedFilter)
        ),
      })).filter(category => category.materials.length > 0);
  }, [categories, searchTerm]);

  useEffect(() => {
    // If search filters down to one category, open it.
    if(searchTerm && filteredCategories && filteredCategories.length > 0 && filteredCategories[0]) {
        setOpenCategoryId(filteredCategories[0].id);
    } else if (!searchTerm && categories && categories.length > 0 && categories[0]) {
        setOpenCategoryId(categories[0].id);
    } else {
        setOpenCategoryId(null);
    }
  }, [searchTerm, filteredCategories, categories]);


  // Handle loading state
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <PageHeader
        title="Biblioteca de Materiais"
        subtitle="Seu centro de conhecimento clínico. Encontre protocolos, escalas e materiais para otimizar seus atendimentos."
      />

      {error && (
        <div className="mb-lg border border-warning bg-warning-50 text-warning-dark rounded-cardLarge p-md">
          <p className="font-medium">
            Não foi possível carregar os materiais diretamente do Supabase. Exibindo biblioteca offline.
          </p>
          <p className="text-sm mt-1 opacity-80">
            Detalhes: {error}
          </p>
        </div>
      )}
      
      <div className="mb-xl bg-white p-md rounded-cardLarge shadow-card">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
            <input
                type="text"
                placeholder="Pesquisar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        </div>
      </div>

      <div className="space-y-md">
        {filteredCategories?.map(category => (
          <AccordionItem
            key={category.id}
            category={category}
            isOpen={openCategoryId === category.id}
            onToggle={() => toggleCategory(category.id)}
          />
        ))}
        {filteredCategories?.length === 0 && (
            <div className="text-center p-10 text-neutral-textSecondary bg-white rounded-cardLarge shadow-card">
                Nenhum material encontrado para "{searchTerm}".
            </div>
        )}
      </div>
    </>
  );
};

export default ClinicalLibraryPage;
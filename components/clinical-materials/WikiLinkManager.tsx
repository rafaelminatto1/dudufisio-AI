import React, { useState, useEffect, useRef } from 'react';
import { Link, Plus, Search, ExternalLink, Trash2, Edit } from 'lucide-react';
import { materialLinkService, LinkSearchResult } from '../../services/materialLinkService';
import { MaterialLink, Material } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/useToast';

interface WikiLinkManagerProps {
  materialId: string;
  links: MaterialLink[];
  onLinksChange: (links: MaterialLink[]) => void;
  className?: string;
}

const WikiLinkManager: React.FC<WikiLinkManagerProps> = ({
  materialId,
  links,
  onLinksChange,
  className = ''
}) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LinkSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState<MaterialLink | null>(null);
  const [newLinkText, setNewLinkText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchMaterials();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchMaterials = async () => {
    if (searchQuery.length < 3) return;
    
    setIsLoading(true);
    try {
      const results = await materialLinkService.searchMaterialsForLink(searchQuery, materialId);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching materials:', error);
      showToast('Erro ao buscar materiais', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSelect = async (material: Material, linkText?: string) => {
    try {
      const link = await materialLinkService.createLink({
        fromMaterialId: materialId,
        toMaterialId: material.id,
        linkText: linkText || material.name,
      });
      
      onLinksChange([...links, link]);
      showToast(`Link para "${material.name}" criado`, 'success');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating link:', error);
      showToast('Erro ao criar link', 'error');
    }
  };

  const handleLinkDelete = async (linkId: string) => {
    if (window.confirm('Tem certeza que deseja remover este link?')) {
      try {
        await materialLinkService.deleteLink(linkId);
        onLinksChange(links.filter(link => link.id !== linkId));
        showToast('Link removido com sucesso', 'success');
      } catch (error) {
        console.error('Error deleting link:', error);
        showToast('Erro ao remover link', 'error');
      }
    }
  };

  const handleLinkEdit = (link: MaterialLink) => {
    setEditingLink(link);
    setNewLinkText(link.linkText);
  };

  const handleLinkUpdate = async () => {
    if (!editingLink || !newLinkText.trim()) return;

    try {
      // For now, we'll just update the local state
      // In a real implementation, you'd update the database
      const updatedLinks = links.map(link =>
        link.id === editingLink.id
          ? { ...link, linkText: newLinkText.trim() }
          : link
      );
      
      onLinksChange(updatedLinks);
      setEditingLink(null);
      setNewLinkText('');
      showToast('Link atualizado com sucesso', 'success');
    } catch (error) {
      console.error('Error updating link:', error);
      showToast('Erro ao atualizar link', 'error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleLinkSelect(searchResults[0].material);
      }
    }
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'Protocolo Clínico':
        return 'bg-blue-100 text-blue-800';
      case 'Escala de Avaliação':
        return 'bg-green-100 text-green-800';
      case 'Material Educacional':
        return 'bg-purple-100 text-purple-800';
      case 'Guia de Exercícios':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Links */}
      {links.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Link className="w-4 h-4" />
            Links Relacionados ({links.length})
          </h3>
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Link className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {editingLink?.id === link.id ? (
                        <Input
                          value={newLinkText}
                          onChange={(e) => setNewLinkText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleLinkUpdate()}
                          onBlur={handleLinkUpdate}
                          className="w-48 h-6 text-sm"
                          autoFocus
                        />
                      ) : (
                        link.linkText
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Link para material ID: {link.toMaterialId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {editingLink?.id !== link.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkEdit(link)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkDelete(link.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLinkUpdate}
                      className="h-8 w-8 p-0 text-green-600"
                    >
                      ✓
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Link Section */}
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Link
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <Card className="absolute top-full left-0 mt-2 w-96 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar Materiais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div>
                <Input
                  placeholder="Digite o nome do material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Buscando materiais...</p>
                </div>
              )}

              {/* Search Results */}
              {searchQuery && !isLoading && searchResults.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Resultados ({searchResults.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.material.id}
                        onClick={() => handleLinkSelect(result.material)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {result.material.name}
                            </span>
                            <Badge className={`text-xs ${getMaterialTypeColor(result.material.type)}`}>
                              {result.material.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {result.material.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {result.material.category.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {result.linkCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {result.linkCount} links
                            </span>
                          )}
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchQuery && !isLoading && searchResults.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Nenhum material encontrado para "{searchQuery}"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tente buscar por nome, tipo ou descrição
                  </p>
                </div>
              )}

              {/* Instructions */}
              {!searchQuery && (
                <div className="text-center py-4">
                  <Link className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Digite o nome de um material para criar um link
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Você também pode usar [[Nome do Material]] no editor
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WikiLinkManager;

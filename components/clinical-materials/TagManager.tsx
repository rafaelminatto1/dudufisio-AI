import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag, TrendingUp, Check } from 'lucide-react';
import { materialTagService, TagSearchResult } from '../../services/materialTagService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/useToast';

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  materialId?: string;
  categoryId?: string;
  className?: string;
}

const TagManager: React.FC<TagManagerProps> = ({
  selectedTags,
  onTagsChange,
  materialId,
  categoryId,
  className = ''
}) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TagSearchResult[]>([]);
  const [popularTags, setPopularTags] = useState<TagSearchResult[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPopularTags();
    if (materialId) {
      loadSuggestedTags();
    }
  }, [materialId, categoryId]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchTags();
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

  const loadPopularTags = async () => {
    try {
      const tags = await materialTagService.getPopularTags(10);
      setPopularTags(tags.map(tag => ({
        name: tag.name,
        count: tag.count,
        isPopular: true,
        suggested: false,
      })));
    } catch (error) {
      console.error('Error loading popular tags:', error);
    }
  };

  const loadSuggestedTags = async () => {
    if (!materialId) return;
    
    try {
      const tags = await materialTagService.getSuggestedTags(materialId, categoryId);
      setSuggestedTags(tags);
    } catch (error) {
      console.error('Error loading suggested tags:', error);
    }
  };

  const searchTags = async () => {
    if (searchQuery.length < 2) return;
    
    setIsLoading(true);
    try {
      const results = await materialTagService.searchTags(searchQuery, 8);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tags:', error);
      showToast('Erro ao buscar tags', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
      showToast(`Tag "${tagName}" adicionada`, 'success');
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTagRemove = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
    showToast(`Tag "${tagName}" removida`, 'success');
  };

  const handleCreateNewTag = () => {
    if (newTagName.trim() && !selectedTags.includes(newTagName.trim())) {
      onTagsChange([...selectedTags, newTagName.trim()]);
      setNewTagName('');
      showToast(`Nova tag "${newTagName.trim()}" criada`, 'success');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newTagName.trim()) {
        handleCreateNewTag();
      } else if (searchResults.length > 0) {
        handleTagSelect(searchResults[0].name);
      }
    }
  };

  const displayTags = searchQuery ? searchResults : popularTags;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <Tag className="w-3 h-3" />
            {tag}
            <button
              onClick={() => handleTagRemove(tag)}
              className="ml-1 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Tag Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Tag
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Gerenciar Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div>
              <Input
                placeholder="Buscar tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Create New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Nova tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateNewTag()}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleCreateNewTag}
                disabled={!newTagName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggested Tags */}
            {suggestedTags.length > 0 && !searchQuery && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Sugeridas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Buscando tags...</p>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && !isLoading && displayTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Resultados ({displayTags.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {displayTags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => handleTagSelect(tag.name)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tag.name}</span>
                        {tag.isPopular && (
                          <Badge variant="outline" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        {tag.suggested && (
                          <Badge variant="outline" className="text-xs">
                            Sugerida
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {tag.count} uso{tag.count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {!searchQuery && displayTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Tags Populares
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {displayTags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => handleTagSelect(tag.name)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tag.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Popular
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {tag.count} uso{tag.count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && !isLoading && displayTags.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">
                  Nenhuma tag encontrada para "{searchQuery}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Crie uma nova tag usando o campo acima
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
  );
};

export default TagManager;

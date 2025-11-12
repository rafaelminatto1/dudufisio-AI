import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AppointmentTemplate } from '../../types/appointmentTemplates';
import { appointmentTemplateService } from '../../services/appointmentTemplateService';
import { 
  Plus, 
  Search, 
  Clock, 
  DollarSign, 
  Star, 
  Edit, 
  Trash2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrencyBR } from '../../lib/format';
import { motion } from 'framer-motion';

interface AppointmentTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: AppointmentTemplate) => void;
  onCreateTemplate?: () => void;
}

const AppointmentTemplatesDialog: React.FC<AppointmentTemplatesDialogProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateTemplate
}) => {
  const [templates, setTemplates] = useState<AppointmentTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'most-used' | 'default'>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const allTemplates = await appointmentTemplateService.listTemplates();
    setTemplates(allTemplates);
  };

  const filteredTemplates = templates.filter(template => {
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!template.name.toLowerCase().includes(query) &&
          !template.type.toLowerCase().includes(query) &&
          !template.description?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Filter by category
    if (selectedCategory === 'most-used') {
      return template.usageCount > 0;
    }
    if (selectedCategory === 'default') {
      return template.isDefault;
    }

    return true;
  });

  const handleSelectTemplate = async (template: AppointmentTemplate) => {
    await appointmentTemplateService.incrementUsage(template.id);
    onSelectTemplate(template);
    onClose();
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      await appointmentTemplateService.deleteTemplate(id);
      loadTemplates();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Templates de Agendamento</DialogTitle>
          <DialogDescription>
            Selecione um template para agendar rapidamente ou crie um novo template personalizado
          </DialogDescription>
        </DialogHeader>

        {/* Search and Actions */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {onCreateTemplate && (
            <Button onClick={onCreateTemplate} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Template
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Todos ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="most-used">
              <TrendingUp className="w-4 h-4 mr-2" />
              Mais Usados
            </TabsTrigger>
            <TabsTrigger value="default">
              <Star className="w-4 h-4 mr-2" />
              Padrões
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="flex-1 overflow-auto mt-4">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Zap className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum template encontrado</p>
                <p className="text-sm mt-2">
                  {searchQuery ? 'Tente buscar por outro termo' : 'Crie seu primeiro template'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                        "border-2 hover:border-blue-400"
                      )}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0",
                          `bg-${template.color || 'blue'}-100`
                        )}>
                          {template.icon || '📅'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                                {template.name}
                                {template.isDefault && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </h3>
                              {template.description && (
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            
                            {!template.isDefault && (
                              <button
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>

                          {/* Info Badges */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {template.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                              <Clock className="w-3 h-3" />
                              {template.duration}min
                            </Badge>
                            {template.value && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatCurrencyBR(template.value)}
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Usado {template.usageCount} vezes</span>
                            {template.settings.allowRecurrence && (
                              <span className="text-blue-600">🔄 Permite recorrência</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentTemplatesDialog;



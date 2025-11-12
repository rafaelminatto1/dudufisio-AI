import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { AppointmentTemplate } from '../../types/appointmentTemplates';
import { appointmentTemplateService } from '../../services/appointmentTemplateService';
import { Zap, Clock, DollarSign, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrencyBR } from '../../lib/format';

interface QuickTemplateSelectorProps {
  onSelectTemplate: (template: AppointmentTemplate) => void;
  onViewAll: () => void;
  className?: string;
}

const QuickTemplateSelector: React.FC<QuickTemplateSelectorProps> = ({
  onSelectTemplate,
  onViewAll,
  className
}) => {
  const [mostUsed, setMostUsed] = useState<AppointmentTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadMostUsed();
  }, []);

  const loadMostUsed = async () => {
    const templates = await appointmentTemplateService.getMostUsed(5);
    setMostUsed(templates);
  };

  const handleSelect = async (template: AppointmentTemplate) => {
    await appointmentTemplateService.incrementUsage(template.id);
    onSelectTemplate(template);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2", className)}
        >
          <Zap className="w-4 h-4" />
          <span>Templates Rápidos</span>
          {mostUsed.length > 0 && (
            <Badge variant="outline" className="h-5 px-2 ml-1">
              {mostUsed.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b bg-slate-50">
          <h4 className="font-semibold text-sm">Templates Mais Usados</h4>
          <p className="text-xs text-slate-600 mt-1">
            Clique para agendar rapidamente
          </p>
        </div>

        <div className="max-h-[400px] overflow-auto">
          {mostUsed.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum template usado ainda</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  onViewAll();
                }}
                className="mt-2"
              >
                Ver todos os templates
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {mostUsed.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="w-full text-left p-3 rounded-lg border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0",
                      `bg-${template.color || 'blue'}-100`
                    )}>
                      {template.icon || '📅'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm text-slate-900 truncate">
                          {template.name}
                        </h5>
                        {template.isDefault && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.duration}min
                        </span>
                        {template.value && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrencyBR(template.value)}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 text-xs text-slate-500">
                        Usado {template.usageCount}x
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t bg-slate-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              onViewAll();
            }}
            className="w-full"
          >
            Ver todos os templates
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickTemplateSelector;



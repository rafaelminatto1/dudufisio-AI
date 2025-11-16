import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Protocol, EvidenceLevel, ProtocolCategory } from '@/types';
import { ActionMenu } from '@/components/common/ActionMenu';
import { FileText, Edit, Trash2, Copy, Star, Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtocolCardProps {
  protocol: Protocol;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onCopy?: () => void;
  onApplyToPatient?: () => void;
}

const getCategoryColor = (category: ProtocolCategory) => {
  const colors: Record<ProtocolCategory, string> = {
    [ProtocolCategory.Orthopedic]: 'bg-blue-100 text-blue-700',
    [ProtocolCategory.Neurological]: 'bg-purple-100 text-purple-700',
    [ProtocolCategory.Cardiorespiratory]: 'bg-red-100 text-red-700',
    [ProtocolCategory.Pediatric]: 'bg-pink-100 text-pink-700',
    [ProtocolCategory.Sports]: 'bg-green-100 text-green-700',
    [ProtocolCategory.Geriatric]: 'bg-amber-100 text-amber-700',
    [ProtocolCategory.Oncology]: 'bg-indigo-100 text-indigo-700',
    [ProtocolCategory.Women]: 'bg-rose-100 text-rose-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const getEvidenceBadge = (level: EvidenceLevel) => {
  const colors: Record<EvidenceLevel, string> = {
    [EvidenceLevel.IA]: 'bg-emerald-500',
    [EvidenceLevel.IB]: 'bg-green-500',
    [EvidenceLevel.IIA]: 'bg-blue-500',
    [EvidenceLevel.IIB]: 'bg-cyan-500',
    [EvidenceLevel.III]: 'bg-yellow-500',
    [EvidenceLevel.IV]: 'bg-orange-500',
    [EvidenceLevel.V]: 'bg-red-500',
  };
  return colors[level] || 'bg-gray-500';
};

export function ProtocolCard({
  protocol,
  onClick,
  onEdit,
  onDelete,
  onView,
  onCopy,
  onApplyToPatient,
}: ProtocolCardProps) {
  return (
    <Card className="group cursor-pointer transition-all hover:shadow-lg" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2">{protocol.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className={getCategoryColor(protocol.category)} variant="outline">
                {protocol.category}
              </Badge>
              <Badge
                className={cn('text-white', getEvidenceBadge(protocol.evidenceLevel))}
              >
                Evidência {protocol.evidenceLevel}
              </Badge>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu
              items={[
                {
                  label: 'Visualizar',
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => onView?.(),
                },
                {
                  label: 'Aplicar ao Paciente',
                  icon: <Users className="h-4 w-4" />,
                  onClick: () => onApplyToPatient?.(),
                },
                {
                  label: 'Copiar',
                  icon: <Copy className="h-4 w-4" />,
                  onClick: () => onCopy?.(),
                },
                {
                  label: 'Editar',
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => onEdit?.(),
                  separator: true,
                },
                {
                  label: 'Excluir',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => onDelete?.(),
                  variant: 'destructive',
                },
              ]}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {protocol.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Duração estimada:</span>
            <span className="font-medium">
              {protocol.estimatedDuration.min}-{protocol.estimatedDuration.max}{' '}
              {protocol.estimatedDuration.unit}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Frequência:</span>
            <span className="font-medium">{protocol.frequency}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Usado:</span>
            <span className="font-medium">{protocol.timesUsed}x</span>
          </div>

          {protocol.successRate && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{Math.round(protocol.successRate)}% sucesso</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {protocol.tags && protocol.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {protocol.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {protocol.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{protocol.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

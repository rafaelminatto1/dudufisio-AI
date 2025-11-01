import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/types';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Play, Edit, Trash2, Copy, Share2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  selected?: boolean;
}

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'Muito Fácil';
    case 2:
      return 'Fácil';
    case 3:
      return 'Moderado';
    case 4:
      return 'Difícil';
    case 5:
      return 'Muito Difícil';
    default:
      return 'N/A';
  }
};

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-700';
    case 2:
      return 'bg-blue-100 text-blue-700';
    case 3:
      return 'bg-yellow-100 text-yellow-700';
    case 4:
      return 'bg-orange-100 text-orange-700';
    case 5:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function ExerciseCard({
  exercise,
  onClick,
  onEdit,
  onDelete,
  onPreview,
  onCopy,
  onShare,
  selected = false,
}: ExerciseCardProps) {
  return (
    <Card
      className={cn(
        'group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {exercise.media?.thumbnailUrl ? (
          <img
            src={exercise.media.thumbnailUrl}
            alt={exercise.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
            <Play className="h-12 w-12 text-primary" />
          </div>
        )}
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.();
            }}
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>

        {/* Duration badge */}
        {exercise.media?.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
            {Math.floor(exercise.media.duration / 60)}:
            {String(exercise.media.duration % 60).padStart(2, '0')}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{exercise.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu
              items={[
                {
                  label: 'Ver Detalhes',
                  icon: <Play className="h-4 w-4" />,
                  onClick: () => onPreview?.(),
                },
                {
                  label: 'Copiar',
                  icon: <Copy className="h-4 w-4" />,
                  onClick: () => onCopy?.(),
                },
                {
                  label: 'Compartilhar',
                  icon: <Share2 className="h-4 w-4" />,
                  onClick: () => onShare?.(),
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

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {exercise.category}
            </Badge>
            <Badge className={cn('text-xs', getDifficultyColor(exercise.difficulty))}>
              {getDifficultyLabel(exercise.difficulty)}
            </Badge>
          </div>

          {/* Body parts */}
          {exercise.bodyParts && exercise.bodyParts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {exercise.bodyParts.slice(0, 3).map((part) => (
                <Badge key={part} variant="outline" className="text-xs">
                  {part}
                </Badge>
              ))}
              {exercise.bodyParts.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{exercise.bodyParts.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <p className="text-xs text-muted-foreground">
              🏋️ {exercise.equipment.join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


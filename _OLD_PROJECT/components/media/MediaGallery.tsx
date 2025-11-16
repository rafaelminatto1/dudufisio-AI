/**
 * Galeria de Mídia
 * Visualização e gestão de imagens/vídeos
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Image as ImageIcon, Video, Trash2, Download, Maximize2 } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  name: string;
  uploadedAt: Date;
}

interface MediaGalleryProps {
  items: MediaItem[];
  onDelete?: (id: string) => void;
  onSelect?: (item: MediaItem) => void;
  selectable?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onDelete,
  onSelect,
  selectable = false,
}) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleView = (item: MediaItem) => {
    setSelectedItem(item);
    setShowViewer(true);
  };

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    link.click();
  };

  const handleDelete = (item: MediaItem) => {
    if (confirm(`Deseja excluir "${item.name}"?`)) {
      onDelete?.(item.id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhuma mídia adicionada ainda</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`overflow-hidden ${selectable ? 'cursor-pointer hover:shadow-lg' : ''}`}
            onClick={() => selectable && onSelect?.(item)}
          >
            <div className="relative aspect-square bg-gray-100">
              {item.type === 'image' ? (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(item);
                    }}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type === 'image' ? <ImageIcon className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                    {item.type}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.uploadedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Viewer Modal */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
            {selectedItem?.type === 'image' ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : selectedItem?.type === 'video' ? (
              <video
                src={selectedItem.url}
                controls
                className="max-w-full max-h-[70vh]"
              >
                Seu navegador não suporta vídeo.
              </video>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


// pages/VideoManagementDashboard.tsx
// Dashboard completo de gerenciamento de vídeos com CRUD avançado
import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  Heart,
  Share2,
  Archive,
  Restore,
  Copy,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  SortDesc,
  BarChart3,
  Calendar,
  Tag,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { personalizedVideoCrudService, PersonalizedVideo, VideoFilters, VideoSortOptions } from '../services/personalizedVideoCrudService';
import VideoStatsModal from '../components/video/VideoStatsModal';

const VideoManagementDashboard: React.FC = () => {
  // Estados principais
  const [videos, setVideos] = useState<PersonalizedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<PersonalizedVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados de filtros e busca
  const [filters, setFilters] = useState<VideoFilters>({});
  const [sortOptions, setSortOptions] = useState<VideoSortOptions>({ field: 'generatedAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modais
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Carregar vídeos
  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      const allVideos = await personalizedVideoCrudService.getAllVideos();
      setVideos(allVideos);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros e busca
  const applyFilters = useCallback(async () => {
    try {
      const searchFilters: VideoFilters = {
        ...filters,
        search: searchTerm || undefined
      };
      
      const filtered = await personalizedVideoCrudService.searchVideos(searchFilters, sortOptions);
      setFilteredVideos(filtered);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  }, [filters, searchTerm, sortOptions]);

  // Carregar dados iniciais
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key: keyof VideoFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSortChange = (field: VideoSortOptions['field']) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleSelectVideo = (videoId: string, selected: boolean) => {
    if (selected) {
      setSelectedVideos(prev => [...prev, videoId]);
    } else {
      setSelectedVideos(prev => prev.filter(id => id !== videoId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedVideos(filteredVideos.map(video => video.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const success = await personalizedVideoCrudService.deleteVideo(videoId);
      if (success) {
        await loadVideos();
        setSelectedVideos(prev => prev.filter(id => id !== videoId));
      }
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const success = await personalizedVideoCrudService.deleteMultipleVideos(selectedVideos);
      if (success) {
        await loadVideos();
        setSelectedVideos([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      console.error('Erro ao deletar múltiplos vídeos:', error);
    }
  };

  const handleIncrementViews = async (videoId: string) => {
    await personalizedVideoCrudService.incrementViews(videoId);
    await loadVideos();
  };

  const handleIncrementLikes = async (videoId: string) => {
    await personalizedVideoCrudService.incrementLikes(videoId);
    await loadVideos();
  };

  const handleDuplicate = async (videoId: string) => {
    const duplicated = await personalizedVideoCrudService.duplicateVideo(videoId);
    if (duplicated) {
      await loadVideos();
    }
  };

  const handleArchive = async (videoId: string) => {
    await personalizedVideoCrudService.archiveVideo(videoId);
    await loadVideos();
  };

  const handleRestore = async (videoId: string) => {
    await personalizedVideoCrudService.restoreVideo(videoId);
    await loadVideos();
  };

  const handleExport = async (format: 'json' | 'csv') => {
    const data = await personalizedVideoCrudService.exportVideos(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `videos_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Renderizar card de vídeo
  const renderVideoCard = (video: PersonalizedVideo) => (
    <Card key={video.id} className="relative group">
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={selectedVideos.includes(video.id)}
          onCheckedChange={(checked) => handleSelectVideo(video.id, checked as boolean)}
        />
      </div>
      
      <CardContent className="p-4">
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.exerciseName}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {video.duration}
          </div>
          {video.isPersonalized && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
              🎯 Específico
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">{video.exerciseName}</h3>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">{video.modality}</Badge>
            <Badge variant="secondary" className="text-xs">{video.tool}</Badge>
            <Badge variant={video.status === 'saved' ? 'default' : 'outline'} className="text-xs">
              {video.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {video.views}
              </span>
              <span className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {video.likes}
              </span>
              <span className="flex items-center">
                <Download className="w-3 h-3 mr-1" />
                {video.downloads}
              </span>
            </div>
            <span>{new Date(video.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleIncrementViews(video.id)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleIncrementLikes(video.id)}>
                <Heart className="w-4 h-4 mr-2" />
                Curtir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDuplicate(video.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchive(video.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteVideo(video.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  // Renderizar linha da tabela
  const renderTableRow = (video: PersonalizedVideo) => (
    <TableRow key={video.id}>
      <TableCell>
        <Checkbox
          checked={selectedVideos.includes(video.id)}
          onCheckedChange={(checked) => handleSelectVideo(video.id, checked as boolean)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          <img
            src={video.thumbnailUrl}
            alt={video.exerciseName}
            className="w-12 h-8 object-cover rounded"
          />
          <div>
            <div className="font-medium text-sm">{video.exerciseName}</div>
            <div className="text-xs text-muted-foreground">{video.duration}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{video.modality}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">{video.tool}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={video.status === 'saved' ? 'default' : 'outline'} className="text-xs">
          {video.status}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {video.views}
          </span>
          <span className="flex items-center">
            <Heart className="w-3 h-3 mr-1" />
            {video.likes}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(video.generatedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleIncrementViews(video.id)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(video.id)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleArchive(video.id)}>
              <Archive className="w-4 h-4 mr-2" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteVideo(video.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciamento de Vídeos"
        subtitle="CRUD completo para vídeos personalizados gerados"
      />

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros e Busca</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(true)}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Select value={filters.modality || ''} onValueChange={(value) => handleFilterChange('modality', value || undefined)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="jiujitsu">Jiu-Jitsu</SelectItem>
                <SelectItem value="muaythai">Muay Thai</SelectItem>
                <SelectItem value="boxing">Boxing</SelectItem>
                <SelectItem value="fisio">Fisioterapia</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.tool || ''} onValueChange={(value) => handleFilterChange('tool', value || undefined)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ferramenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="capcut">CapCut AI</SelectItem>
                <SelectItem value="canva">Canva AI</SelectItem>
                <SelectItem value="adobefirefly">Adobe Firefly</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value || undefined)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="generated">Gerado</SelectItem>
                <SelectItem value="saved">Salvo</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
                <SelectItem value="deleted">Deletado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedVideos.length > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Ações em Massa</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{selectedVideos.length} vídeo(s) selecionado(s)</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setShowBulkActions(true)}>
                    Ações em Massa
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedVideos([])}>
                    Limpar Seleção
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de Vídeos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vídeos ({filteredVideos.length})</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('generatedAt')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Data
                {sortOptions.field === 'generatedAt' && (
                  sortOptions.direction === 'desc' ? <SortDesc className="w-3 h-3 ml-1" /> : <SortAsc className="w-3 h-3 ml-1" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('views')}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visualizações
                {sortOptions.field === 'views' && (
                  sortOptions.direction === 'desc' ? <SortDesc className="w-3 h-3 ml-1" /> : <SortAsc className="w-3 h-3 ml-1" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
              <Button
                onClick={() => window.location.href = '/video-generator-personalized'}
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo Vídeo
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vídeo encontrado</p>
              <Button 
                className="mt-4"
                onClick={() => window.location.href = '/video-generator-personalized'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Vídeo
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVideos.map(renderVideoCard)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Vídeo</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Ferramenta</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Engajamento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.map(renderTableRow)}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Ações em Massa */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ações em Massa</DialogTitle>
            <DialogDescription>
              {selectedVideos.length} vídeo(s) selecionado(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar
            </Button>
            <Button variant="outline">
              <Archive className="w-4 h-4 mr-2" />
              Arquivar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Estatísticas */}
      <VideoStatsModal isOpen={showStats} onClose={() => setShowStats(false)} />

      {/* Modal de Exportação */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Vídeos</DialogTitle>
            <DialogDescription>
              Escolha o formato para exportar os vídeos
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManagementDashboard;

// components/video/VideoStatsModal.tsx
// Modal de estatísticas avançadas para vídeos
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Download,
  Video,
  Calendar,
  Users,
  Clock,
  Award,
  Target,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { personalizedVideoCrudService, VideoStats } from '../../services/personalizedVideoCrudService';

interface VideoStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoStatsModal: React.FC<VideoStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await personalizedVideoCrudService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Estatísticas de Vídeos
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!stats) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Estatísticas de Vídeos
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Resumo Geral */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Resumo Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total de Vídeos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">Visualizações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
                  <div className="text-sm text-muted-foreground">Curtidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalDownloads}</div>
                  <div className="text-sm text-muted-foreground">Downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Por Modalidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Por Modalidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byModality).map(([modality, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={modality} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{modality}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Por Ferramenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Por Ferramenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byTool).map(([tool, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={tool} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{tool}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const statusColors = {
                    generated: 'bg-blue-500',
                    saved: 'bg-green-500',
                    archived: 'bg-yellow-500',
                    deleted: 'bg-red-500'
                  };
                  
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{
                          background: `linear-gradient(to right, ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'} ${percentage}%, #e5e7eb ${percentage}%)`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Por Dificuldade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Por Dificuldade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byDifficulty).map(([difficulty, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const difficultyColors = {
                    iniciante: 'bg-green-500',
                    intermediario: 'bg-yellow-500',
                    avancado: 'bg-red-500'
                  };
                  
                  return (
                    <div key={difficulty} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{difficulty}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{
                          background: `linear-gradient(to right, ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-gray-500'} ${percentage}%, #e5e7eb ${percentage}%)`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Duração Média */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Duração Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.averageDuration}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Tempo médio por vídeo
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vídeos Mais Populares */}
          <Card className="col-span-full md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Vídeos Mais Populares
              </CardTitle>
              <CardDescription>
                Baseado em visualizações e curtidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.mostPopular.map((video, index) => (
                  <div key={video.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.exerciseName}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{video.exerciseName}</div>
                      <div className="text-xs text-muted-foreground">
                        {video.modality} • {video.tool}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {video.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {video.likes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vídeos Recentes */}
          <Card className="col-span-full md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Vídeos Recentes
              </CardTitle>
              <CardDescription>
                Últimos vídeos gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentlyGenerated.map((video, index) => (
                  <div key={video.id} className="flex items-center space-x-3">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.exerciseName}
                      className="w-8 h-6 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{video.exerciseName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(video.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {video.duration}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoStatsModal;

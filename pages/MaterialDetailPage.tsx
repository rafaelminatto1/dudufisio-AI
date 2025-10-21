import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Share, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Link as LinkIcon,
  FileText,
  Play,
  Image as ImageIcon,
  Clock,
  TrendingUp
} from 'lucide-react';
import { clinicalMaterialService } from '../services/clinicalMaterialService';
import { materialLinkService } from '../services/materialLinkService';
import { mediaUploadService } from '../services/mediaUploadService';
import { Material, MaterialLink } from '../types';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
    const { showToast } = useToast();

  const [material, setMaterial] = useState<Material | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);
  const [links, setLinks] = useState<MaterialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    useEffect(() => {
    if (id) {
      loadMaterial();
      loadRelatedMaterials();
      loadLinks();
    }
  }, [id]);

  const loadMaterial = async () => {
    if (!id) return;
    
            setIsLoading(true);
            try {
      const materialData = await clinicalMaterialService.getMaterialById(id);
      if (materialData) {
        setMaterial(materialData);
      } else {
        showToast('Material não encontrado', 'error');
        navigate('/materials');
      }
    } catch (error) {
      console.error('Error loading material:', error);
      showToast('Erro ao carregar material', 'error');
            } finally {
                setIsLoading(false);
            }
        };

  const loadRelatedMaterials = async () => {
    if (!id) return;
    
    setIsLoadingRelated(true);
    try {
      const related = await materialLinkService.getRelatedMaterials(id);
      setRelatedMaterials(related);
    } catch (error) {
      console.error('Error loading related materials:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const loadLinks = async () => {
    if (!id) return;
    
    try {
      const materialLinks = await materialLinkService.getMaterialLinks(id);
      setLinks(materialLinks);
    } catch (error) {
      console.error('Error loading links:', error);
    }
  };

  const handleEdit = () => {
    if (material) {
      navigate(`/materials/${material.id}/edit`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && material) {
      try {
        await navigator.share({
          title: material.name,
          text: material.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copiado para a área de transferência', 'success');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copiado para a área de transferência', 'success');
    }
  };

  const handleDownload = () => {
    if (!material) return;
    
    // Create a downloadable version of the content
    const content = `
# ${material.name}

**Tipo:** ${material.type}
**Categoria:** ${material.category.name}
**Criado em:** ${new Date(material.updatedAt).toLocaleDateString('pt-BR')}

## Descrição
${material.description}

## Conteúdo
${material.content || 'Nenhum conteúdo disponível'}

## Tags
${material.tags?.map(tag => `- ${tag}`).join('\n') || 'Nenhuma tag'}

---
Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    `;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Material baixado com sucesso', 'success');
  };

  const renderRichContent = (content: string) => {
    // Parse and render Tiptap HTML content
    // This would need a proper HTML sanitizer and renderer
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando material...</p>
        </div>
        </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Material não encontrado</h2>
        <p className="text-gray-600 mb-4">O material que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/materials')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Materiais
        </Button>
      </div>
    );
  }

    return (
        <>
            <PageHeader
        title={material.name}
        subtitle={material.description}
        breadcrumb={[
          { label: 'Materiais Clínicos', href: '/materials' },
          { label: material.name }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Material Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getMaterialTypeColor(material.type)}>
                      {material.type}
                    </Badge>
                    <Badge className={getStatusColor(material.status)}>
                      {material.status === 'published' ? 'Publicado' : 
                       material.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {material.name}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {material.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {material.content ? (
                renderRichContent(material.content)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum conteúdo disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Materials */}
          {relatedMaterials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Materiais Relacionados ({relatedMaterials.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedMaterials.map((related) => (
                    <div
                      key={related.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/material-detail/${related.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {related.name}
                        </h3>
                        <Badge className={`text-xs ${getMaterialTypeColor(related.type)}`}>
                          {related.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {related.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(related.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span>{related.category.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Material Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Criado por</p>
                  <p className="text-sm text-gray-600">{material.createdBy || 'Sistema'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Atualizado em</p>
                  <p className="text-sm text-gray-600">
                    {new Date(material.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Categoria</p>
                  <p className="text-sm text-gray-600">{material.category.name}</p>
                </div>
              </div>

              {material.version && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Versão</p>
                    <p className="text-sm text-gray-600">v{material.version}</p>
                  </div>
                 </div>
            )}
            </CardContent>
          </Card>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags ({material.tags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wiki Links */}
          {links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Links ({links.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/material-detail/${link.toMaterialId}`)}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {link.linkText}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {link.toMaterialId}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate(`/materials/${material.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Material
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/material-tasks')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Tarefas
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="input justify-start"
                onClick={() => navigate('/materials')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
        </>
    );
};

export default MaterialDetailPage;
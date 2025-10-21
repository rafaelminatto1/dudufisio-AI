import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Tag,
  User,
  Calendar,
  Archive
} from 'lucide-react';
import { clinicalMaterialService } from '../services/clinicalMaterialService';
import { MaterialCategory, Material } from '../types';
import PageHeader from '../components/PageHeader';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useToast } from '../contexts/ToastContext';

const MaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, materialsData] = await Promise.all([
          clinicalMaterialService.getCategories(),
          clinicalMaterialService.getMaterials()
        ]);
        setCategories(categoriesData);
        setMaterials(materialsData);
      } catch (error) {
        console.error('Erro ao carregar materiais:', error);
        showToast('Erro ao carregar materiais', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, [showToast]);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (material.content && material.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || material.category.id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || material.status === selectedStatus;
    const matchesType = selectedType === 'all' || material.type === selectedType;

    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  const handleDeleteMaterial = async (materialId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await clinicalMaterialService.deleteMaterial(materialId);
        setMaterials(materials.filter(m => m.id !== materialId));
        showToast('Material excluído com sucesso', 'success');
      } catch (error) {
        console.error('Erro ao excluir material:', error);
        showToast('Erro ao excluir material', 'error');
      }
    }
  };

  const handleArchiveMaterial = async (materialId: string) => {
    try {
      await clinicalMaterialService.updateMaterial({
        id: materialId,
        status: 'archived'
      });
      setMaterials(materials.map(m => 
        m.id === materialId ? { ...m, status: 'archived' as any } : m
      ));
      showToast('Material arquivado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao arquivar material:', error);
      showToast('Erro ao arquivar material', 'error');
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'Escala de Avaliação':
        return <ClipboardList className="w-5 h-5 text-blue-500" />;
      case 'Protocolo Clínico':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-purple-500" />;
    }
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'Escala de Avaliação':
        return 'bg-blue-100 text-blue-800';
      case 'Protocolo Clínico':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Materiais Clínicos"
          subtitle="Biblioteca de materiais e protocolos clínicos"
        />
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-8 w-1/3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Materiais Clínicos"
        subtitle="Biblioteca de materiais e protocolos clínicos"
      >
        <Button
          onClick={() => navigate('/materials/new')}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Material</span>
        </Button>
      </PageHeader>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nome, descrição ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredMaterials.length} material(is) encontrado(s)
            </span>
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Escala de Avaliação">Escala de Avaliação</SelectItem>
              <SelectItem value="Protocolo Clínico">Protocolo Clínico</SelectItem>
              <SelectItem value="Material Educacional">Material Educacional</SelectItem>
              <SelectItem value="Técnica de Terapia Manual">Técnica de Terapia Manual</SelectItem>
              <SelectItem value="Eletroterapia e Recursos Físicos">Eletroterapia e Recursos Físicos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total de Materiais</p>
              <p className="text-2xl font-bold text-slate-900">
                {categories.reduce((total, cat) => total + cat.materials.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Protocolos</p>
              <p className="text-2xl font-bold text-slate-900">
                {categories.reduce((total, cat) => 
                  total + cat.materials.filter(m => m.type === 'Protocolo Clínico').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Escalas</p>
              <p className="text-2xl font-bold text-slate-900">
                {categories.reduce((total, cat) => 
                  total + cat.materials.filter(m => m.type === 'Escala de Avaliação').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getMaterialIcon(material.type)}
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getMaterialTypeColor(material.type)}`}>
                  {material.type}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={
                    material.status === 'published' ? 'default' : 
                    material.status === 'draft' ? 'secondary' : 'destructive'
                  }
                  className="text-xs"
                >
                  {material.status === 'published' ? 'Publicado' : 
                   material.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/material-detail/${material.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/materials/${material.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveMaterial(material.id)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Link to={`/material-detail/${material.id}`} className="block">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                {material.name}
              </h3>
            </Link>
            
            <p className="text-sm text-slate-600 mb-4 line-clamp-3">
              {material.description}
            </p>

            {/* Tags */}
            {material.tags && material.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {material.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {material.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{material.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(material.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {material.createdBy && (
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>Admin</span>
                  </div>
                )}
              </div>
              <div className="text-sky-600 text-sm font-medium group-hover:text-sky-700">
                Ver detalhes →
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Nenhum material encontrado
          </h3>
          <p className="text-slate-600">
            Tente ajustar os filtros ou termo de busca.
          </p>
        </div>
      )}
    </>
  );
};

export default MaterialsPage;

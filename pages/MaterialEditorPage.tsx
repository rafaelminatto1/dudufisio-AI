import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Tag, 
  Link as LinkIcon, 
  Users,
  FileText,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdvancedMaterialEditor from '../components/clinical-materials/AdvancedMaterialEditor';
import { clinicalMaterialService, MaterialCreateData, MaterialUpdateData } from '../services/clinicalMaterialService';
import { Material, MaterialCategory } from '../types';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const materialSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

const MaterialEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = Boolean(id);

  const [material, setMaterial] = useState<Material | null>(null);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [linkedMaterials, setLinkedMaterials] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      status: 'draft',
      tags: [],
    }
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load categories
        const categoriesData = await clinicalMaterialService.getCategories();
        setCategories(categoriesData);

        if (isEditing && id) {
          // Load existing material
          const materialData = await clinicalMaterialService.getMaterialById(id);
          if (materialData) {
            setMaterial(materialData);
            setContent(materialData.content || '');
            setTags(materialData.tags || []);
            setLinkedMaterials(materialData.linkedMaterials || []);
            
            // Populate form
            reset({
              name: materialData.name,
              description: materialData.description || '',
              type: materialData.type,
              categoryId: materialData.category.id,
              status: materialData.status || 'draft',
              tags: materialData.tags || [],
            });
          } else {
            showToast('Material não encontrado', 'error');
            navigate('/materials');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Erro ao carregar dados', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, navigate, showToast, reset]);

  const handleSave = async (data: MaterialFormData) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        // Update existing material
        const updateData: MaterialUpdateData = {
          id,
          name: data.name,
          description: data.description,
          type: data.type,
          categoryId: data.categoryId,
          content,
          tags,
          status: data.status,
        };

        await clinicalMaterialService.updateMaterial(updateData);
        showToast('Material atualizado com sucesso!', 'success');
      } else {
        // Create new material
        const createData: MaterialCreateData = {
          name: data.name,
          description: data.description,
          type: data.type,
          categoryId: data.categoryId,
          content,
          tags,
          status: data.status,
        };

        const newMaterial = await clinicalMaterialService.createMaterial(createData);
        showToast('Material criado com sucesso!', 'success');
        navigate(`/materials/${newMaterial.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving material:', error);
      showToast('Erro ao salvar material', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (watchedStatus === 'published') return;

    setValue('status', 'published');
    await handleSubmit(handleSave)();
  };

  const handlePreview = () => {
    if (isEditing && id) {
      navigate(`/material-detail/${id}`);
    } else {
      showToast('Salve o material antes de visualizar', 'warning');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={isEditing ? 'Editar Material' : 'Novo Material'}
        subtitle={isEditing ? 'Edite o conteúdo e metadados do material' : 'Crie um novo material clínico'}
      >
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/materials')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          
          <Button
            onClick={handlePreview}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </Button>

          <Button
            onClick={handleSubmit(handleSave)}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </Button>

          {watchedStatus !== 'published' && (
            <Button
              onClick={handlePublish}
              variant="default"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <FileText className="w-4 h-4" />
              <span>Publicar</span>
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Conteúdo do Material</h3>
              <p className="text-sm text-gray-600 mt-1">
                Use o editor rico para criar conteúdo com formatação, links, imagens e mais.
              </p>
            </div>
            
            <div className="p-4">
              <AdvancedMaterialEditor
                value={content}
                onChange={setContent}
                placeholder="Digite o conteúdo do material aqui..."
                minHeight="500px"
                onSave={handleSubmit(handleSave)}
                onPreview={handlePreview}
                isSaving={isSaving}
                materialId={material?.id}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Informações Básicas
              </h3>

              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Material *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Ex: Protocolo de Fisioterapia Respiratória"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Breve descrição do material..."
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value)}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Escala de Avaliação">Escala de Avaliação</SelectItem>
                      <SelectItem value="Protocolo Clínico">Protocolo Clínico</SelectItem>
                      <SelectItem value="Material Educacional">Material Educacional</SelectItem>
                      <SelectItem value="Técnica de Terapia Manual">Técnica de Terapia Manual</SelectItem>
                      <SelectItem value="Eletroterapia e Recursos Físicos">Eletroterapia e Recursos Físicos</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={watch('categoryId')}
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </h3>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Adicionar tag..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddTag} size="sm">
                    Adicionar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center space-x-1 px-2 py-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Material Info */}
            {material && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Informações
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Versão:</span>
                    <span className="font-medium">{material.version || 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Criado em:</span>
                    <span className="font-medium">
                      {new Date(material.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {material.lastEditedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Última edição:</span>
                      <span className="font-medium">
                        {new Date(material.lastEditedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {material.editCount && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Edições:</span>
                      <span className="font-medium">{material.editCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Alert */}
            {watchedStatus === 'draft' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Rascunho</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Este material ainda não foi publicado e não está visível para outros usuários.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MaterialEditorPage;

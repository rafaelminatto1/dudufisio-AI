// hooks/useMaterialCategories.ts
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Material, MaterialCategory } from '../types';
import { mockMaterialCategories } from '../data/mockClinicalMaterials';

type CategoryRow = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
};

type MaterialRow = {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  category_id?: string | null;
  updated_at?: string | null;
  content?: string | null;
  tags?: string[] | null;
  status?: string | null;
  published_at?: string | null;
  file_url?: string | null;
  file_type?: string | null;
};

const UNCATEGORIZED_ID = 'uncategorized';

async function fetchCategoriesFromSupabase(): Promise<MaterialCategory[]> {
  const { data: categoryRows, error: categoryError } = await supabase
    .from('clinical_material_categories')
    .select('id, name, description, color, icon')
    .order('name', { ascending: true });

  if (categoryError) {
    throw categoryError;
  }

  const categoriesMap = new Map<string, MaterialCategory>();
  const categories: MaterialCategory[] =
    categoryRows?.map((row: CategoryRow) => {
      const category: MaterialCategory = {
        id: row.id,
        name: row.name,
        materials: [],
        description: row.description ?? null,
        color: row.color ?? null,
        icon: row.icon ?? null,
      };

      categoriesMap.set(row.id, category);
      return category;
    }) ?? [];

  const uncategorizedCategory: MaterialCategory = {
    id: UNCATEGORIZED_ID,
    name: 'Outros Materiais',
    materials: [],
  };

  const { data: materialRows, error: materialError } = await supabase
    .from('clinical_materials')
    .select(
      'id, name, description, type, category_id, updated_at, content, tags, status, published_at, file_url, file_type',
    )
    .in('status', ['published'])
    .order('updated_at', { ascending: false });

  if (materialError) {
    throw materialError;
  }

  const ensureCategory = (categoryId?: string | null): MaterialCategory => {
    if (!categoryId) {
      if (!categoriesMap.has(UNCATEGORIZED_ID)) {
        categoriesMap.set(UNCATEGORIZED_ID, uncategorizedCategory);
        categories.push(uncategorizedCategory);
      }
      return categoriesMap.get(UNCATEGORIZED_ID)!;
    }

    const category = categoriesMap.get(categoryId);
    if (category) {
      return category;
    }

    // Categoria inexistente no cadastro – criar fallback
    const fallback: MaterialCategory = {
      id: categoryId,
      name: 'Categoria não catalogada',
      materials: [],
    };
    categoriesMap.set(categoryId, fallback);
    categories.push(fallback);
    return fallback;
  };

  materialRows?.forEach((row: MaterialRow) => {
    const category = ensureCategory(row.category_id);
    const material: Material = {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      type: row.type ?? 'manual',
      category,
      updatedAt: row.updated_at ?? new Date().toISOString(),
      content: row.content ?? undefined,
      tags: row.tags ?? undefined,
      status: (row.status as Material['status']) ?? 'published',
      publishedAt: row.published_at ?? undefined,
      fileUrl: row.file_url ?? undefined,
      fileType: row.file_type ?? undefined,
    };

    category.materials.push(material);
  });

  return categories;
}

const useMaterialCategories = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const supabaseCategories = await fetchCategoriesFromSupabase();
        if (!mounted) return;

        // Garantir ordenação consistente pelo nome
        const sorted = supabaseCategories.sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR'),
        );
        setCategories(sorted);
        setError(null);
      } catch (err) {
        console.error('[useMaterialCategories] erro ao buscar no Supabase:', err);
        if (!mounted) return;
        setCategories(mockMaterialCategories);
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os materiais do Supabase.',
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const orderedCategories = useMemo(() => {
    if (!categories.length) {
      return categories;
    }

    return categories.map((category) => ({
      ...category,
      materials: [...category.materials].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR'),
      ),
    }));
  }, [categories]);

  return { categories: orderedCategories, isLoading, error };
};

export default useMaterialCategories;


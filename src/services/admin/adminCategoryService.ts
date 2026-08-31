import { supabase } from '@/lib/supabase/client';
import { CategoryType } from '@/types';

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  updated_at?: string;
}

export const adminCategoryService = {
  async getAllCategories(): Promise<CategoryType[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return (data || []) as CategoryType[];
  },

  async createCategory(categoryData: CreateCategoryData): Promise<CategoryType> {
    const payload = {
      name: categoryData.name,
      slug: categoryData.slug || categoryData.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: categoryData.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data as CategoryType;
  },

  async updateCategory(id: number, categoryData: UpdateCategoryData): Promise<CategoryType> {
    const payload = {
      ...(categoryData.name !== undefined ? { name: categoryData.name } : {}),
      ...(categoryData.slug !== undefined ? { slug: categoryData.slug } : {}),
      ...(categoryData.description !== undefined ? { description: categoryData.description } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data as CategoryType;
  },

  async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    return true;
  },
};

import { supabase } from '@/lib/supabase/client';
import { ProductType } from '../../types';
import { isNoRowsError } from '@/utils/errorHandling';

const fallbackProducts: ProductType[] = [
  {
    product_id: 'dmt-1',
    title: 'Aero Wireless Headset',
    description: 'Premium noise-canceling headset with immersive audio and all-day comfort.',
    price: 249.99,
    stock: 18,
    category_id: 3,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-2',
    title: 'Urban Smart Watch',
    description: 'Elegant smartwatch with fitness tracking, notifications, and a durable steel band.',
    price: 199.0,
    stock: 14,
    category_id: 2,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-3',
    title: 'Signature Leather Jacket',
    description: 'Sharp modern design with premium finish for daily wear and weekend comfort.',
    price: 179.5,
    stock: 11,
    category_id: 1,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-4',
    title: 'Pulse Pro Speaker',
    description: 'Compact voice-ready speaker with deep bass and crystal-clear sound.',
    price: 129.99,
    stock: 22,
    category_id: 3,
    image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-5',
    title: 'Classic Steel Watch',
    description: 'Minimal polished watch designed for executive style and everyday reliability.',
    price: 219.0,
    stock: 9,
    category_id: 2,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-6',
    title: 'Metro Everyday Hoodie',
    description: 'Soft brushed fabric, relaxed fit, and durable finish for everyday essentials.',
    price: 89.9,
    stock: 27,
    category_id: 1,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-7',
    title: 'Nova Camera Kit',
    description: 'Professional-grade compact kit built for creators, travel, and content capture.',
    price: 399.99,
    stock: 7,
    category_id: 3,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  },
  {
    product_id: 'dmt-8',
    title: 'Titan Carry Case',
    description: 'Premium travel accessory designed to protect devices and essentials on the move.',
    price: 59.5,
    stock: 33,
    category_id: 2,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
  },
];

const getFallbackProducts = () => fallbackProducts.map((product) => ({ ...product }));

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('title');

      if (error) {
        console.warn('Falling back to demo products because Supabase query failed:', error.message);
        return getFallbackProducts();
      }

      if (!data || data.length === 0) {
        return getFallbackProducts();
      }

      return data as ProductType[];
    } catch (error) {
      console.warn('Falling back to demo products after product fetch error:', error);
      return getFallbackProducts();
    }
  },

  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('product_id', id)
        .single();

      if (error) {
        if (isNoRowsError(error)) {
          return getFallbackProducts().find((product) => product.product_id === id) ?? null;
        }
        console.warn('Using demo fallback for product lookup:', error.message);
        return getFallbackProducts().find((product) => product.product_id === id) ?? null;
      }

      return data as ProductType;
    } catch (error) {
      console.warn('Using demo fallback for product lookup after error:', error);
      return getFallbackProducts().find((product) => product.product_id === id) ?? null;
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('category_id', categoryId)
        .order('title');

      if (error) {
        console.warn('Falling back to demo category products:', error.message);
        return getFallbackProducts().filter((product) => product.category_id === categoryId);
      }

      if (!data || data.length === 0) {
        return getFallbackProducts().filter((product) => product.category_id === categoryId);
      }

      return data as ProductType[];
    } catch (error) {
      console.warn('Fallback category products used after fetch error:', error);
      return getFallbackProducts().filter((product) => product.category_id === categoryId);
    }
  },
};

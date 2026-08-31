import { supabase } from '@/lib/supabase/client';
import { CartType, CartStatus } from '@/types';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/supabase/clientUtils';

export async function createCart() {
  try {
    const user = await getClientUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: existingCart, error: existingCartError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingCart && !existingCartError) {
      return existingCart as CartType;
    }

    if (existingCartError && existingCartError.code !== 'PGRST116') {
      console.error('Error checking existing cart:', existingCartError);
    }

    const payload: { user_id: string; status?: CartStatus } = {
      user_id: user.id,
    };

    const insertCandidates = [
      { ...payload, status: 'active' as CartStatus },
      { user_id: user.id },
    ];

    for (const item of insertCandidates) {
      const { data, error } = await supabase
        .from('carts')
        .insert(item)
        .select('*')
        .maybeSingle();

      if (!error) {
        return data as CartType;
      }

      if (error.code === '23505') {
        const { data: duplicateCart } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (duplicateCart) {
          return duplicateCart as CartType;
        }
      }

      if (error.code !== '42703' && error.code !== '42P01') {
        console.error('Error creating cart:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
    }

    toast.error('Failed to create cart');
    return null;
  } catch (error) {
    console.error('Error in createCart:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    toast.error('Something went wrong');
    return null;
  }
}

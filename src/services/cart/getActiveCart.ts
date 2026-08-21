import { supabase } from '@/lib/supabase/client';
import { CartType } from '@/types';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/supabase/clientUtils';

export async function getActiveCart() {
  try {
    const user = await getClientUser();
    if (!user) {
      return null;
    }

    const baseQuery = supabase.from('carts').select('*').eq('user_id', user.id);

    let { data, error } = await baseQuery.eq('status', 'active').maybeSingle();

    if (error && error.code === '42703') {
      ({ data, error } = await baseQuery.maybeSingle());
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart');
      return null;
    }

    return data as CartType | null;
  } catch (error) {
    console.error('Error in getActiveCart:', error);
    toast.error('Something went wrong');
    return null;
  }
}

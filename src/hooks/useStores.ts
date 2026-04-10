import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store } from '@/types/campaign';

const mapDbStore = (db: any): Store => ({
  id: db.id,
  name: db.name,
  address: db.address || undefined,
  createdAt: db.created_at,
});

export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async (): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbStore);
    },
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (store: { name: string; address?: string }) => {
      const { data, error } = await supabase
        .from('stores')
        .insert({ name: store.name, address: store.address || null })
        .select()
        .single();

      if (error) throw error;
      return mapDbStore(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; address?: string } }) => {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.address !== undefined) dbUpdates.address = updates.address || null;

      const { data, error } = await supabase
        .from('stores')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbStore(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

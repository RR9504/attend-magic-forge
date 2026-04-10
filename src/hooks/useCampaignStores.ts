import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store } from '@/types/campaign';

const mapDbStore = (db: any): Store => ({
  id: db.id,
  name: db.name,
  address: db.address || undefined,
  createdAt: db.created_at,
});

export const useCampaignStores = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign-stores', campaignId],
    queryFn: async (): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('campaign_stores')
        .select('store_id, stores(*)')
        .eq('campaign_id', campaignId);

      if (error) throw error;
      return (data || []).map((row: any) => mapDbStore(row.stores));
    },
    enabled: !!campaignId,
  });
};

export const useSetCampaignStores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, storeIds }: { campaignId: string; storeIds: string[] }) => {
      // Delete existing links
      const { error: deleteError } = await supabase
        .from('campaign_stores')
        .delete()
        .eq('campaign_id', campaignId);

      if (deleteError) throw deleteError;

      // Insert new links
      if (storeIds.length > 0) {
        const { error: insertError } = await supabase
          .from('campaign_stores')
          .insert(storeIds.map(storeId => ({
            campaign_id: campaignId,
            store_id: storeId,
          })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-stores', campaignId] });
    },
  });
};

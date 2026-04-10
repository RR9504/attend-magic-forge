import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CampaignEntry } from '@/types/campaign';
import { TablesInsert } from '@/integrations/supabase/types';

const mapDbEntry = (db: any): CampaignEntry => ({
  id: db.id,
  campaignId: db.campaign_id,
  storeId: db.store_id,
  data: db.data as Record<string, string | boolean>,
  receiptImageUrl: db.receipt_image_url || undefined,
  receiptAmount: db.receipt_amount || undefined,
  registeredAt: db.registered_at,
});

export const useCampaignEntries = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign-entries', campaignId],
    queryFn: async (): Promise<CampaignEntry[]> => {
      const { data, error } = await supabase
        .from('campaign_entries')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbEntry);
    },
    enabled: !!campaignId,
  });
};

export const useCreateCampaignEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      storeId,
      data,
      receiptImageUrl,
      receiptAmount,
    }: {
      campaignId: string;
      storeId: string;
      data: Record<string, string | boolean>;
      receiptImageUrl?: string;
      receiptAmount?: number;
    }) => {
      const insertData: TablesInsert<'campaign_entries'> = {
        campaign_id: campaignId,
        store_id: storeId,
        data: data as unknown as TablesInsert<'campaign_entries'>['data'],
        receipt_image_url: receiptImageUrl || null,
        receipt_amount: receiptAmount || null,
      };

      // Same pattern as registrations: anon can INSERT but not SELECT
      const { error } = await supabase
        .from('campaign_entries')
        .insert(insertData);

      if (error) throw error;

      return {
        id: crypto.randomUUID(),
        campaignId,
        storeId,
        data,
        receiptImageUrl,
        receiptAmount,
        registeredAt: new Date().toISOString(),
      } satisfies CampaignEntry;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-entries', campaignId] });
    },
  });
};

export const useDeleteCampaignEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, campaignId }: { id: string; campaignId: string }) => {
      const { error } = await supabase
        .from('campaign_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-entries', campaignId] });
    },
  });
};

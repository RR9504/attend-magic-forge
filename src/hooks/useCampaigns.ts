import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Campaign, DEFAULT_CAMPAIGN_FORM_FIELDS } from '@/types/campaign';
import { EventFormField } from '@/types/event';
import { TablesInsert } from '@/integrations/supabase/types';

const mapDbCampaign = (db: any): Campaign => ({
  id: db.id,
  title: db.title,
  description: db.description || undefined,
  minAmount: db.min_amount || undefined,
  formFields: (db.form_fields as EventFormField[]) || DEFAULT_CAMPAIGN_FORM_FIELDS,
  status: db.status as Campaign['status'],
  startDate: db.start_date || undefined,
  endDate: db.end_date || undefined,
  createdAt: db.created_at,
});

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbCampaign);
    },
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async (): Promise<Campaign | null> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbCampaign(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
      const insertData: TablesInsert<'campaigns'> = {
        title: campaign.title,
        description: campaign.description || null,
        min_amount: campaign.minAmount || null,
        form_fields: campaign.formFields as unknown as TablesInsert<'campaigns'>['form_fields'],
        status: campaign.status,
        start_date: campaign.startDate || null,
        end_date: campaign.endDate || null,
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return mapDbCampaign(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
      const dbUpdates: Record<string, any> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.minAmount !== undefined) dbUpdates.min_amount = updates.minAmount || null;
      if (updates.formFields !== undefined) dbUpdates.form_fields = updates.formFields;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;

      const { data, error } = await supabase
        .from('campaigns')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbCampaign(data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

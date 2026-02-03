import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Registration } from '@/types/event';
import { TablesInsert } from '@/integrations/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDbRegistrationToRegistration = (db: any): Registration => ({
  id: db.id,
  eventId: db.event_id,
  data: db.data as Record<string, string | boolean>,
  registeredAt: db.registered_at,
});

export const useEventRegistrations = (eventId: string) => {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async (): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbRegistrationToRegistration);
    },
    enabled: !!eventId,
  });
};

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: Record<string, string | boolean> }) => {
      const insertData: TablesInsert<'registrations'> = {
        event_id: eventId,
        data: data as unknown as TablesInsert<'registrations'>['data'],
      };

      // IMPORTANT:
      // Public (anon) users are allowed to INSERT registrations, but they are NOT allowed to SELECT
      // from the registrations table (PII). Therefore we must NOT do `.select()` here.
      // If we did, the INSERT could succeed but the subsequent SELECT would fail, and the UI would
      // incorrectly show an error (and users might submit multiple times).
      const { error } = await supabase
        .from('registrations')
        .insert(insertData);

      if (error) throw error;

      // Return a client-side receipt (not the DB row) since we can't read it back under RLS.
      return {
        id: crypto.randomUUID(),
        eventId,
        data,
        registeredAt: new Date().toISOString(),
      } satisfies Registration;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
    },
  });
};

export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useRegistrationCount = (eventId: string) => {
  return useQuery({
    queryKey: ['registration-count', eventId],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId,
  });
};

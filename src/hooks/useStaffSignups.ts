import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StaffSignup } from '@/types/staffEvent';
import { TablesInsert } from '@/integrations/supabase/types';

const mapDbSignup = (db: any): StaffSignup => ({
  id: db.id,
  eventId: db.event_id,
  name: db.name,
  email: db.email || undefined,
  phone: db.phone || undefined,
  signedUpAt: db.signed_up_at,
});

export const useStaffSignups = (eventId: string) => {
  return useQuery({
    queryKey: ['staff-signups', eventId],
    queryFn: async (): Promise<StaffSignup[]> => {
      const { data, error } = await supabase
        .from('staff_signups')
        .select('*')
        .eq('event_id', eventId)
        .order('signed_up_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbSignup);
    },
    enabled: !!eventId,
  });
};

export const useAllStaffSignupCounts = () => {
  return useQuery({
    queryKey: ['staff-signup-counts'],
    queryFn: async (): Promise<Record<string, number>> => {
      // Use service-level count grouped by event_id
      const { data, error } = await supabase
        .from('staff_signups')
        .select('event_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        counts[row.event_id] = (counts[row.event_id] || 0) + 1;
      });
      return counts;
    },
  });
};

export const useCreateStaffSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, name, email, phone }: {
      eventId: string;
      name: string;
      email?: string;
      phone?: string;
    }) => {
      const insertData: TablesInsert<'staff_signups'> = {
        event_id: eventId,
        name,
        email: email || null,
        phone: phone || null,
      };

      // Anon can INSERT but not SELECT
      const { error } = await supabase
        .from('staff_signups')
        .insert(insertData);

      if (error) throw error;

      return {
        id: crypto.randomUUID(),
        eventId,
        name,
        email,
        phone,
        signedUpAt: new Date().toISOString(),
      } satisfies StaffSignup;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['staff-signups', eventId] });
      queryClient.invalidateQueries({ queryKey: ['staff-signup-counts'] });
      queryClient.invalidateQueries({ queryKey: ['staff-events'] });
    },
  });
};

export const useDeleteStaffSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase
        .from('staff_signups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['staff-signups', eventId] });
      queryClient.invalidateQueries({ queryKey: ['staff-signup-counts'] });
      queryClient.invalidateQueries({ queryKey: ['staff-events'] });
    },
  });
};

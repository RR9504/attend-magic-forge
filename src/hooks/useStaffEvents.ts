import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StaffEvent } from '@/types/staffEvent';
import { TablesInsert } from '@/integrations/supabase/types';

const mapDbStaffEvent = (db: any): StaffEvent => ({
  id: db.id,
  title: db.title,
  description: db.description || undefined,
  date: db.date,
  time: db.time?.slice(0, 5) || undefined,
  location: db.location || undefined,
  staffNeeded: db.staff_needed,
  currentSignups: db.current_signups || 0,
  status: db.status as StaffEvent['status'],
  createdAt: db.created_at,
});

export const useStaffEvents = () => {
  return useQuery({
    queryKey: ['staff-events'],
    queryFn: async (): Promise<StaffEvent[]> => {
      const { data, error } = await supabase
        .from('staff_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbStaffEvent);
    },
  });
};

export const useStaffEvent = (id: string) => {
  return useQuery({
    queryKey: ['staff-event', id],
    queryFn: async (): Promise<StaffEvent | null> => {
      const { data, error } = await supabase
        .from('staff_events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbStaffEvent(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateStaffEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<StaffEvent, 'id' | 'createdAt'>) => {
      const insertData: TablesInsert<'staff_events'> = {
        title: event.title,
        description: event.description || null,
        date: event.date,
        time: event.time || null,
        location: event.location || null,
        staff_needed: event.staffNeeded,
        status: event.status,
      };

      const { data, error } = await supabase
        .from('staff_events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return mapDbStaffEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-events'] });
    },
  });
};

export const useUpdateStaffEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StaffEvent> }) => {
      const dbUpdates: Record<string, any> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time || null;
      if (updates.location !== undefined) dbUpdates.location = updates.location || null;
      if (updates.staffNeeded !== undefined) dbUpdates.staff_needed = updates.staffNeeded;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('staff_events')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbStaffEvent(data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['staff-events'] });
      queryClient.invalidateQueries({ queryKey: ['staff-event', id] });
    },
  });
};

export const useDeleteStaffEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-events'] });
    },
  });
};

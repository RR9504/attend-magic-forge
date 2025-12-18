import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventFormField, DEFAULT_FORM_FIELDS } from '@/types/event';
import { TablesInsert } from '@/integrations/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDbEventToEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description || '',
  date: dbEvent.date,
  time: dbEvent.time?.slice(0, 5) || '', // Remove seconds
  location: dbEvent.location,
  imageUrl: dbEvent.image_url || '',
  maxAttendees: dbEvent.max_attendees,
  currentAttendees: dbEvent.current_attendees,
  status: dbEvent.status as Event['status'],
  formFields: (dbEvent.form_fields as EventFormField[]) || DEFAULT_FORM_FIELDS,
  createdAt: dbEvent.created_at,
});

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbEventToEvent);
    },
  });
};

export const usePublishedEvents = () => {
  return useQuery({
    queryKey: ['published-events'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbEventToEvent);
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async (): Promise<Event | null> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbEventToEvent(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<Event, 'id' | 'createdAt' | 'currentAttendees'>) => {
      const insertData: TablesInsert<'events'> = {
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image_url: event.imageUrl,
        max_attendees: event.maxAttendees,
        status: event.status,
        form_fields: event.formFields as unknown as TablesInsert<'events'>['form_fields'],
      };

      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return mapDbEventToEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbUpdates: Record<string, any> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.maxAttendees !== undefined) dbUpdates.max_attendees = updates.maxAttendees;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.formFields !== undefined) dbUpdates.form_fields = updates.formFields;

      const { data, error } = await supabase
        .from('events')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbEventToEvent(data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
    },
  });
};

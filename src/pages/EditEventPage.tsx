import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventForm } from '@/components/events/EventForm';
import { RegistrationList } from '@/components/events/RegistrationList';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useEventRegistrations } from '@/hooks/useRegistrations';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Event } from '@/types/event';
import { useEffect } from 'react';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id || '');
  const { data: registrations = [] } = useEventRegistrations(id || '');
  const updateEventMutation = useUpdateEvent();

  useEffect(() => {
    if (error) {
      navigate('/dashboard/events');
      toast.error('Event hittades inte');
    }
  }, [error, navigate]);

  const handleSubmit = (data: Omit<Event, 'id' | 'createdAt' | 'currentAttendees'>) => {
    if (id) {
      updateEventMutation.mutate(
        { id, updates: data },
        {
          onSuccess: () => toast.success('Event uppdaterat!'),
          onError: () => toast.error('Kunde inte uppdatera event'),
        }
      );
    }
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Länk kopierad till urklipp!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/events">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground line-clamp-1">
                {event.title}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {event.currentAttendees} / {event.maxAttendees} anmälda
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyPublicLink}>
              <Copy className="w-4 h-4" />
              Kopiera länk
            </Button>
            <Link to={`/event/${id}`} target="_blank">
              <Button variant="secondary">
                <ExternalLink className="w-4 h-4" />
                Öppna bokningssida
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="registrations" className="animate-fade-in stagger-1">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="registrations">
              Anmälningar ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Inställningar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registrations" className="mt-6">
            <RegistrationList 
              event={event} 
              registrations={registrations} 
            />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <EventForm 
              initialData={event} 
              onSubmit={handleSubmit} 
              isLoading={updateEventMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

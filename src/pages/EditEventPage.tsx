import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventForm } from '@/components/events/EventForm';
import { RegistrationList } from '@/components/events/RegistrationList';
import { getEvent, updateEvent, getEventRegistrations } from '@/lib/eventStore';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Event, Registration } from '@/types/event';
import { useState, useEffect } from 'react';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const loadData = () => {
    if (id) {
      const eventData = getEvent(id);
      if (eventData) {
        setEvent(eventData);
        setRegistrations(getEventRegistrations(id));
      } else {
        navigate('/dashboard/events');
        toast.error('Event hittades inte');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmit = (data: Omit<Event, 'id' | 'createdAt' | 'currentAttendees'>) => {
    if (id) {
      updateEvent(id, data);
      toast.success('Event uppdaterat!');
      loadData();
    }
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Länk kopierad till urklipp!');
  };

  if (!event) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </DashboardLayout>
    );
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
              onRefresh={loadData}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <EventForm initialData={event} onSubmit={handleSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

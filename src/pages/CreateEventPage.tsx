import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventForm } from '@/components/events/EventForm';
import { useCreateEvent } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Event } from '@/types/event';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  const handleSubmit = (data: Omit<Event, 'id' | 'createdAt' | 'currentAttendees'>) => {
    createEventMutation.mutate(data, {
      onSuccess: (newEvent) => {
        toast.success('Event skapat!');
        navigate(`/dashboard/events/${newEvent.id}`);
      },
      onError: () => {
        toast.error('Kunde inte skapa event');
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Link to="/dashboard/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Skapa nytt event</h1>
            <p className="text-muted-foreground mt-1">Fyll i informationen nedan för att skapa ett nytt event</p>
          </div>
        </div>

        {/* Form */}
        <div className="animate-fade-in stagger-1">
          <EventForm onSubmit={handleSubmit} isLoading={createEventMutation.isPending} />
        </div>
      </div>
    </DashboardLayout>
  );
}

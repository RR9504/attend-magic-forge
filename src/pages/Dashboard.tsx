import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventCard } from '@/components/events/EventCard';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { data: events = [], isLoading } = useEvents();
  const deleteEventMutation = useDeleteEvent();

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort detta event?')) {
      deleteEventMutation.mutate(id, {
        onSuccess: () => toast.success('Event borttaget'),
        onError: () => toast.error('Kunde inte ta bort event'),
      });
    }
  };

  const publishedEvents = events.filter(e => e.status === 'published');
  const totalAttendees = events.reduce((sum, e) => sum + e.currentAttendees, 0);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());

  const stats = [
    {
      label: 'Aktiva event',
      value: publishedEvents.length,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Totalt anmälda',
      value: totalAttendees,
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Kommande event',
      value: upcomingEvents.length,
      icon: Clock,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Översikt över dina event och anmälningar</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-lg md:rounded-xl border p-3 md:p-5 animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Senaste event
          </h2>
          
          {isLoading ? (
            <div className="text-center py-16 bg-card rounded-xl border animate-fade-in">
              <p className="text-muted-foreground">Laddar event...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border animate-fade-in">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Inga event ännu
              </h3>
              <p className="text-muted-foreground mb-6">
                Skapa ditt första event för att komma igång
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

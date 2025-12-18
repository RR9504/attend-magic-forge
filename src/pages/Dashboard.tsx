import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventCard } from '@/components/events/EventCard';
import { getEvents, deleteEvent } from '@/lib/eventStore';
import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort detta event?')) {
      deleteEvent(id);
      setEvents(getEvents());
      toast.success('Event borttaget');
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
    {
      label: 'Fyllnadsgrad',
      value: events.length > 0 
        ? `${Math.round((totalAttendees / events.reduce((sum, e) => sum + e.maxAttendees, 0)) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Översikt över dina event och anmälningar</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl border p-5 animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
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
          
          {events.length === 0 ? (
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

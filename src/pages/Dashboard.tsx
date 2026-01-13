import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventCard } from '@/components/events/EventCard';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { Calendar, Users, Clock, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: events = [], isLoading } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">Översikt över dina event och anmälningar</p>
          </div>
          <Link to="/dashboard/events/new" className="hidden sm:block">
            <Button variant="accent" size="lg">
              <Plus className="w-5 h-5" />
              Skapa nytt event
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
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

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 md:gap-4 animate-fade-in stagger-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="flex-shrink-0"
            >
              Alla
            </Button>
            <Button
              variant={statusFilter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('published')}
              className="flex-shrink-0"
            >
              Publicerade
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
              className="flex-shrink-0"
            >
              Utkast
            </Button>
            <Button
              variant={statusFilter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('closed')}
              className="flex-shrink-0"
            >
              Stängda
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Event
          </h2>
          
          {isLoading ? (
            <div className="text-center py-16 bg-card rounded-xl border animate-fade-in">
              <p className="text-muted-foreground">Laddar event...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-card rounded-xl border animate-fade-in">
              <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground/30 mb-3 md:mb-4" />
              <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Inga event matchar din sökning'
                  : 'Inga event ännu'}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6 px-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Försök med en annan sökning eller filter'
                  : 'Skapa ditt första event för att komma igång'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link to="/dashboard/events/new">
                  <Button variant="accent">
                    <Plus className="w-4 h-4" />
                    Skapa event
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index + 2) * 50}ms` }}
                >
                  <EventCard event={event} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

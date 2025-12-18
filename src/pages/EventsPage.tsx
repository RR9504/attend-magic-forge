import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventCard } from '@/components/events/EventCard';
import { getEvents, deleteEvent } from '@/lib/eventStore';
import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Event</h1>
            <p className="text-muted-foreground mt-1">Hantera och skapa nya event</p>
          </div>
          <Link to="/dashboard/events/new">
            <Button variant="accent" size="lg">
              <Plus className="w-5 h-5" />
              Skapa nytt event
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Alla
            </Button>
            <Button
              variant={statusFilter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('published')}
            >
              Publicerade
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
            >
              Utkast
            </Button>
            <Button
              variant={statusFilter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('closed')}
            >
              Stängda
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border animate-fade-in">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' 
                ? 'Inga event matchar din sökning'
                : 'Inga event ännu'}
            </h3>
            <p className="text-muted-foreground mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </DashboardLayout>
  );
}

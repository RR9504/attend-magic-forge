import { Event } from '@/types/event';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  onDelete?: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const spotsLeft = event.maxAttendees - event.currentAttendees;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 5;
  
  const statusBadge = {
    draft: { label: 'Utkast', variant: 'secondary' as const },
    published: { label: 'Publicerad', variant: 'success' as const },
    closed: { label: 'Stängd', variant: 'outline' as const },
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 animate-fade-in">
      {/* Event Image */}
      <div className="relative h-36 md:h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 text-primary/20" />
          </div>
        )}
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <Badge variant={statusBadge[event.status].variant}>
            {statusBadge[event.status].label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 md:p-5">
        <h3 className="font-display text-lg md:text-xl font-semibold text-foreground line-clamp-2 mb-2 md:mb-3">
          {event.title}
        </h3>
        
        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent flex-shrink-0" />
            <span>{formatDate(event.date)} kl. {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent flex-shrink-0" />
            <span>
              {event.currentAttendees} / {event.maxAttendees} anmälda
            </span>
            {isFull && (
              <Badge variant="destructive" className="ml-auto text-xs">Fullbokat</Badge>
            )}
            {isAlmostFull && !isFull && (
              <Badge variant="warning" className="ml-auto text-xs">{spotsLeft} kvar</Badge>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 md:mt-4">
          <div className="h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isFull ? "bg-destructive" : isAlmostFull ? "bg-warning" : "bg-success"
              )}
              style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 md:px-5 md:pb-5 gap-2">
        <Link to={`/event/${event.id}`} className="flex-1">
          <Button variant="outline" className="w-full touch-target" size="sm">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Visa</span>
          </Button>
        </Link>
        <Link to={`/dashboard/events/${event.id}`} className="flex-1">
          <Button variant="secondary" className="w-full touch-target" size="sm">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Redigera</span>
          </Button>
        </Link>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive touch-target"
            onClick={() => onDelete(event.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

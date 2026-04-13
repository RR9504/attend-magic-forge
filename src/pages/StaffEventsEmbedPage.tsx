import { useStaffEvents } from '@/hooks/useStaffEvents';
import { useCreateStaffSignup } from '@/hooks/useStaffSignups';
import { StaffEvent } from '@/types/staffEvent';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export default function StaffEventsEmbedPage() {
  const { data: staffEvents = [], isLoading } = useStaffEvents();

  const today = new Date().toISOString().split('T')[0];
  // Embed only shows future events with available spots
  const availableEvents = staffEvents.filter(
    e => e.status === 'open' && e.currentSignups < e.staffNeeded && e.date >= today
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="bg-background text-foreground p-4 space-y-4" style={{ fontFamily: 'inherit' }}>
      <Sonner position="top-center" />

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Laddar event...</p>
      ) : (
        <>
          {availableEvents.length > 0 ? (
            <div className="space-y-2">
              {availableEvents.map((event, index) => (
                <EmbedEventCard
                  key={event.id}
                  event={event}
                  index={index}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Alla event är fullbokade just nu. Fler tillkommer under året!
            </p>
          )}

          <p className="text-[11px] text-muted-foreground text-center pt-2 border-t border-border">
            Bemanning av event är en del av årets Guldekenmål
          </p>
        </>
      )}
    </div>
  );
}

function EmbedEventCard({
  event,
  index,
  formatDate,
}: {
  event: StaffEvent;
  index: number;
  formatDate: (d: string) => string;
}) {
  const createSignupMutation = useCreateStaffSignup();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Ange ditt namn');
      return;
    }

    createSignupMutation.mutate(
      {
        eventId: event.id,
        name: name.trim(),
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          toast.success('Tack för din anmälan!');
        },
        onError: () => {
          toast.error('Kunde inte anmäla. Eventet kan vara fullt.');
        },
      }
    );
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-sm animate-fade-in">
        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
        <span>Tack {name}! Du är anmäld till <strong>{event.title}</strong>.</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="rounded-lg border p-3 space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-sm">{event.title}</span>
          <span className="text-xs text-muted-foreground">— {formatDate(event.date)}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor={`embed-name-${event.id}`} className="text-xs">Namn *</Label>
            <Input
              id={`embed-name-${event.id}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="Ditt namn"
              className={cn("h-9 text-sm", nameError && "border-destructive")}
            />
            {nameError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{nameError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={createSignupMutation.isPending}
          >
            {createSignupMutation.isPending ? 'Skickar...' : 'Anmäl mig'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "hover:border-primary hover:shadow-sm active:scale-[0.99]",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground">{event.title}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(event.date)}
            </span>
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex flex-col items-center px-2 py-1 rounded text-xs font-semibold flex-shrink-0",
            event.currentSignups >= event.staffNeeded
              ? "bg-success/10 text-success"
              : event.currentSignups > 0
                ? "bg-warning/10 text-warning"
                : "bg-muted text-muted-foreground"
          )}
        >
          <span>{event.currentSignups}/{event.staffNeeded}</span>
          <span className="text-[10px] font-normal">anmälda</span>
        </div>
      </div>
    </button>
  );
}

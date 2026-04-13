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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameError, setNameError] = useState('');

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('Ange både för- och efternamn');
      return;
    }

    createSignupMutation.mutate(
      {
        eventId: event.id,
        name: fullName,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          toast.success('Tack för din anmälan!');
        },
        onError: (err) => {
          toast.error(
            err?.message === 'DUPLICATE'
              ? 'Du är redan anmäld till detta event!'
              : 'Kunde inte anmäla. Eventet kan vara fullt.'
          );
        },
      }
    );
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-sm animate-fade-in">
        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
        <span>Tack {fullName}! Du är anmäld till <strong>{event.title}</strong>.</span>
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
            <Label htmlFor={`embed-fname-${event.id}`} className="text-xs">Förnamn *</Label>
            <Input
              id={`embed-fname-${event.id}`}
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setNameError(''); }}
              placeholder="Förnamn"
              className={cn("h-9 text-sm", nameError && !firstName.trim() && "border-destructive")}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor={`embed-lname-${event.id}`} className="text-xs">Efternamn *</Label>
            <Input
              id={`embed-lname-${event.id}`}
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setNameError(''); }}
              placeholder="Efternamn"
              className={cn("h-9 text-sm", nameError && !lastName.trim() && "border-destructive")}
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

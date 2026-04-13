import { useStaffEvents } from '@/hooks/useStaffEvents';
import { useCreateStaffSignup } from '@/hooks/useStaffSignups';
import { StaffEvent } from '@/types/staffEvent';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function StaffEventsPublicPage() {
  const { data: staffEvents = [], isLoading } = useStaffEvents();

  const openEvents = staffEvents.filter(e => e.status === 'open');
  const fullEvents = staffEvents.filter(e => e.status === 'full');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Event att bemanna
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base leading-relaxed">
            För att öka vår lokala närvaro och stärka vårt varumärke deltar banken i – eller arrangerar – ett flertal event under verksamhetsåret. Just nu finns det platser kvar att bemanna följande event – välkommen att anmäla ditt intresse!
          </p>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-8">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Laddar event...</p>
          </div>
        ) : (
          <>
            {/* Open events */}
            {openEvents.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Anmäl dig
                </h2>
                {openEvents.map((event, index) => (
                  <StaffEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Full events */}
            {fullEvents.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold text-muted-foreground">
                  Fullbokade
                </h2>
                {fullEvents.map((event, index) => (
                  <Card key={event.id} className="opacity-60 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(event.date)}
                            {event.location && ` — ${event.location}`}
                          </p>
                        </div>
                        <Badge variant="secondary">Fullbokad</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {openEvents.length === 0 && fullEvents.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Inga event just nu
                </h3>
                <p className="text-muted-foreground text-sm">
                  Fler event att anmäla sig till kommer att tillkomma under året. Håll utkik!
                </p>
              </div>
            )}

            {/* Footer note */}
            <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
              Att bemanna event (som ofta hamnar utanför den vanliga arbetstiden) är en del av årets Guldekenmål.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function StaffEventCard({
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

  return (
    <Card
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4 md:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground text-lg">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
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

          {/* Staffing indicator */}
          <div
            className={cn(
              "flex flex-col items-center px-3 py-2 rounded-lg text-sm font-bold flex-shrink-0",
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

        {/* Sign up section */}
        {isSubmitted ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-sm text-foreground">
              Tack {name}! Du är anmäld till {event.title}.
            </span>
          </div>
        ) : showForm ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-3 border-t border-border animate-fade-in">
            <div className="flex-1 space-y-1">
              <Label htmlFor={`name-${event.id}`} className="text-xs">Namn *</Label>
              <Input
                id={`name-${event.id}`}
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="Ditt namn"
                className={cn(nameError && "border-destructive")}
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Avbryt
            </Button>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setShowForm(true)}
          >
            Anmäl intresse
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

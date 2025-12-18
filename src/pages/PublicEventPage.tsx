import { getEvent, addRegistration } from '@/lib/eventStore';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PublicEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      const eventData = getEvent(id);
      if (eventData) {
        setEvent(eventData);
        // Initialize form data
        const initialData: Record<string, string | boolean> = {};
        eventData.formFields.forEach(field => {
          initialData[field.name] = field.type === 'checkbox' ? false : '';
        });
        setFormData(initialData);
      } else {
        setNotFound(true);
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id) return;

    setIsSubmitting(true);

    // Simulate a small delay for UX
    setTimeout(() => {
      const registration = addRegistration(id, formData);
      
      if (registration) {
        setIsSubmitted(true);
        // Refresh event data to get updated count
        const updatedEvent = getEvent(id);
        if (updatedEvent) setEvent(updatedEvent);
        toast.success('Anmälan skickad!');
      } else {
        toast.error('Eventet är fullt eller stängt för anmälan');
      }
      
      setIsSubmitting(false);
    }, 500);
  };

  const updateFormData = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Event hittades inte
          </h1>
          <p className="text-muted-foreground mb-6">
            Eventet du letar efter finns inte eller har tagits bort.
          </p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Till startsidan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  const spotsLeft = event.maxAttendees - event.currentAttendees;
  const isFull = spotsLeft <= 0;
  const isClosed = event.status === 'closed';
  const canRegister = !isFull && !isClosed && event.status === 'published';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container max-w-4xl mx-auto px-4 -mt-32 relative z-10">
          <Card className="shadow-xl animate-fade-in">
            <CardContent className="p-6 md:p-8">
              {/* Status Badge */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isFull && <Badge variant="destructive">Fullbokat</Badge>}
                {isClosed && <Badge variant="secondary">Stängt för anmälan</Badge>}
                {canRegister && spotsLeft <= 10 && (
                  <Badge variant="warning">{spotsLeft} platser kvar</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Datum</p>
                    <p className="text-sm">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Tid</p>
                    <p className="text-sm">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Plats</p>
                    <p className="text-sm">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
                <p>{event.description}</p>
              </div>

              {/* Spots Info */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary mb-6">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  <span className="font-semibold text-foreground">{event.currentAttendees}</span>
                  <span className="text-muted-foreground"> av {event.maxAttendees} platser bokade</span>
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden ml-4">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isFull ? "bg-destructive" : spotsLeft <= 5 ? "bg-warning" : "bg-success"
                    )}
                    style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Form */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {isSubmitted ? (
          <Card className="animate-scale-in">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-success mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Tack för din anmälan!
              </h2>
              <p className="text-muted-foreground mb-6">
                Du är nu anmäld till {event.title}. Vi ser fram emot att träffa dig!
              </p>
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4" />
                  Till startsidan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : canRegister ? (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display">Anmälan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {event.formFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {field.type === 'checkbox' ? (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={field.id}
                          checked={formData[field.name] as boolean}
                          onCheckedChange={(checked) => updateFormData(field.name, !!checked)}
                        />
                        <Label htmlFor={field.id} className="cursor-pointer">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                      </div>
                    ) : field.type === 'textarea' ? (
                      <div className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Textarea
                          id={field.id}
                          value={formData[field.name] as string}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          rows={4}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type={field.type}
                          value={formData[field.name] as string}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Skickar...' : 'Skicka anmälan'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {isFull ? 'Eventet är fullbokat' : 'Anmälan stängd'}
              </h2>
              <p className="text-muted-foreground">
                {isFull
                  ? 'Tyvärr har alla platser blivit bokade.'
                  : 'Det går inte längre att anmäla sig till detta event.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

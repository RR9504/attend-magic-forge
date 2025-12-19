import { useEvent } from '@/hooks/useEvents';
import { useCreateRegistration } from '@/hooks/useRegistrations';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, CheckCircle2, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().trim().email('Ogiltig e-postadress').max(255, 'E-postadressen är för lång');
const textSchema = z.string().trim().max(500, 'Texten är för lång (max 500 tecken)');
const textareaSchema = z.string().trim().max(2000, 'Texten är för lång (max 2000 tecken)');

export default function PublicEventPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useEvent(id || '');
  const createRegistrationMutation = useCreateRegistration();
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (event) {
      const initialData: Record<string, string | boolean> = {};
      event.formFields.forEach(field => {
        initialData[field.name] = field.type === 'checkbox' ? false : '';
      });
      setFormData(initialData);
    }
  }, [event]);

  const validateField = (field: { name: string; type: string; required?: boolean }, value: string | boolean): string | null => {
    if (field.required && (value === '' || value === false)) {
      return 'Detta fält är obligatoriskt';
    }

    if (typeof value === 'string' && value.trim() !== '') {
      // Validate email fields
      if (field.type === 'email' || field.name.toLowerCase().includes('email') || field.name.toLowerCase().includes('e-post')) {
        const result = emailSchema.safeParse(value);
        if (!result.success) {
          return result.error.errors[0].message;
        }
      }
      // Validate textarea fields
      else if (field.type === 'textarea') {
        const result = textareaSchema.safeParse(value);
        if (!result.success) {
          return result.error.errors[0].message;
        }
      }
      // Validate regular text fields
      else if (field.type === 'text') {
        const result = textSchema.safeParse(value);
        if (!result.success) {
          return result.error.errors[0].message;
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!event) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    event.formFields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id) return;

    if (!validateForm()) {
      toast.error('Vänligen korrigera felen i formuläret');
      return;
    }

    // Sanitize form data before submission
    const sanitizedData: Record<string, string | boolean> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitizedData[key] = value.trim();
      } else {
        sanitizedData[key] = value;
      }
    });

    createRegistrationMutation.mutate(
      { eventId: id, data: sanitizedData },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          toast.success('Anmälan skickad!');
        },
        onError: () => {
          toast.error('Eventet är fullt eller stängt för anmälan');
        },
      }
    );
  };

  const updateFormData = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
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

  if (isLoading || !event) {
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
                      <div className="space-y-1">
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
                        {formErrors[field.name] && (
                          <div className="flex items-center gap-1 text-destructive text-sm">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors[field.name]}
                          </div>
                        )}
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
                          maxLength={2000}
                          className={cn(formErrors[field.name] && "border-destructive")}
                        />
                        {formErrors[field.name] && (
                          <div className="flex items-center gap-1 text-destructive text-sm">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors[field.name]}
                          </div>
                        )}
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
                          maxLength={field.type === 'email' ? 255 : 500}
                          className={cn(formErrors[field.name] && "border-destructive")}
                        />
                        {formErrors[field.name] && (
                          <div className="flex items-center gap-1 text-destructive text-sm">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors[field.name]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={createRegistrationMutation.isPending}
                >
                  {createRegistrationMutation.isPending ? 'Skickar...' : 'Skicka anmälan'}
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

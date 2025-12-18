import { Event, EventFormField, DEFAULT_FORM_FIELDS } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventFormProps {
  initialData?: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'createdAt' | 'currentAttendees'>) => void;
  isLoading?: boolean;
}

export function EventForm({ initialData, onSubmit, isLoading }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [maxAttendees, setMaxAttendees] = useState(initialData?.maxAttendees || 50);
  const [status, setStatus] = useState<Event['status']>(initialData?.status || 'draft');
  const [formFields, setFormFields] = useState<EventFormField[]>(
    initialData?.formFields || DEFAULT_FORM_FIELDS
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      date,
      time,
      location,
      imageUrl,
      maxAttendees,
      status,
      formFields,
    });
  };

  const addField = () => {
    const newField: EventFormField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: 'Nytt fält',
      type: 'text',
      required: false,
      placeholder: '',
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (id: string, updates: Partial<EventFormField>) => {
    setFormFields(fields =>
      fields.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    setFormFields(fields => fields.filter(f => f.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Grundinformation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Eventnamn *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Investeringsfrukost 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv eventet för dina besökare..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Tid *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Plats *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="T.ex. Sparbanken Huvudkontor, Storgatan 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttendees">Max antal deltagare *</Label>
            <Input
              id="maxAttendees"
              type="number"
              min={1}
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Eventbild</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Bild-URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/bild.jpg"
            />
          </div>
          
          {imageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-secondary">
              <img
                src={imageUrl}
                alt="Event preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {!imageUrl && (
            <div className="w-full h-48 rounded-lg bg-secondary flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen bild vald</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Anmälningsformulär</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="w-4 h-4" />
            Lägg till fält
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {formFields.map((field, index) => (
            <div
              key={field.id}
              className={cn(
                "flex flex-col gap-3 p-3 md:p-4 rounded-lg border bg-card",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">{field.label || 'Nytt fält'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                    <Label className="text-xs text-muted-foreground">Obligatorisk</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Fältnamn</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="T.ex. Namn"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Typ</Label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as EventFormField['type'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="text">Text</option>
                    <option value="email">E-post</option>
                    <option value="tel">Telefon</option>
                    <option value="textarea">Fritext</option>
                    <option value="checkbox">Kryssruta</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Placeholder</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                    placeholder="T.ex. Ditt namn"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Status & Submit */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Label className="text-sm">Status:</Label>
              <div className="flex gap-2 flex-wrap">
                {(['draft', 'published', 'closed'] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={status === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus(s)}
                    className="flex-1 sm:flex-none"
                  >
                    {s === 'draft' ? 'Utkast' : s === 'published' ? 'Publicera' : 'Stängd'}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button type="submit" variant="accent" size="lg" disabled={isLoading} className="w-full sm:w-auto sm:ml-auto">
              <Save className="w-4 h-4" />
              {isLoading ? 'Sparar...' : 'Spara event'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

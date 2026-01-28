import { Event, EventFormField, DEFAULT_FORM_FIELDS, ConditionalField, ImagePosition } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Save, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { ImagePositioner } from './ImagePositioner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [imagePosition, setImagePosition] = useState<ImagePosition>(
    initialData?.imagePosition || { x: 50, y: 50 }
  );
  const [maxAttendees, setMaxAttendees] = useState(initialData?.maxAttendees || 50);
  const [status, setStatus] = useState<Event['status']>(initialData?.status || 'draft');
  const [formFields, setFormFields] = useState<EventFormField[]>(
    initialData?.formFields || DEFAULT_FORM_FIELDS
  );
  const [showBookedSeats, setShowBookedSeats] = useState(initialData?.showBookedSeats ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Endast bildfiler är tillåtna');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bilden får max vara 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Bilden har laddats upp');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Kunde inte ladda upp bilden');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      date,
      time,
      location,
      imageUrl,
      imagePosition,
      maxAttendees,
      status,
      formFields,
      showBookedSeats,
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
          <p className="text-sm text-muted-foreground">
            Rekommenderad upplösning: <strong>1920 × 1080 px</strong> (16:9) för bästa kvalitet
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 sm:flex-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Laddar upp...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Ladda upp bild
                </>
              )}
            </Button>
            {imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearImage}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Or use URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">Eller ange bild-URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/bild.jpg"
            />
          </div>
          
          {imageUrl && (
            <div className="space-y-2">
              <ImagePositioner
                imageUrl={imageUrl}
                position={imagePosition}
                onChange={setImagePosition}
              />
              <p className="text-xs text-muted-foreground text-center">
                Position: {Math.round(imagePosition.x)}% horisontellt, {Math.round(imagePosition.y)}% vertikalt
              </p>
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
                
                {field.type !== 'checkbox' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="T.ex. Ditt namn"
                    />
                  </div>
                )}
              </div>

              {/* Conditional field settings for checkbox */}
              {field.type === 'checkbox' && (
                <div className="mt-2 pt-3 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.conditionalField?.enabled || false}
                      onCheckedChange={(checked) => {
                        const conditionalField: ConditionalField = checked
                          ? { enabled: true, label: '', type: 'text', required: false, placeholder: '' }
                          : { enabled: false, label: '', type: 'text', required: false, placeholder: '' };
                        updateField(field.id, { conditionalField });
                      }}
                    />
                    <Label className="text-xs text-muted-foreground">Visa villkorligt fält när ikryssad</Label>
                  </div>

                  {field.conditionalField?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3 rounded-md bg-muted/50">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Fältnamn</Label>
                        <Input
                          value={field.conditionalField.label}
                          onChange={(e) => updateField(field.id, {
                            conditionalField: { ...field.conditionalField!, label: e.target.value }
                          })}
                          placeholder="T.ex. Beskriv mer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Typ</Label>
                        <select
                          value={field.conditionalField.type}
                          onChange={(e) => updateField(field.id, {
                            conditionalField: { ...field.conditionalField!, type: e.target.value as ConditionalField['type'] }
                          })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="text">Text</option>
                          <option value="email">E-post</option>
                          <option value="tel">Telefon</option>
                          <option value="textarea">Fritext</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Placeholder</Label>
                        <Input
                          value={field.conditionalField.placeholder || ''}
                          onChange={(e) => updateField(field.id, {
                            conditionalField: { ...field.conditionalField!, placeholder: e.target.value }
                          })}
                          placeholder="T.ex. Ange detaljer"
                        />
                      </div>

                      <div className="flex items-center gap-2 md:col-span-3">
                        <Switch
                          checked={field.conditionalField.required}
                          onCheckedChange={(checked) => updateField(field.id, {
                            conditionalField: { ...field.conditionalField!, required: checked }
                          })}
                        />
                        <Label className="text-xs text-muted-foreground">Obligatoriskt när synligt</Label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Settings & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Inställningar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show booked seats toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="showBookedSeats" className="font-medium">Visa antal bokade platser</Label>
              <p className="text-sm text-muted-foreground">
                Visa för kunder hur många platser som är bokade
              </p>
            </div>
            <Switch
              id="showBookedSeats"
              checked={showBookedSeats}
              onCheckedChange={setShowBookedSeats}
            />
          </div>

          {/* Status */}
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
        </CardContent>
      </Card>
    </form>
  );
}

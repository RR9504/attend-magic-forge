import { Campaign, DEFAULT_CAMPAIGN_FORM_FIELDS } from '@/types/campaign';
import { EventFormField, ConditionalField } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { StoreSelector } from './StoreSelector';
import { cn } from '@/lib/utils';

interface CampaignFormProps {
  initialData?: Partial<Campaign>;
  initialStoreIds?: string[];
  onSubmit: (data: Omit<Campaign, 'id' | 'createdAt'>, storeIds: string[]) => void;
  isLoading?: boolean;
}

export function CampaignForm({ initialData, initialStoreIds, onSubmit, isLoading }: CampaignFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [minAmount, setMinAmount] = useState(initialData?.minAmount || 0);
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [status, setStatus] = useState<Campaign['status']>(initialData?.status || 'draft');
  const [formFields, setFormFields] = useState<EventFormField[]>(
    initialData?.formFields || DEFAULT_CAMPAIGN_FORM_FIELDS
  );
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(initialStoreIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        title,
        description: description || undefined,
        minAmount: minAmount || undefined,
        formFields,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      selectedStoreIds
    );
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
            <Label htmlFor="title">Kampanjnamn *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Backstory Sölvesborg Vår 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv kampanjen för kunderna..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAmount">Minsta köpbelopp (kr)</Label>
            <Input
              id="minAmount"
              type="number"
              min={0}
              value={minAmount}
              onChange={(e) => setMinAmount(parseInt(e.target.value) || 0)}
              placeholder="T.ex. 200"
            />
            <p className="text-xs text-muted-foreground">
              Lämna 0 om inget minsta belopp krävs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Slutdatum</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Butiker</CardTitle>
          <p className="text-sm text-muted-foreground">
            Välj vilka butiker som ingår i kampanjen
          </p>
        </CardHeader>
        <CardContent>
          <StoreSelector
            selectedStoreIds={selectedStoreIds}
            onChange={setSelectedStoreIds}
          />
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Registreringsformulär</CardTitle>
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

              {/* Checkbox conditional field */}
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

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            {isLoading ? 'Sparar...' : 'Spara kampanj'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

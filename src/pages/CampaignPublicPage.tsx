import { useCampaign } from '@/hooks/useCampaigns';
import { useCampaignStores } from '@/hooks/useCampaignStores';
import { useCreateCampaignEntry } from '@/hooks/useCampaignEntries';
import { useParams, Link } from 'react-router-dom';
import { EventFormField } from '@/types/event';
import { Store } from '@/types/campaign';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptUpload } from '@/components/campaigns/ReceiptUpload';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertCircle,
  Store as StoreIcon,
  MapPin,
  Ticket,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Ogiltig e-postadress').max(255);
const textSchema = z.string().trim().max(500, 'Texten är för lång (max 500 tecken)');
const textareaSchema = z.string().trim().max(2000, 'Texten är för lång (max 2000 tecken)');

type Step = 'store' | 'form' | 'done';

export default function CampaignPublicPage() {
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isLoading, error } = useCampaign(id || '');
  const { data: stores = [] } = useCampaignStores(id || '');
  const createEntryMutation = useCreateCampaignEntry();

  const [step, setStep] = useState<Step>('store');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [receiptAmount, setReceiptAmount] = useState<number | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  useEffect(() => {
    if (campaign) {
      const initialData: Record<string, string | boolean> = {};
      campaign.formFields.forEach(field => {
        initialData[field.name] = field.type === 'checkbox' ? false : '';
      });
      setFormData(initialData);
    }
  }, [campaign]);

  const validateField = (field: { name: string; type: string; required?: boolean }, value: string | boolean): string | null => {
    if (field.required && (value === '' || value === false)) {
      return 'Detta fält är obligatoriskt';
    }
    if (typeof value === 'string' && value.trim() !== '') {
      if (field.type === 'email' || field.name.toLowerCase().includes('email') || field.name.toLowerCase().includes('e-post')) {
        const result = emailSchema.safeParse(value);
        if (!result.success) return result.error.errors[0].message;
      } else if (field.type === 'textarea') {
        const result = textareaSchema.safeParse(value);
        if (!result.success) return result.error.errors[0].message;
      } else if (field.type === 'text') {
        const result = textSchema.safeParse(value);
        if (!result.success) return result.error.errors[0].message;
      }
    }
    return null;
  };

  const validateForm = (): boolean => {
    if (!campaign) return false;
    const errors: Record<string, string> = {};
    let isValid = true;

    campaign.formFields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }

      const typedField = field as EventFormField;
      if (field.type === 'checkbox' && typedField.conditionalField?.enabled && formData[field.name] === true) {
        const conditionalValue = formData[`${field.name}_conditional`];
        const conditionalError = validateField(
          { name: `${field.name}_conditional`, type: typedField.conditionalField.type, required: typedField.conditionalField.required },
          conditionalValue
        );
        if (conditionalError) {
          errors[`${field.name}_conditional`] = conditionalError;
          isValid = false;
        }
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !id || !selectedStore) return;

    if (!validateForm()) {
      toast.error('Vänligen korrigera felen i formuläret');
      return;
    }

    if (!acceptedPrivacy) {
      setPrivacyError(true);
      toast.error('Du måste godkänna behandlingen av personuppgifter');
      return;
    }

    const sanitizedData: Record<string, string | boolean> = {};
    Object.entries(formData).forEach(([key, value]) => {
      sanitizedData[key] = typeof value === 'string' ? value.trim() : value;
    });

    createEntryMutation.mutate(
      {
        campaignId: id,
        storeId: selectedStore.id,
        data: sanitizedData,
        receiptImageUrl: receiptImageUrl || undefined,
        receiptAmount: receiptAmount ?? undefined,
      },
      {
        onSuccess: () => {
          setStep('done');
          toast.success('Tack för ditt deltagande!');
        },
        onError: () => {
          toast.error('Kunde inte skicka in. Försök igen.');
        },
      }
    );
  };

  const updateFormData = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Kampanjen hittades inte
          </h1>
          <p className="text-muted-foreground mb-6">
            Kampanjen du letar efter finns inte eller har tagits bort.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  const isClosed = campaign.status === 'closed';

  if (isClosed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-fade-in">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Kampanjen är stängd
            </h2>
            <p className="text-muted-foreground">
              Det går inte längre att delta i denna kampanj.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                {campaign.title}
              </h1>
              {campaign.description && (
                <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
              )}
            </div>
          </div>
          {campaign.minAmount && campaign.minAmount > 0 && (
            <div className="text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2 inline-block">
              Minsta köpbelopp: <span className="font-semibold text-foreground">{campaign.minAmount} kr</span>
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Step 1: Choose store */}
        {step === 'store' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Välj butik
            </h2>
            <p className="text-sm text-muted-foreground">
              Vilken butik handlade du i?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stores.map((store, index) => (
                <button
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setStep('form');
                  }}
                  className={cn(
                    "p-4 rounded-lg border bg-card text-left transition-all",
                    "hover:border-primary hover:shadow-md",
                    "active:scale-[0.98]",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <StoreIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{store.name}</p>
                      {store.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {store.address}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Form + Receipt */}
        {step === 'form' && (
          <div className="space-y-6 animate-fade-in">
            {/* Back button + selected store */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('store')}
              >
                <ChevronLeft className="w-4 h-4" />
                Byt butik
              </Button>
              <span className="text-sm text-muted-foreground">
                — {selectedStore?.name}
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Fyll i dina uppgifter</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {campaign.formFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {field.type === 'checkbox' ? (
                        <div className="space-y-3">
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
                          {(field as EventFormField).conditionalField?.enabled && formData[field.name] === true && (
                            <div className="ml-6 pl-3 border-l-2 border-primary/30 space-y-2 animate-fade-in">
                              <Label htmlFor={`${field.id}-conditional`}>
                                {(field as EventFormField).conditionalField?.label || 'Mer information'}
                                {(field as EventFormField).conditionalField?.required && <span className="text-destructive ml-1">*</span>}
                              </Label>
                              {(field as EventFormField).conditionalField?.type === 'textarea' ? (
                                <Textarea
                                  id={`${field.id}-conditional`}
                                  value={(formData[`${field.name}_conditional`] as string) || ''}
                                  onChange={(e) => updateFormData(`${field.name}_conditional`, e.target.value)}
                                  placeholder={(field as EventFormField).conditionalField?.placeholder}
                                  rows={3}
                                  maxLength={2000}
                                  className={cn(formErrors[`${field.name}_conditional`] && "border-destructive")}
                                />
                              ) : (
                                <Input
                                  id={`${field.id}-conditional`}
                                  type={(field as EventFormField).conditionalField?.type || 'text'}
                                  value={(formData[`${field.name}_conditional`] as string) || ''}
                                  onChange={(e) => updateFormData(`${field.name}_conditional`, e.target.value)}
                                  placeholder={(field as EventFormField).conditionalField?.placeholder}
                                  maxLength={500}
                                  className={cn(formErrors[`${field.name}_conditional`] && "border-destructive")}
                                />
                              )}
                              {formErrors[`${field.name}_conditional`] && (
                                <div className="flex items-center gap-1 text-destructive text-sm">
                                  <AlertCircle className="w-3 h-3" />
                                  {formErrors[`${field.name}_conditional`]}
                                </div>
                              )}
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

                  {/* Receipt Upload */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-base font-medium">Kvitto</Label>
                    <p className="text-sm text-muted-foreground">
                      Ta en bild på ditt kvitto eller ladda upp en befintlig bild
                    </p>
                    <ReceiptUpload
                      campaignId={id!}
                      onUpload={setReceiptImageUrl}
                      onOcrResult={setReceiptAmount}
                      imageUrl={receiptImageUrl}
                    />
                    {receiptAmount != null && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm">
                          Avläst belopp: <span className="font-semibold">{receiptAmount} kr</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Privacy */}
                  <div className="space-y-1 pt-2 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="privacy-policy"
                        checked={acceptedPrivacy}
                        onCheckedChange={(checked) => {
                          setAcceptedPrivacy(!!checked);
                          if (checked) setPrivacyError(false);
                        }}
                        className="mt-0.5"
                      />
                      <Label htmlFor="privacy-policy" className="cursor-pointer text-sm leading-relaxed">
                        Jag godkänner att mina personuppgifter behandlas enligt{' '}
                        <a
                          href="https://www.smsparbank.se/bedrageri-och-sakerhet/banksekretess-och-integritet/behandling-av-personuppgifter.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:text-primary/80"
                        >
                          Sölvesborg Mjällby Sparbanks integritetspolicy
                        </a>
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                    </div>
                    {privacyError && (
                      <div className="flex items-center gap-1 text-destructive text-sm ml-6">
                        <AlertCircle className="w-3 h-3" />
                        Du måste godkänna behandlingen av personuppgifter
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={createEntryMutation.isPending}
                  >
                    {createEntryMutation.isPending ? 'Skickar...' : 'Delta i utlottningen'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'done' && (
          <Card className="animate-scale-in">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-success mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Tack för ditt deltagande!
              </h2>
              <p className="text-muted-foreground mb-6">
                Du är nu med i utlottningen. Lycka till!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

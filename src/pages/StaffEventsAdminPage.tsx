import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStaffEvents, useCreateStaffEvent, useUpdateStaffEvent, useDeleteStaffEvent } from '@/hooks/useStaffEvents';
import { useStaffSignups, useDeleteStaffSignup } from '@/hooks/useStaffSignups';
import { StaffEvent } from '@/types/staffEvent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Users,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Code,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function StaffEventsAdminPage() {
  const { data: staffEvents = [], isLoading } = useStaffEvents();
  const createMutation = useCreateStaffEvent();
  const updateMutation = useUpdateStaffEvent();
  const deleteMutation = useDeleteStaffEvent();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [staffNeeded, setStaffNeeded] = useState(4);
  const [status, setStatus] = useState<StaffEvent['status']>('open');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setStaffNeeded(4);
    setStatus('open');
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (event: StaffEvent) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
    setDate(event.date);
    setTime(event.time || '');
    setLocation(event.location || '');
    setStaffNeeded(event.staffNeeded);
    setStatus(event.status);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      location: location.trim() || undefined,
      staffNeeded,
      status,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, updates: data },
        {
          onSuccess: () => { toast.success('Event uppdaterat'); resetForm(); },
          onError: () => toast.error('Kunde inte uppdatera event'),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { toast.success('Event skapat'); resetForm(); },
        onError: () => toast.error('Kunde inte skapa event'),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort detta event?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Event borttaget'),
        onError: () => toast.error('Kunde inte ta bort event'),
      });
    }
  };

  const copyInternLink = () => {
    navigator.clipboard.writeText('https://smsparbank-event.se/intern');
    toast.success('Länk kopierad till urklipp!');
  };

  const copyEmbedCode = () => {
    const code = `<iframe src="https://smsparbank-event.se/intern/embed" style="width:100%;min-height:600px;border:none;" title="Interna event"></iframe>`;
    navigator.clipboard.writeText(code);
    toast.success('Embed-kod kopierad till urklipp!');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'long',
    });
  };

  const statusLabel = (s: string) =>
    s === 'open' ? 'Öppen' : s === 'full' ? 'Fullbokad' : 'Stängd';
  const statusVariant = (s: string) =>
    s === 'open' ? 'success' : s === 'full' ? 'warning' : 'secondary';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Interna event
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Hantera personalbemanningen för bankens event
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyEmbedCode}>
              <Code className="w-4 h-4" />
              <span className="ml-1">Embed-kod</span>
            </Button>
            <Button variant="outline" size="sm" onClick={copyInternLink}>
              <Copy className="w-4 h-4" />
              <span className="ml-1">Intern länk</span>
            </Button>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4" />
              Nytt event
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Redigera event' : 'Skapa nytt internt event'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="se-title">Eventnamn *</Label>
                    <Input
                      id="se-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="T.ex. Prideparad"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="se-desc">Beskrivning</Label>
                    <Textarea
                      id="se-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Beskriv eventet..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="se-date">Datum *</Label>
                    <Input
                      id="se-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="se-time">Tid</Label>
                    <Input
                      id="se-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="se-location">Plats</Label>
                    <Input
                      id="se-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="T.ex. Stortorget, Sölvesborg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="se-needed">Behov personal *</Label>
                    <Input
                      id="se-needed"
                      type="number"
                      min={1}
                      value={staffNeeded}
                      onChange={(e) => setStaffNeeded(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Label className="text-sm">Status:</Label>
                  <div className="flex gap-2">
                    {(['open', 'full', 'closed'] as const).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={status === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatus(s)}
                      >
                        {statusLabel(s)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                    {editingId ? 'Uppdatera' : 'Skapa'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4" />
                    Avbryt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Event List */}
        {isLoading ? (
          <div className="text-center py-16 bg-card rounded-xl border">
            <p className="text-muted-foreground">Laddar event...</p>
          </div>
        ) : staffEvents.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border animate-fade-in">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Inga interna event ännu
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Skapa event som personalen kan anmäla sig till
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Lediga platser */}
            {(() => {
              const available = staffEvents.filter(e => e.status === 'open' && e.currentSignups < e.staffNeeded);
              return available.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Lediga platser ({available.length})
                  </h2>
                  {available.map((event, index) => (
                    <StaffEventRow
                      key={event.id}
                      event={event}
                      index={index}
                      isExpanded={expandedId === event.id}
                      onToggleExpand={() => setExpandedId(expandedId === event.id ? null : event.id)}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      statusLabel={statusLabel}
                      statusVariant={statusVariant}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : null;
            })()}

            {/* Fullbokade */}
            {(() => {
              const full = staffEvents.filter(e => e.status === 'full' || (e.status === 'open' && e.currentSignups >= e.staffNeeded));
              return full.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-semibold text-muted-foreground">
                    Fullbokade ({full.length})
                  </h2>
                  {full.map((event, index) => (
                    <StaffEventRow
                      key={event.id}
                      event={event}
                      index={index}
                      isExpanded={expandedId === event.id}
                      onToggleExpand={() => setExpandedId(expandedId === event.id ? null : event.id)}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      statusLabel={statusLabel}
                      statusVariant={statusVariant}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : null;
            })()}

            {/* Stängda */}
            {(() => {
              const closed = staffEvents.filter(e => e.status === 'closed');
              return closed.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-semibold text-muted-foreground">
                    Stängda ({closed.length})
                  </h2>
                  {closed.map((event, index) => (
                    <StaffEventRow
                      key={event.id}
                      event={event}
                      index={index}
                      isExpanded={expandedId === event.id}
                      onToggleExpand={() => setExpandedId(expandedId === event.id ? null : event.id)}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      statusLabel={statusLabel}
                      statusVariant={statusVariant}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StaffEventRow({
  event,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  statusLabel,
  statusVariant,
  formatDate,
}: {
  event: StaffEvent;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  statusLabel: (s: string) => string;
  statusVariant: (s: string) => string;
  formatDate: (d: string) => string;
}) {
  const { data: signups = [] } = useStaffSignups(isExpanded ? event.id : '');
  const deleteSignupMutation = useDeleteStaffSignup();

  // We need a count even when not expanded. Use a separate lightweight query.
  const { data: allSignups = [] } = useStaffSignups(event.id);
  const signupCount = allSignups.length;
  const isFull = signupCount >= event.staffNeeded;

  const handleDeleteSignup = (signupId: string) => {
    if (window.confirm('Ta bort denna anmälan?')) {
      deleteSignupMutation.mutate(
        { id: signupId, eventId: event.id },
        {
          onSuccess: () => toast.success('Anmälan borttagen'),
          onError: () => toast.error('Kunde inte ta bort anmälan'),
        }
      );
    }
  };

  return (
    <Card
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex flex-col items-center justify-center text-sm font-bold",
                isFull
                  ? "bg-success/10 text-success"
                  : signupCount > 0
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <span>{signupCount}</span>
              <span className="text-[10px] font-normal">/ {event.staffNeeded}</span>
            </div>
          </div>

          {/* Event info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{event.title}</h3>
              <Badge variant={statusVariant(event.status) as any}>
                {statusLabel(event.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
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

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expanded: show signups */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border animate-fade-in">
            {signups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Inga anmälda ännu
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">{signup.name}</TableCell>
                      <TableCell className="text-muted-foreground">{signup.email || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{signup.phone || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(signup.signedUpAt).toLocaleDateString('sv-SE')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteSignup(signup.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

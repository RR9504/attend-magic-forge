import { Event, Registration } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Trash2, Mail, Users } from 'lucide-react';
import { useState } from 'react';
import { useDeleteRegistration } from '@/hooks/useRegistrations';
import { toast } from 'sonner';

interface RegistrationListProps {
  event: Event;
  registrations: Registration[];
}

export function RegistrationList({ event, registrations }: RegistrationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const deleteRegistrationMutation = useDeleteRegistration();

  const filteredRegistrations = registrations.filter((reg) => {
    const searchLower = searchQuery.toLowerCase();
    return Object.values(reg.data).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast.error('Inga anmälningar att exportera');
      return;
    }

    const fields = event.formFields.map(f => f.label);
    const headers = [...fields, 'Registreringsdatum'];
    
    const rows = registrations.map(reg => {
      const values = event.formFields.map(f => String(reg.data[f.name] || ''));
      values.push(new Date(reg.registeredAt).toLocaleString('sv-SE'));
      return values;
    });
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(v => `"${v}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '_')}_anmalningar.csv`;
    link.click();
    toast.success('Export slutförd!');
  };

  const handleExportEmails = () => {
    const emails = registrations
      .map((reg) => reg.data.email)
      .filter(Boolean)
      .join(', ');

    if (!emails) {
      toast.error('Inga e-postadresser att exportera');
      return;
    }

    navigator.clipboard.writeText(emails);
    toast.success('E-postadresser kopierade till urklipp!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna anmälan?')) {
      deleteRegistrationMutation.mutate(
        { id, eventId: event.id },
        {
          onSuccess: () => toast.success('Anmälan borttagen'),
          onError: () => toast.error('Kunde inte ta bort anmälan'),
        }
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="bg-card rounded-lg border p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-semibold text-foreground">
                {event.currentAttendees}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Anmälda</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-success" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-semibold text-foreground">
                {event.maxAttendees - event.currentAttendees}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Kvar</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-semibold text-foreground">
                {registrations.filter((r) => r.data.email).length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">E-post</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sök anmälningar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportEmails} className="flex-1 md:flex-none">
            <Mail className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Kopiera</span> e-post
          </Button>
          <Button variant="default" size="sm" onClick={exportToCSV} className="flex-1 md:flex-none">
            <Download className="w-4 h-4" />
            <span className="ml-1">CSV</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'Inga anmälningar matchar din sökning' : 'Inga anmälningar ännu'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {event.formFields.map((field) => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
                <TableHead>Datum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((reg, index) => (
                <TableRow 
                  key={reg.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {event.formFields.map((field) => (
                    <TableCell key={field.id}>
                      {field.type === 'checkbox' ? (
                        <Badge variant={reg.data[field.name] ? 'success' : 'secondary'}>
                          {reg.data[field.name] ? 'Ja' : 'Nej'}
                        </Badge>
                      ) : (
                        String(reg.data[field.name] || '-')
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(reg.registeredAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(reg.id)}
                      disabled={deleteRegistrationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

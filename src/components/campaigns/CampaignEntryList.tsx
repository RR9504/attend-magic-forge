import { Campaign, CampaignEntry, Store } from '@/types/campaign';
import { EventFormField } from '@/types/event';
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
import { Download, Search, Trash2, Users, Image as ImageIcon, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useDeleteCampaignEntry } from '@/hooks/useCampaignEntries';
import { toast } from 'sonner';

interface CampaignEntryListProps {
  campaign: Campaign;
  entries: CampaignEntry[];
  stores: Store[];
}

export function CampaignEntryList({ campaign, entries, stores }: CampaignEntryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const deleteEntryMutation = useDeleteCampaignEntry();

  const storeMap = new Map(stores.map(s => [s.id, s]));

  const filteredEntries = entries.filter((entry) => {
    const searchLower = searchQuery.toLowerCase();
    const storeName = storeMap.get(entry.storeId)?.name || '';
    return (
      Object.values(entry.data).some(v => String(v).toLowerCase().includes(searchLower)) ||
      storeName.toLowerCase().includes(searchLower)
    );
  });

  const displayFields = campaign.formFields.map(f => ({
    key: f.name,
    label: f.label,
    type: f.type,
  }));

  const exportToCSV = () => {
    if (entries.length === 0) {
      toast.error('Inga deltagare att exportera');
      return;
    }

    const headers = ['Butik', ...displayFields.map(f => f.label), 'Belopp (kr)', 'Kvittobild', 'Datum'];

    const rows = entries.map(entry => {
      const storeName = storeMap.get(entry.storeId)?.name || '-';
      const values = [
        storeName,
        ...displayFields.map(f => {
          const value = entry.data[f.key];
          if (f.type === 'checkbox') return value ? 'Ja' : 'Nej';
          return String(value || '');
        }),
        entry.receiptAmount != null ? String(entry.receiptAmount) : '-',
        entry.receiptImageUrl || '-',
        new Date(entry.registeredAt).toLocaleString('sv-SE'),
      ];
      return values;
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(v => `"${v}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${campaign.title.replace(/\s+/g, '_')}_deltagare.csv`;
    link.click();
    toast.success('Export slutförd!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna deltagare?')) {
      deleteEntryMutation.mutate(
        { id, campaignId: campaign.id },
        {
          onSuccess: () => toast.success('Deltagare borttagen'),
          onError: () => toast.error('Kunde inte ta bort deltagare'),
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <div className="bg-card rounded-lg border p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-semibold text-foreground">
                {entries.length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Deltagare</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-semibold text-foreground">
                {entries.filter(e => e.receiptAmount != null).length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Med belopp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sök deltagare..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="default" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4" />
          <span className="ml-1">CSV</span>
        </Button>
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'Inga deltagare matchar din sökning' : 'Inga deltagare ännu'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Butik</TableHead>
                {displayFields.map((field) => (
                  <TableHead key={field.key}>{field.label}</TableHead>
                ))}
                <TableHead>Belopp</TableHead>
                <TableHead>Kvitto</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell>
                    <Badge variant="secondary">
                      {storeMap.get(entry.storeId)?.name || '-'}
                    </Badge>
                  </TableCell>
                  {displayFields.map((field) => (
                    <TableCell key={field.key}>
                      {field.type === 'checkbox' ? (
                        <Badge variant={entry.data[field.key] ? 'success' : 'secondary'}>
                          {entry.data[field.key] ? 'Ja' : 'Nej'}
                        </Badge>
                      ) : (
                        String(entry.data[field.key] || '-')
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {entry.receiptAmount != null ? (
                      <span className="font-medium">{entry.receiptAmount} kr</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.receiptImageUrl ? (
                      <a
                        href={entry.receiptImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Visa
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(entry.registeredAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteEntryMutation.isPending}
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

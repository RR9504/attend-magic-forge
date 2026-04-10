import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from '@/hooks/useStores';
import { Store } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Store as StoreIcon, X, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function StoresPage() {
  const { data: stores = [], isLoading } = useStores();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const resetForm = () => {
    setName('');
    setAddress('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateStoreMutation.mutate(
        { id: editingId, updates: { name: name.trim(), address: address.trim() } },
        {
          onSuccess: () => {
            toast.success('Butik uppdaterad');
            resetForm();
          },
          onError: () => toast.error('Kunde inte uppdatera butik'),
        }
      );
    } else {
      createStoreMutation.mutate(
        { name: name.trim(), address: address.trim() || undefined },
        {
          onSuccess: () => {
            toast.success('Butik skapad');
            resetForm();
          },
          onError: () => toast.error('Kunde inte skapa butik'),
        }
      );
    }
  };

  const handleEdit = (store: Store) => {
    setEditingId(store.id);
    setName(store.name);
    setAddress(store.address || '');
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna butik?')) {
      deleteStoreMutation.mutate(id, {
        onSuccess: () => toast.success('Butik borttagen'),
        onError: () => toast.error('Kunde inte ta bort butik. Den kanske används i en kampanj.'),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Butiker</h1>
            <p className="text-muted-foreground text-sm mt-1">Hantera butiker som kan kopplas till kampanjer</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            Ny butik
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Redigera butik' : 'Lägg till butik'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Namn *</Label>
                    <Input
                      id="store-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Butikens namn"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Adress</Label>
                    <Input
                      id="store-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Gatuadress, Sölvesborg"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                    {editingId ? 'Uppdatera' : 'Lägg till'}
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

        {/* Stores List */}
        {isLoading ? (
          <div className="text-center py-16 bg-card rounded-xl border">
            <p className="text-muted-foreground">Laddar butiker...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border animate-fade-in">
            <StoreIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Inga butiker ännu
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Lägg till butiker som ska kunna kopplas till kampanjer
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Adress</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store, index) => (
                  <TableRow
                    key={store.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {store.address || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(store)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(store.id)}
                          disabled={deleteStoreMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

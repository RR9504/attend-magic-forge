import { useStores } from '@/hooks/useStores';
import { Checkbox } from '@/components/ui/checkbox';
import { Store as StoreIcon } from 'lucide-react';

interface StoreSelectorProps {
  selectedStoreIds: string[];
  onChange: (storeIds: string[]) => void;
}

export function StoreSelector({ selectedStoreIds, onChange }: StoreSelectorProps) {
  const { data: stores = [], isLoading } = useStores();

  const toggleStore = (storeId: string) => {
    if (selectedStoreIds.includes(storeId)) {
      onChange(selectedStoreIds.filter(id => id !== storeId));
    } else {
      onChange([...selectedStoreIds, storeId]);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Laddar butiker...</p>;
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-6 bg-secondary/50 rounded-lg">
        <StoreIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Inga butiker finns. Skapa butiker först under "Butiker" i menyn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stores.map((store) => (
        <div
          key={store.id}
          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer"
          onClick={() => toggleStore(store.id)}
        >
          <Checkbox
            checked={selectedStoreIds.includes(store.id)}
            onCheckedChange={() => {}}
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium">{store.name}</span>
            {store.address && (
              <p className="text-xs text-muted-foreground">{store.address}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

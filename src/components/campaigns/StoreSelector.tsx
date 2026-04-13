import { useStores } from '@/hooks/useStores';
import { Store as StoreIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      {stores.map((store) => {
        const isSelected = selectedStoreIds.includes(store.id);
        return (
          <button
            key={store.id}
            type="button"
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border w-full text-left transition-colors",
              isSelected
                ? "border-primary bg-primary/5"
                : "hover:bg-secondary/50"
            )}
            onClick={() => toggleStore(store.id)}
          >
            <div
              className={cn(
                "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-input"
              )}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium">{store.name}</span>
              {store.address && (
                <p className="text-xs text-muted-foreground">{store.address}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

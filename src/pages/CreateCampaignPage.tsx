import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useSetCampaignStores } from '@/hooks/useCampaignStores';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Campaign } from '@/types/campaign';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const createCampaignMutation = useCreateCampaign();
  const setCampaignStoresMutation = useSetCampaignStores();

  const handleSubmit = (data: Omit<Campaign, 'id' | 'createdAt'>, storeIds: string[]) => {
    createCampaignMutation.mutate(data, {
      onSuccess: async (newCampaign) => {
        if (storeIds.length > 0) {
          setCampaignStoresMutation.mutate(
            { campaignId: newCampaign.id, storeIds },
            {
              onSuccess: () => {
                toast.success('Kampanj skapad!');
                navigate(`/dashboard/campaigns/${newCampaign.id}`);
              },
              onError: () => {
                toast.success('Kampanj skapad, men butikerna kunde inte kopplas');
                navigate(`/dashboard/campaigns/${newCampaign.id}`);
              },
            }
          );
        } else {
          toast.success('Kampanj skapad!');
          navigate(`/dashboard/campaigns/${newCampaign.id}`);
        }
      },
      onError: () => {
        toast.error('Kunde inte skapa kampanj');
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 md:gap-4 animate-fade-in">
          <Link to="/dashboard/campaigns">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-xl md:text-3xl font-bold text-foreground">Ny kampanj</h1>
            <p className="text-muted-foreground text-xs md:text-base mt-0.5">Fyll i informationen nedan</p>
          </div>
        </div>

        <div className="animate-fade-in stagger-1">
          <CampaignForm
            onSubmit={handleSubmit}
            isLoading={createCampaignMutation.isPending || setCampaignStoresMutation.isPending}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

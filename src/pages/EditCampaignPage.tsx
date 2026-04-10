import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { CampaignEntryList } from '@/components/campaigns/CampaignEntryList';
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { useCampaignEntries } from '@/hooks/useCampaignEntries';
import { useCampaignStores, useSetCampaignStores } from '@/hooks/useCampaignStores';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Campaign } from '@/types/campaign';
import { useEffect } from 'react';

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, error } = useCampaign(id || '');
  const { data: entries = [] } = useCampaignEntries(id || '');
  const { data: campaignStores = [] } = useCampaignStores(id || '');
  const updateCampaignMutation = useUpdateCampaign();
  const setCampaignStoresMutation = useSetCampaignStores();

  useEffect(() => {
    if (error) {
      navigate('/dashboard/campaigns');
      toast.error('Kampanj hittades inte');
    }
  }, [error, navigate]);

  const handleSubmit = (data: Omit<Campaign, 'id' | 'createdAt'>, storeIds: string[]) => {
    if (!id) return;

    updateCampaignMutation.mutate(
      { id, updates: data },
      {
        onSuccess: () => {
          setCampaignStoresMutation.mutate(
            { campaignId: id, storeIds },
            {
              onSuccess: () => toast.success('Kampanj uppdaterad!'),
              onError: () => toast.success('Kampanj uppdaterad, men butikerna kunde inte uppdateras'),
            }
          );
        },
        onError: () => toast.error('Kunde inte uppdatera kampanj'),
      }
    );
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/campaign/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Länk kopierad till urklipp!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) return null;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-fade-in">
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/dashboard/campaigns">
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-lg md:text-2xl font-bold text-foreground line-clamp-1">
                {campaign.title}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
                {entries.length} deltagare
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPublicLink} className="flex-1 md:flex-none">
              <Copy className="w-4 h-4" />
              <span className="ml-1">Kopiera länk</span>
            </Button>
            <Link to={`/campaign/${id}`} target="_blank" className="flex-1 md:flex-none">
              <Button variant="secondary" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4" />
                <span className="ml-1">Öppna</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="entries" className="animate-fade-in stagger-1">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="entries">
              Deltagare ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Inställningar</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-6">
            <CampaignEntryList
              campaign={campaign}
              entries={entries}
              stores={campaignStores}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <CampaignForm
              initialData={campaign}
              initialStoreIds={campaignStores.map(s => s.id)}
              onSubmit={handleSubmit}
              isLoading={updateCampaignMutation.isPending || setCampaignStoresMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

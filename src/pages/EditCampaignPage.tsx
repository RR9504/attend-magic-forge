import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { CampaignEntryList } from '@/components/campaigns/CampaignEntryList';
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { useCampaignEntries } from '@/hooks/useCampaignEntries';
import { useCampaignStores, useSetCampaignStores } from '@/hooks/useCampaignStores';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Campaign } from '@/types/campaign';
import { useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="entries">
              Deltagare ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="qr">QR-kod</TabsTrigger>
            <TabsTrigger value="settings">Inställningar</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-6">
            <CampaignEntryList
              campaign={campaign}
              entries={entries}
              stores={campaignStores}
            />
          </TabsContent>

          <TabsContent value="qr" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR-kod för kampanjen
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Skriv ut denna QR-kod och placera den i butikerna. Kunder skannar koden för att delta.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border" id="qr-code-container">
                  <QRCode
                    value={`${window.location.origin}/campaign/${id}`}
                    size={256}
                    level="H"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                  {`${window.location.origin}/campaign/${id}`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const svg = document.querySelector('#qr-code-container svg');
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      canvas.width = 512;
                      canvas.height = 512;
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      img.onload = () => {
                        ctx!.fillStyle = 'white';
                        ctx!.fillRect(0, 0, 512, 512);
                        ctx!.drawImage(img, 0, 0, 512, 512);
                        const link = document.createElement('a');
                        link.download = `${campaign.title.replace(/\s+/g, '_')}_qr.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                      };
                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                    }}
                  >
                    Ladda ner PNG
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;
                      const svg = document.querySelector('#qr-code-container svg');
                      if (!svg) return;
                      const svgHtml = svg.outerHTML;
                      printWindow.document.write(`
                        <html>
                          <head><title>QR - ${campaign.title}</title></head>
                          <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;">
                            <h2 style="margin-bottom:8px">${campaign.title}</h2>
                            <p style="margin-bottom:24px;color:#666">Skanna QR-koden för att delta i utlottningen</p>
                            <div style="padding:24px;border:1px solid #eee;border-radius:12px;">${svgHtml}</div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                  >
                    Skriv ut
                  </Button>
                </div>
              </CardContent>
            </Card>
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

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCampaigns, useDeleteCampaign } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Ticket, Trash2, Calendar, ExternalLink, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const deleteCampaignMutation = useDeleteCampaign();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleDelete = (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna kampanj?')) {
      deleteCampaignMutation.mutate(id, {
        onSuccess: () => toast.success('Kampanj borttagen'),
        onError: () => toast.error('Kunde inte ta bort kampanj'),
      });
    }
  };

  const copyPublicLink = (id: string) => {
    const link = `${window.location.origin}/campaign/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Länk kopierad till urklipp!');
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusLabel = (s: string) =>
    s === 'draft' ? 'Utkast' : s === 'published' ? 'Publicerad' : 'Stängd';
  const statusVariant = (s: string) =>
    s === 'published' ? 'success' : s === 'closed' ? 'secondary' : 'outline';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Kampanjer</h1>
            <p className="text-muted-foreground text-sm mt-1">Hantera lotterikampanjer</p>
          </div>
          <Link to="/dashboard/campaigns/new">
            <Button variant="default" size="lg">
              <Plus className="w-5 h-5" />
              Ny kampanj
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 md:gap-4 animate-fade-in stagger-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök kampanjer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'published', 'draft', 'closed'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="flex-shrink-0"
              >
                {s === 'all' ? 'Alla' : statusLabel(s)}
              </Button>
            ))}
          </div>
        </div>

        {/* Campaign List */}
        {isLoading ? (
          <div className="text-center py-16 bg-card rounded-xl border">
            <p className="text-muted-foreground">Laddar kampanjer...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border animate-fade-in">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Inga kampanjer matchar din sökning'
                : 'Inga kampanjer ännu'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {!searchQuery && statusFilter === 'all' && 'Skapa din första kampanj för att komma igång'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/dashboard/campaigns/new">
                <Button variant="default">
                  <Plus className="w-4 h-4" />
                  Skapa kampanj
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <Card
                key={campaign.id}
                className="animate-fade-in hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4 md:p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-foreground truncate">
                        {campaign.title}
                      </h3>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={statusVariant(campaign.status) as any}>
                      {statusLabel(campaign.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {campaign.minAmount && campaign.minAmount > 0 && (
                      <span>Min: {campaign.minAmount} kr</span>
                    )}
                    {campaign.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {campaign.startDate}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Link to={`/dashboard/campaigns/${campaign.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Hantera
                      </Button>
                    </Link>
                    {campaign.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyPublicLink(campaign.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

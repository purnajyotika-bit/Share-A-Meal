import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from './base44Client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Button } from './button';
import { Badge } from './badge';
import { AlertTriangle, Plus, Filter, TrendingUp, Star, LayoutGrid } from 'lucide-react';
import CampaignCard from './CampaignCard';
import DonateModal from './DonateModal';
import CreateCampaignModal from './CreateCampaignModal';
import DonorLeaderboard from './DonorLeaderboard';
import AdminCampaignPanel from './AdminCampaignPanel';

const FILTERS = ['all', 'emergency', 'featured', 'food_rescue', 'ngo_operations', 'transport', 'emergency_relief', 'community_kitchen'];

export default function Fundraising() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date', 50),
  });

  const approved = campaigns.filter(c => c.status === 'approved');

  const filtered = approved.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'emergency') return c.is_emergency;
    if (filter === 'featured') return c.is_featured;
    return c.category === filter;
  });

  const emergencyCampaigns = approved.filter(c => c.is_emergency);
  const featuredCampaigns = approved.filter(c => c.is_featured);

  const handleShare = (campaign) => {
    const url = window.location.href;
    const text = `Support "${campaign.title}" on FoodBridge! Goal: ₹${campaign.goal_amount.toLocaleString()} — ${url}`;
    if (navigator.share) {
      navigator.share({ title: campaign.title, text, url });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
    base44.entities.Campaign.update(campaign.id, { share_count: (campaign.share_count || 0) + 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('fundraising')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('fundraising_subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Button variant="outline" onClick={() => setShowAdmin(true)}>{t('admin_panel')}</Button>
          )}
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />{t('create_campaign')}
          </Button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      {emergencyCampaigns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm">🚨 {t('emergency_fundraising_alerts')}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {emergencyCampaigns.map(c => (
              <div key={c.id} className="flex-shrink-0 bg-white border border-red-200 rounded-xl p-3 w-64">
                <p className="font-semibold text-sm text-foreground line-clamp-1">{c.title}</p>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600">
                    ₹{(c.raised_amount || 0).toLocaleString()} / ₹{c.goal_amount.toLocaleString()}
                  </span>
                  <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => setSelectedCampaign(c)}>
                    {t('donate_now')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Featured */}
          {featuredCampaigns.length > 0 && filter === 'all' && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold text-foreground">{t('featured')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {featuredCampaigns.slice(0, 2).map(c => (
                  <CampaignCard key={c.id} campaign={c} onDonate={setSelectedCampaign} onShare={handleShare} />
                ))}
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {['all', 'emergency', 'featured'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                {f === 'all' ? t('all_campaigns') : f === 'emergency' ? t('emergency') : t('featured')}
              </button>
            ))}
          </div>

          {/* All campaigns */}
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">{t('all_campaigns')}</h2>
            <Badge variant="secondary">{filtered.length}</Badge>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-72 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-2xl">
              <p className="text-4xl mb-3">🫙</p>
              <p className="font-semibold text-foreground">{t('no_campaigns_found')}</p>
              <p className="text-muted-foreground text-sm">{t('create_campaign_prompt')}</p>
              <Button onClick={() => setShowCreate(true)} className="mt-4 bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="w-4 h-4" /> {t('create_campaign')}
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map(c => (
                <CampaignCard key={c.id} campaign={c} onDonate={setSelectedCampaign} onShare={handleShare} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <DonorLeaderboard />

          {/* Impact summary */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-3">📊 {t('fundraising_impact')}</h3>
            <div className="space-y-3">
              {[
                { label: t('total_raised'), value: `₹${approved.reduce((s, c) => s + (c.raised_amount || 0), 0).toLocaleString()}` },
                { label: t('campaigns_active'), value: approved.length },
                { label: t('total_donors'), value: approved.reduce((s, c) => s + (c.donor_count || 0), 0) },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fund usage transparency */}
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-3">🔍 {t('fund_usage')}</h3>
            <div className="space-y-2">
              {[
                { label: t('food_rescue_ops'), pct: 40, color: 'bg-primary' },
                { label: t('transportation'), pct: 25, color: 'bg-blue-500' },
                { label: t('ngo_support'), pct: 20, color: 'bg-green-500' },
                { label: t('community_kitchens'), pct: 15, color: 'bg-purple-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{item.label}</span><span>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCampaign && (
        <DonateModal
          open={!!selectedCampaign}
          onOpenChange={(o) => !o && setSelectedCampaign(null)}
          campaign={selectedCampaign}
          userEmail={user?.email}
          userName={user?.full_name}
        />
      )}
      <CreateCampaignModal open={showCreate} onOpenChange={setShowCreate} userEmail={user?.email} userName={user?.full_name} />
      {showAdmin && <AdminCampaignPanel open={showAdmin} onOpenChange={setShowAdmin} />}
    </div>
  );
}

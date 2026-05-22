import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Share2, AlertTriangle, Star } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';

const categoryColors = {
  food_rescue: 'bg-orange-100 text-orange-700',
  ngo_operations: 'bg-blue-100 text-blue-700',
  transport: 'bg-purple-100 text-purple-700',
  emergency_relief: 'bg-red-100 text-red-700',
  community_kitchen: 'bg-green-100 text-green-700',
};
const categoryLabels = {
  food_rescue: 'Food Rescue',
  ngo_operations: 'NGO Operations',
  transport: 'Transportation',
  emergency_relief: 'Emergency Relief',
  community_kitchen: 'Community Kitchen',
};

export default function CampaignCard({ campaign, onDonate, onShare }) {
  const { t } = useLanguage();
  const pct = Math.min(100, Math.round(((campaign.raised_amount || 0) / campaign.goal_amount) * 100));
  const daysLeft = campaign.deadline
    ? differenceInDays(parseISO(campaign.deadline), new Date())
    : null;

  return (
    <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      {campaign.image_url ? (
        <div className="relative">
          <img src={campaign.image_url} alt={campaign.title} className="w-full h-44 object-cover" />
          <div className="absolute top-3 left-3 flex gap-2">
            {campaign.is_emergency && (
              <Badge className="bg-red-600 text-white gap-1"><AlertTriangle className="w-3 h-3" />{t('emergency')}</Badge>
            )}
            {campaign.is_featured && (
              <Badge className="bg-amber-500 text-white gap-1"><Star className="w-3 h-3" />{t('featured')}</Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
          <span className="text-5xl">🍱</span>
          <div className="absolute top-3 left-3 flex gap-2">
            {campaign.is_emergency && (
              <Badge className="bg-red-600 text-white gap-1"><AlertTriangle className="w-3 h-3" />{t('emergency')}</Badge>
            )}
            {campaign.is_featured && (
              <Badge className="bg-amber-500 text-white gap-1"><Star className="w-3 h-3" />{t('featured')}</Badge>
            )}
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[campaign.category] || 'bg-muted text-muted-foreground'}`}>
            {categoryLabels[campaign.category] || campaign.category}
          </span>
        </div>

        <h3 className="font-semibold text-foreground text-base mb-1 line-clamp-2">{campaign.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">{campaign.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('raised')}: <strong className="text-foreground">₹{(campaign.raised_amount || 0).toLocaleString()}</strong></span>
            <span>{t('goal')}: <strong className="text-foreground">₹{campaign.goal_amount.toLocaleString()}</strong></span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{pct}% {t('progress')}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{campaign.donor_count || 0}</span>
              {daysLeft !== null && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {daysLeft > 0 ? `${daysLeft} ${t('days_left')}` : 'Ended'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white h-9 text-sm"
            onClick={() => onDonate(campaign)}
            disabled={campaign.status !== 'approved'}
          >
            {t('donate')}
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onShare(campaign)}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

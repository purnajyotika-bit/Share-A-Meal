import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from './base44Client';
import { useLanguage } from './LanguageContext';
import { Trophy } from 'lucide-react';

function getBadge(rank, total) {
  if (rank === 0) return { icon: '🥇', labelKey: 'badge_gold_champion', color: 'text-yellow-600' };
  if (rank === 1) return { icon: '🥈', labelKey: 'badge_silver_hero', color: 'text-slate-500' };
  if (rank === 2) return { icon: '🥉', labelKey: 'badge_bronze_star', color: 'text-amber-700' };
  if (total > 5000) return { icon: '💎', labelKey: 'badge_diamond_donor', color: 'text-blue-600' };
  if (total > 1000) return { icon: '⭐', labelKey: 'badge_star_donor', color: 'text-primary' };
  return { icon: '🤝', labelKey: 'badge_supporter', color: 'text-muted-foreground' };
}

export default function DonorLeaderboard() {
  const { t } = useLanguage();
  const { data: donations = [] } = useQuery({
    queryKey: ['campaign-donations-leaderboard'],
    queryFn: () => base44.entities.CampaignDonation.list('-created_date', 200),
  });

  // Aggregate by donor
  const byDonor = {};
  donations.forEach(d => {
    if (d.anonymous) return;
    const key = d.donor_email;
    if (!byDonor[key]) byDonor[key] = { name: d.donor_name, total: 0, count: 0 };
    byDonor[key].total += d.amount;
    byDonor[key].count += 1;
  });

  const sorted = Object.values(byDonor).sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-foreground">{t('donor_leaderboard_title')}</h3>
      </div>
      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">{t('donor_leaderboard_empty')}</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((donor, i) => {
            const badge = getBadge(i, donor.total);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{donor.name}</p>
                  <p className={`text-xs ${badge.color}`}>
                    {t(badge.labelKey)} · {donor.count} {donor.count !== 1 ? t('donations') : t('donation')}
                  </p>
                </div>
                <span className="font-bold text-sm text-foreground">₹{donor.total.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

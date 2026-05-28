import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from './base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent } from './card';
import { ArrowLeft, Clock, MapPin, Package, QrCode, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChatPanel from './ChatPanel';
import { useLanguage } from './LanguageContext';

const statusConfig = {
  available: { key: 'status_available', cls: 'bg-accent/10 text-accent border-accent/20' },
  claimed:   { key: 'status_claimed',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  picked_up: { key: 'status_picked_up', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivered: { key: 'status_delivered', cls: 'bg-primary/10 text-primary border-primary/20' },
  expired:   { key: 'status_expired',   cls: 'bg-muted text-muted-foreground border-border' },
};

const categoryKeys = {
  cooked_meals: 'category_cooked_meals',
  raw_ingredients: 'category_raw_ingredients',
  packaged_food: 'category_packaged_food',
  baked_goods: 'category_baked_goods',
  beverages: 'category_beverages',
  other: 'category_other',
};

export default function DonationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: donation, isLoading } = useQuery({
    queryKey: ['donation', id],
    queryFn: async () => {
      const all = await base44.entities.Donation.list();
      return all.find(d => d.id === id) || null;
    },
    enabled: !!id,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Donation.update(donation.id, {
        status: 'claimed', claimed_by: user.email, claimed_by_name: user.full_name,
      });
      await base44.entities.Notification.create({
        user_email: donation.donor_email, title: 'Donation claimed!',
        message: `${user.full_name} claimed your "${donation.title}"`,
        type: 'donation_claimed', donation_id: donation.id,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donation', id] }),
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: async () => {
      const qr = Math.random().toString(36).substring(2, 10).toUpperCase();
      await base44.entities.Donation.update(donation.id, {
        volunteer_email: user.email, volunteer_name: user.full_name, qr_code: qr,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donation', id] }),
  });

  const pickUpMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Donation.update(donation.id, { status: 'picked_up' });
      if (donation.claimed_by) {
        await base44.entities.Notification.create({
          user_email: donation.claimed_by, title: 'Food picked up!',
          message: `"${donation.title}" is on its way to you`,
          type: 'donation_picked_up', donation_id: donation.id,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donation', id] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!donation) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <h2 className="font-semibold text-foreground">{t('donation_not_found')}</h2>
      <Link to="/dashboard"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="w-4 h-4" />{t('back')}</Button></Link>
    </div>
  );

  const s = statusConfig[donation.status] || statusConfig.available;
  const isVolunteer = user?.email === donation.volunteer_email;
  const isReceiver = user?.email === donation.claimed_by;
  const isDonor = user?.email === donation.donor_email;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Details + Actions */}
          <div className="lg:col-span-2 space-y-4">
            {donation.image_url && (
              <div className="rounded-2xl overflow-hidden h-48">
                <img src={donation.image_url} alt={donation.title} className="w-full h-full object-cover" />
              </div>
            )}

            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-tight">{donation.title}</h1>
                  <Badge variant="outline" className={`${statusConfig[donation.status]?.cls || statusConfig.available.cls} text-[10px] shrink-0`}>{t(statusConfig[donation.status]?.key || 'status_available')}</Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Package className="w-4 h-4 shrink-0" /> {donation.quantity}{donation.category ? ` · ${t(categoryKeys[donation.category] || 'category_other')}` : ''}</div>
                  {donation.freshness_hours && <div className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {t('freshness_hours')}: {donation.freshness_hours}</div>}
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" />{donation.pickup_address}</div>
                </div>

                {donation.description && <p className="text-sm text-foreground border-t pt-3">{donation.description}</p>}

                <div className="border-t pt-3 grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                  <div><span className="font-semibold">{t('donor')}:</span> {donation.donor_name || '—'}</div>
                  {donation.claimed_by_name && <div><span className="font-semibold">{t('receiver')}:</span> {donation.claimed_by_name}</div>}
                  {donation.volunteer_name && <div><span className="font-semibold">{t('volunteer')}:</span> {donation.volunteer_name}</div>}
                  <div className="mt-1">{formatDistanceToNow(new Date(donation.created_date), { addSuffix: true })}</div>
                </div>
              </CardContent>
            </Card>

          {/* Actions */}
          <div className="space-y-2">
            {!isDonor && donation.status === 'available' && !isReceiver && (
              <Button onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-white">
                {claimMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('claim_donation')}
              </Button>
            )}
            {donation.status === 'claimed' && !donation.volunteer_email && !isDonor && !isReceiver && (
              <Button onClick={() => acceptDeliveryMutation.mutate()} disabled={acceptDeliveryMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {acceptDeliveryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Truck className="w-4 h-4" /> {t('accept_delivery')}</>}
              </Button>
            )}
            {isVolunteer && donation.status === 'claimed' && (
              <Button onClick={() => pickUpMutation.mutate()} disabled={pickUpMutation.isPending} variant="outline" className="w-full gap-2">
                {pickUpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> {t('mark_picked_up')}</>}
              </Button>
            )}
            {donation.status === 'picked_up' && donation.qr_code && (isVolunteer || isReceiver) && (
              <Link to={`/delivery/${donation.id}`} className="block">
                <Button variant="outline" className="w-full gap-2">
                  <QrCode className="w-4 h-4" /> {t('go_to_delivery_verification')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-3">
          <div className="bg-card border rounded-2xl overflow-hidden flex flex-col h-[560px] shadow-sm">
            <ChatPanel donation={donation} />
          </div>
        </div>
      </div>
    </div>
  );
}

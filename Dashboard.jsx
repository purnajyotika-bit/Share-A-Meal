import React, { useState } from 'react';
import { base44 } from './base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Button } from './button';
import { Plus, Package, MapPin, Utensils, Users, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DonationCard from './DonationCard';
import DonationFormDialog from './DonationFormDialog';

const ROLES = [
  { key: 'donor',     keyLabel: 'donor',                    icon: Utensils, keyDesc: 'i_have_food_to_give',         color: 'bg-primary text-white' },
  { key: 'receiver',  keyLabel: 'receiver',                 icon: Users,    keyDesc: 'i_need_food_for_community', color: 'bg-blue-600 text-white' },
  { key: 'volunteer', keyLabel: 'volunteer',               icon: Truck,    keyDesc: 'i_can_pick_up_deliver',     color: 'bg-emerald-600 text-white' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Read role from URL query param first, fall back to user.role
  const urlParams = new URLSearchParams(window.location.search);
  const urlRole = urlParams.get('role');
  const [role, setRole] = useState(urlRole || user?.role || 'donor');

  const { data: myDonations = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-donations', role, user?.email],
    queryFn: async () => {
      if (role === 'donor') return base44.entities.Donation.filter({ donor_email: user.email }, '-created_date');
      if (role === 'volunteer') return base44.entities.Donation.filter({ volunteer_email: user.email }, '-created_date');
      return [];
    },
    enabled: !!user?.email,
  });

  const { data: availableDonations = [], isLoading: loadingAvail } = useQuery({
    queryKey: ['available-donations', role],
    queryFn: () => base44.entities.Donation.filter({ status: 'available' }, '-created_date'),
    enabled: role === 'receiver' || role === 'volunteer',
  });

  const { data: claimedDonations = [] } = useQuery({
    queryKey: ['claimed-donations', role],
    queryFn: () => base44.entities.Donation.filter({ status: 'claimed' }, '-created_date'),
    enabled: role === 'volunteer',
  });

  const claimMutation = useMutation({
    mutationFn: async (donation) => {
      await base44.entities.Donation.update(donation.id, {
        status: 'claimed', claimed_by: user.email, claimed_by_name: user.full_name,
      });
      await base44.entities.Notification.create({
        user_email: donation.donor_email, title: 'Donation claimed!',
        message: `${user.full_name} claimed your "${donation.title}"`,
        type: 'donation_claimed', donation_id: donation.id,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: async (donation) => {
      const qr = Math.random().toString(36).substring(2, 10).toUpperCase();
      await base44.entities.Donation.update(donation.id, {
        volunteer_email: user.email, volunteer_name: user.full_name, qr_code: qr,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const pickUpMutation = useMutation({
    mutationFn: async (donation) => {
      await base44.entities.Donation.update(donation.id, { status: 'picked_up' });
      await base44.entities.Notification.create({
        user_email: donation.claimed_by, title: 'Food picked up!',
        message: `"${donation.title}" is on its way to you`,
        type: 'donation_picked_up', donation_id: donation.id,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const isLoading = loadingMine || loadingAvail;

  let displayDonations = [];
  if (role === 'donor') displayDonations = myDonations;
  else if (role === 'receiver') displayDonations = availableDonations;
  else {
    const unassigned = claimedDonations.filter(d => !d.volunteer_email);
    const mine = myDonations;
    const seen = new Set(mine.map(d => d.id));
    displayDonations = [...mine, ...unassigned.filter(d => !seen.has(d.id))];
  }

  const activeRole = ROLES.find(r => r.key === role);
  const Icon = activeRole?.icon || Package;

  const roleHeadings = {
    donor:     { titleKey: 'my_donations',    subKey: 'i_am_a_donor' },
    receiver:  { titleKey: 'available_food',  subKey: 'i_am_a_receiver' },
    volunteer: { titleKey: 'deliveries',      subKey: 'i_am_a_volunteer' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Role switcher banner */}
      <div className="mb-8 bg-card border rounded-2xl p-6">
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3">{t('i_am_a')}</p>
        <div className="flex flex-wrap gap-3">
          {ROLES.map(r => {
            const RIcon = r.icon;
            const isActive = role === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all font-medium text-sm
                  ${isActive
                    ? `${r.color} border-transparent shadow-md scale-[1.03]`
                    : 'bg-background text-foreground border-border hover:border-primary/40 hover:bg-muted'}`}
              >
                <RIcon className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <span className="block font-semibold">{t(r.keyLabel)}</span>
                  <span className={`block text-[11px] ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>{t(r.keyDesc)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeRole?.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t(roleHeadings[role]?.titleKey || 'dashboard')}</h1>
            <p className="text-muted-foreground text-sm">{t(roleHeadings[role]?.subKey || 'dashboard')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {role === 'donor' && (
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> {t('donate_food')}
            </Button>
          )}
          <Link to="/nearby">
            <Button variant="outline" className="gap-2"><MapPin className="w-4 h-4" /> {t('map_view')}</Button>
          </Link>
        </div>
      </div>

      {/* Donor tip */}
      {role === 'donor' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 mb-6 text-sm text-primary">
          <strong>{t('dashboard_role_banner_donor_title')}</strong> {t('dashboard_role_banner_donor_body')}
        </div>
      )}
      {role === 'receiver' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 text-sm text-blue-700">
          <strong>{t('dashboard_role_banner_receiver_title')}</strong> {t('dashboard_role_banner_receiver_body')}
        </div>
      )}
      {role === 'volunteer' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6 text-sm text-emerald-700">
          <strong>{t('dashboard_role_banner_volunteer_title')}</strong> {t('dashboard_role_banner_volunteer_body')}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : displayDonations.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-2xl">
          <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">
            {role === 'donor' ? t('dashboard_no_donations_donor') : role === 'receiver' ? t('dashboard_no_donations_receiver') : t('dashboard_no_donations_volunteer')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {role === 'donor' ? t('dashboard_empty_donor') : role === 'receiver' ? t('dashboard_empty_receiver') : t('dashboard_empty_volunteer')}
          </p>
          {role === 'donor' && (
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" /> {t('dashboard_post_food_now')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayDonations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              role={role}
              userEmail={user?.email}
              onClaim={() => claimMutation.mutate(donation)}
              onAcceptDelivery={() => acceptDeliveryMutation.mutate(donation)}
              onPickUp={() => pickUpMutation.mutate(donation)}
            />
          ))}
        </div>
      )}

      <DonationFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        userEmail={user?.email}
        userName={user?.full_name}
      />
    </div>
  );
}

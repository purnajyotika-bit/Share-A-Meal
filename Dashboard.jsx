import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Package, MapPin, Utensils, Users, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DonationCard from '@/components/donations/DonationCard';
import DonationFormDialog from '@/components/donations/DonationFormDialog';

const ROLES = [
  { key: 'donor',     label: 'Donor',     icon: Utensils, desc: 'I have food to give',         color: 'bg-primary text-white' },
  { key: 'receiver',  label: 'NGO / Receiver', icon: Users,    desc: 'I need food for my community', color: 'bg-blue-600 text-white' },
  { key: 'volunteer', label: 'Volunteer',  icon: Truck,    desc: 'I can pick up & deliver',     color: 'bg-emerald-600 text-white' },
];

export default function Dashboard() {
  const { user } = useAuth();
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
    donor:     { title: 'My Donations',    sub: 'Post surplus food for others to claim' },
    receiver:  { title: 'Available Food',  sub: 'Browse and claim food donations near you' },
    volunteer: { title: 'Deliveries',      sub: 'Pick up claimed food and deliver it' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Role switcher banner */}
      <div className="mb-8 bg-card border rounded-2xl p-6">
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3">I am a…</p>
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
                  <span className="block font-semibold">{r.label}</span>
                  <span className={`block text-[11px] ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>{r.desc}</span>
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
            <h1 className="text-xl font-bold text-foreground">{roleHeadings[role]?.title}</h1>
            <p className="text-muted-foreground text-sm">{roleHeadings[role]?.sub}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {role === 'donor' && (
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Post Food
            </Button>
          )}
          <Link to="/nearby">
            <Button variant="outline" className="gap-2"><MapPin className="w-4 h-4" /> Map View</Button>
          </Link>
        </div>
      </div>

      {/* Donor tip */}
      {role === 'donor' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 mb-6 text-sm text-primary">
          <strong>You're a Donor.</strong> Post your surplus food — restaurants, hotels, households welcome. Someone nearby will claim and collect it.
        </div>
      )}
      {role === 'receiver' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 text-sm text-blue-700">
          <strong>You're an NGO / Receiver.</strong> Browse available food donations and claim what fits your community's need. A volunteer will coordinate the pickup.
        </div>
      )}
      {role === 'volunteer' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6 text-sm text-emerald-700">
          <strong>You're a Volunteer.</strong> Accept delivery tasks for claimed donations, pick them up from the donor and deliver to the receiver. Use QR codes to confirm handoff.
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
            {role === 'donor' ? 'No donations posted yet' : role === 'receiver' ? 'No available donations right now' : 'No active deliveries'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {role === 'donor' ? 'Click "Post Food" to share your surplus' : role === 'receiver' ? 'Check back soon — donors post new food regularly' : 'Claimed donations waiting for a volunteer will appear here'}
          </p>
          {role === 'donor' && (
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" /> Post Food Now
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

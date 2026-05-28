import React, { useState } from 'react';
import { base44 } from './base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { CheckCircle2, ShieldCheck, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeDisplay from './QRCode';

export default function DeliveryHandoff() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const donationId = window.location.pathname.split('/delivery/')[1];
  const [verifyCode, setVerifyCode] = useState('');
  const { t } = useLanguage();

  const { data: donation, isLoading } = useQuery({
    queryKey: ['donation-detail', donationId],
    queryFn: async () => {
      const all = await base44.entities.Donation.list();
      return all.find(d => d.id === donationId) || null;
    },
    enabled: !!donationId,
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (verifyCode.trim().toUpperCase() !== donation?.qr_code?.toUpperCase()) {
        throw new Error('Invalid verification code');
      }
      await base44.entities.Donation.update(donation.id, {
        status: 'delivered',
        verified_at: new Date().toISOString(),
      });
      // Notify all parties
      const toNotify = [
        donation.donor_email && { email: donation.donor_email, title: 'Delivery verified! ✅', msg: `"${donation.title}" was delivered and verified` },
        donation.claimed_by && { email: donation.claimed_by, title: 'Food received! ✅', msg: `"${donation.title}" delivery confirmed` },
        donation.volunteer_email && { email: donation.volunteer_email, title: 'Delivery complete! 🎉', msg: `You delivered "${donation.title}" successfully` },
      ].filter(Boolean);
      await Promise.all(toNotify.map(n => base44.entities.Notification.create({
        user_email: n.email, title: n.title, message: n.msg, type: 'qr_verified', donation_id: donation.id,
      })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-detail'] });
      toast.success('Delivery verified!');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  if (!donation) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-semibold">{t('donation_not_found')}</h2>
    </div>
  );

  const isVolunteer = user?.email === donation.volunteer_email;
  const isReceiver = user?.email === donation.claimed_by;
  const isDelivered = donation.status === 'delivered';

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('delivery_handoff_title')}</h1>

      {/* Donation summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{donation.title}</h2>
              <p className="text-sm text-muted-foreground">{donation.quantity} · {donation.pickup_address}</p>
            </div>
            <Badge variant="outline" className={isDelivered ? 'bg-accent/10 text-accent border-accent/20' : 'bg-amber-50 text-amber-700 border-amber-200'}>
              {isDelivered ? t('delivery_status_delivered') : t(`status_${donation.status}`) }
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
            {[
              { key: 'donor', value: donation.donor_name },
              { key: 'receiver', value: donation.claimed_by_name || '—' },
              { key: 'volunteer', value: donation.volunteer_name || '—' },
            ].map(f => (
              <div key={f.key}>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{t(`role_${f.key}`)}</span>
                <p className="font-medium text-sm mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isDelivered ? (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold">{t('delivery_verified_title')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {donation.verified_at ? `${t('delivery_verified_at')} ${new Date(donation.verified_at).toLocaleString()}` : t('delivery_verified_note')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Volunteer: show QR code */}
          {isVolunteer && donation.qr_code && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">{t('delivery_qr_code_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('delivery_qr_description')}</p>
                <QRCodeDisplay code={donation.qr_code} />
              </CardContent>
            </Card>
          )}

          {/* Receiver: enter/scan code */}
          {isReceiver && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4" />{t('verify_delivery_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('verify_delivery_instruction')}</p>
                <div className="flex gap-2">
                  <Input
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                    placeholder={t('verification_code_placeholder')}
                    className="font-mono tracking-widest uppercase"
                    maxLength={8}
                  />
                  <Button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyCode.length < 4 || verifyMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0"
                  >
                    {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {t('verify')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isVolunteer && !isReceiver && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('delivery_restricted_notice')}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { base44 } from './base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const PRESETS = [100, 500, 1000, 5000];

export default function DonateModal({ open, onOpenChange, campaign, userEmail, userName }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const amt = Number(amount);
      await base44.entities.CampaignDonation.create({
        campaign_id: campaign.id,
        donor_email: userEmail,
        donor_name: anonymous ? 'Anonymous' : userName,
        amount: amt,
        message,
        anonymous,
      });
      await base44.entities.Campaign.update(campaign.id, {
        raised_amount: (campaign.raised_amount || 0) + amt,
        donor_count: (campaign.donor_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDone(true);
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setAmount('');
    setMessage('');
    setDone(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{done ? t('donation_modal_thank_you') : `${t('donate')} — ${campaign?.title}`}</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-center text-muted-foreground">
              {t('donation_modal_success')} <strong>₹{amount}</strong>.
            </p>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90 text-white w-full">{t('donation_modal_close')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>{t('donation_modal_amount_label')}</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PRESETS.map(p => (
                  <button key={p} onClick={() => setAmount(String(p))}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${amount === String(p) ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'}`}>
                    ₹{p}
                  </button>
                ))}
              </div>
              <Input className="mt-2" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('donation_modal_custom_amount_placeholder')} min={1} />
            </div>
            <div>
              <Label>{t('donation_modal_message_label')}</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t('donation_modal_message_placeholder')} rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded" />
              {t('donation_modal_anonymous')}
            </label>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={!amount || Number(amount) < 1 || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('donation_modal_processing')}</> : `${t('donate')} ₹${amount || '0'}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

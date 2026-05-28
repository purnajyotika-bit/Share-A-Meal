import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { base44 } from './base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ImagePlus, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const CATEGORIES = [
  { value: 'food_rescue', label: 'category_food_rescue' },
  { value: 'ngo_operations', label: 'category_ngo_operations' },
  { value: 'transport', label: 'category_transportation' },
  { value: 'emergency_relief', label: 'category_emergency_relief' },
  { value: 'community_kitchen', label: 'category_community_kitchen' },
];

export default function CreateCampaignModal({ open, onOpenChange, userEmail, userName }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', goal_amount: '', deadline: '', category: 'food_rescue', is_emergency: false });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const mutation = useMutation({
    mutationFn: async () => {
      let image_url;
      if (imageFile) {
        setUploadingImage(true);
        const res = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = res.file_url;
        setUploadingImage(false);
      }
      return base44.entities.Campaign.create({
        ...form,
        goal_amount: Number(form.goal_amount),
        creator_email: userEmail,
        creator_name: userName,
        status: 'pending',
        raised_amount: 0,
        donor_count: 0,
        image_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setSubmitted(true);
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setForm({ title: '', description: '', goal_amount: '', deadline: '', category: 'food_rescue', is_emergency: false });
    setImageFile(null);
    setImagePreview(null);
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t('create_campaign')}</DialogTitle></DialogHeader>
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-center font-semibold">{t('campaign_submitted_review')}</p>
            <p className="text-center text-muted-foreground text-sm">{t('campaign_review_message')}</p>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90 text-white w-full">{t('done')}</Button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
            <div>
              <Label>{t('campaign_title')} *</Label>
              <Input value={form.title} onChange={e => u('title', e.target.value)} required placeholder={t('campaign_title_placeholder')} />
            </div>
            <div>
              <Label>{t('description')}</Label>
              <Textarea value={form.description} onChange={e => u('description', e.target.value)} required rows={3} placeholder={t('description_placeholder')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('goal_amount')}</Label>
                <Input type="number" value={form.goal_amount} onChange={e => u('goal_amount', e.target.value)} required min={100} />
              </div>
              <div>
                <Label>{t('deadline')}</Label>
                <Input type="date" value={form.deadline} onChange={e => u('deadline', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{t('category')}</Label>
              <Select value={form.category} onValueChange={v => u('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{t(c.label)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_emergency} onChange={e => u('is_emergency', e.target.checked)} className="rounded" />
              {t('mark_as_emergency_campaign')}
            </label>
            <div>
              <Label>{t('campaign_image')}</Label>
              {imagePreview ? (
                <div className="relative mt-1 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt={t('preview_image_alt')} className="w-full h-36 object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{t('click_to_upload')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                  }} />
                </label>
              )}
            </div>
            <Button type="submit" disabled={mutation.isPending || uploadingImage} className="w-full bg-primary hover:bg-primary/90 text-white">
              {(mutation.isPending || uploadingImage) ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadingImage ? t('uploading') : t('submitting')}</> : t('submit_campaign_review')}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

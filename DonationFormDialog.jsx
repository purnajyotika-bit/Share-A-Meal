import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { base44 } from './base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const categories = [
  { value: 'cooked_meals', key: 'category_cooked_meals' },
  { value: 'raw_ingredients', key: 'category_raw_ingredients' },
  { value: 'packaged_food', key: 'category_packaged_food' },
  { value: 'baked_goods', key: 'category_baked_goods' },
  { value: 'beverages', key: 'category_beverages' },
  { value: 'other', key: 'category_other' },
];

export default function DonationFormDialog({ open, onOpenChange, userEmail, userName }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', quantity: '', category: 'cooked_meals',
    freshness_hours: '', pickup_address: '', pickup_lat: '', pickup_lng: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const u = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      let image_url = undefined;
      if (imageFile) {
        setUploadingImage(true);
        const result = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = result.file_url;
        setUploadingImage(false);
      }
      return base44.entities.Donation.create({ ...data, image_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-donations'] });
      onOpenChange(false);
      setForm({ title: '', description: '', quantity: '', category: 'cooked_meals', freshness_hours: '', pickup_address: '', pickup_lat: '', pickup_lng: '' });
      setImageFile(null);
      setImagePreview(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      freshness_hours: form.freshness_hours ? Number(form.freshness_hours) : undefined,
      pickup_lat: form.pickup_lat ? Number(form.pickup_lat) : undefined,
      pickup_lng: form.pickup_lng ? Number(form.pickup_lng) : undefined,
      donor_email: userEmail,
      donor_name: userName,
      status: 'available',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t('donation_title')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('donation_title')} *</Label>
            <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder={t('donation_title_placeholder')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('quantity')} *</Label>
              <Input value={form.quantity} onChange={e => u('quantity', e.target.value)} placeholder={t('quantity_placeholder')} required />
            </div>
            <div>
              <Label>{t('category')}</Label>
              <Select value={form.category} onValueChange={v => u('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{t(c.key)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t('freshness_hours')}</Label>
            <Input type="number" value={form.freshness_hours} onChange={e => u('freshness_hours', e.target.value)} placeholder={t('freshness_placeholder')} />
          </div>
          <div>
            <Label>{t('pickup_address')} *</Label>
            <Input value={form.pickup_address} onChange={e => u('pickup_address', e.target.value)} placeholder={t('pickup_address_placeholder')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('latitude')}</Label>
              <Input type="number" step="any" value={form.pickup_lat} onChange={e => u('pickup_lat', e.target.value)} placeholder={t('latitude_placeholder')} />
            </div>
            <div>
              <Label>{t('longitude')}</Label>
              <Input type="number" step="any" value={form.pickup_lng} onChange={e => u('pickup_lng', e.target.value)} placeholder={t('longitude_placeholder')} />
            </div>
          </div>
          <div>
            <Label>{t('donation_description')}</Label>
            <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder={t('description_placeholder')} rows={2} />
          </div>
          <div>
            <Label>{t('campaign_image')}</Label>
            {imagePreview ? (
              <div className="relative mt-1 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt={t('preview_image_alt')} className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <ImagePlus className="w-7 h-7 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">{t('click_to_upload')}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending || uploadingImage} className="w-full bg-primary hover:bg-primary/90 text-white">
            {(mutation.isPending || uploadingImage) ? <><Loader2 className="w-4 h-4 animate-spin" />{uploadingImage ? ` ${t('uploading')}` : ` ${t('submitting')}`}</> : t('donate_food')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

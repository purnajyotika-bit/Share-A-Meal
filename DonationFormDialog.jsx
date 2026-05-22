import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ImagePlus, X } from 'lucide-react';

const categories = [
  { value: 'cooked_meals', label: 'Cooked Meals' },
  { value: 'raw_ingredients', label: 'Raw Ingredients' },
  { value: 'packaged_food', label: 'Packaged Food' },
  { value: 'baked_goods', label: 'Baked Goods' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'other', label: 'Other' },
];

export default function DonationFormDialog({ open, onOpenChange, userEmail, userName }) {
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
        <DialogHeader><DialogTitle>Post Food Donation</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Food name *</Label>
            <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="e.g. 20 lunch boxes" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity *</Label>
              <Input value={form.quantity} onChange={e => u('quantity', e.target.value)} placeholder="e.g. 10 servings" required />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => u('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Freshness window (hours)</Label>
            <Input type="number" value={form.freshness_hours} onChange={e => u('freshness_hours', e.target.value)} placeholder="e.g. 4" />
          </div>
          <div>
            <Label>Pickup address *</Label>
            <Input value={form.pickup_address} onChange={e => u('pickup_address', e.target.value)} placeholder="Full street address" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Latitude</Label>
              <Input type="number" step="any" value={form.pickup_lat} onChange={e => u('pickup_lat', e.target.value)} placeholder="e.g. 15.9129" />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input type="number" step="any" value={form.pickup_lng} onChange={e => u('pickup_lng', e.target.value)} placeholder="e.g. 79.7400" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder="Any notes..." rows={2} />
          </div>
          <div>
            <Label>Food Photo</Label>
            {imagePreview ? (
              <div className="relative mt-1 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
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
                <span className="text-xs text-muted-foreground">Click to upload a photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending || uploadingImage} className="w-full bg-primary hover:bg-primary/90 text-white">
            {(mutation.isPending || uploadingImage) ? <><Loader2 className="w-4 h-4 animate-spin" />{uploadingImage ? ' Uploading...' : ' Posting...'}</> : 'Post Donation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { base44 } from './base44Client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Avatar, AvatarFallback } from './avatar';
import { Save, LogOut, Loader2, KeyRound, User, Phone, MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [form, setForm] = useState({ phone: '', city: '', org_type: '', bio: '' });
  const [pwForm, setPwForm] = useState({ newPass: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        city: user.city || '',
        org_type: user.org_type || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    toast.success(t('profile_updated'));
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (pwForm.newPass !== pwForm.confirm) { toast.error(t('profile_passwords_no_match')); return; }
    if (pwForm.newPass.length < 6) { toast.error(t('profile_password_min_length')); return; }
    setResetSending(true);
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: t('profile_reset_email_subject'),
      body: t('profile_reset_email_body').replace('{user}', user.full_name),
    });
    setResetSending(false);
    setPwForm({ newPass: '', confirm: '' });
    toast.success(`${t('profile_reset_email_sent')} ${user.email}`);
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('profile_title')}</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-primary font-bold text-xl bg-primary/10">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{user?.full_name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary font-medium capitalize mt-0.5">{user?.role || 'user'}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" />{t('profile_phone_label')}</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder={t('profile_phone_placeholder')} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><MapPin className="w-3.5 h-3.5" />{t('profile_city_label')}</Label>
                <Input value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder={t('profile_city_placeholder')} />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Building2 className="w-3.5 h-3.5" />{t('profile_org_type_label')}</Label>
              <Select value={form.org_type} onValueChange={v => setForm(p => ({...p, org_type: v}))}>
                <SelectTrigger><SelectValue placeholder={t('profile_org_type_placeholder')} /></SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'restaurant', label: t('org_restaurant') },
                    { value: 'hotel', label: t('org_hotel') },
                    { value: 'event_organizer', label: t('org_event_organizer') },
                    { value: 'household', label: t('org_household') },
                    { value: 'ngo', label: t('org_ngo') },
                    { value: 'shelter', label: t('org_shelter') },
                    { value: 'orphanage', label: t('org_orphanage') },
                    { value: 'individual', label: t('org_individual') },
                    { value: 'other', label: t('org_other') },
                  ].map(item => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" />{t('profile_bio_label')}</Label>
              <Textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} placeholder={t('profile_bio_placeholder')} rows={3} />
            </div>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t('profile_save_changes')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><KeyRound className="w-4 h-4" />{t('profile_password_reset_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label>{t('profile_new_password_label')}</Label>
              <Input type="password" value={pwForm.newPass} onChange={e => setPwForm(p => ({...p, newPass: e.target.value}))} placeholder={t('profile_new_password_placeholder')} />
            </div>
            <div>
              <Label>{t('profile_confirm_new_password_label')}</Label>
              <Input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} placeholder={t('profile_confirm_new_password_placeholder')} />
            </div>
            <Button type="submit" variant="outline" disabled={resetSending} className="gap-2">
              {resetSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {t('profile_send_reset_email')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={() => base44.auth.logout('/')} className="text-destructive hover:text-destructive gap-2">
        <LogOut className="w-4 h-4" /> {t('profile_sign_out')}
      </Button>
    </div>
  );
}

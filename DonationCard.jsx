import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, QrCode, Truck, CheckCircle2, Package, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const statusConfig = {
  available: { label: 'Available', cls: 'bg-accent/10 text-accent border-accent/20' },
  claimed:   { label: 'Claimed',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  picked_up: { label: 'Picked Up', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivered: { label: 'Delivered', cls: 'bg-primary/10 text-primary border-primary/20' },
  expired:   { label: 'Expired',   cls: 'bg-muted text-muted-foreground border-border' },
};

const categoryLabels = {
  cooked_meals: 'Cooked Meals', raw_ingredients: 'Raw Ingredients',
  packaged_food: 'Packaged Food', baked_goods: 'Baked Goods',
  beverages: 'Beverages', other: 'Other',
};

export default function DonationCard({ donation, role, userEmail, onClaim, onAcceptDelivery, onPickUp }) {
  const s = statusConfig[donation.status] || statusConfig.available;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {donation.image_url && (
        <div className="h-36 overflow-hidden">
          <img src={donation.image_url} alt={donation.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground leading-tight">{donation.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{donation.donor_name}</p>
          </div>
          <Badge variant="outline" className={`${s.cls} text-[10px] shrink-0`}>{s.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Package className="w-3 h-3" />{donation.quantity}</span>
          {donation.category && <span>· {categoryLabels[donation.category] || donation.category}</span>}
          {donation.freshness_hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{donation.freshness_hours}h fresh</span>}
        </div>
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{donation.pickup_address}</span>
        </div>
        {donation.description && <p className="text-xs text-muted-foreground line-clamp-2">{donation.description}</p>}
        <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(donation.created_date), { addSuffix: true })}</p>

        <div className="flex gap-2 pt-1">
          <Link to={`/donation/${donation.id}`} className="flex-1">
            <Button size="sm" variant="ghost" className="w-full gap-1 text-muted-foreground hover:text-foreground border border-border">
              <MessageCircle className="w-3 h-3" /> Chat & Details
            </Button>
          </Link>
          {role === 'receiver' && donation.status === 'available' && (
            <Button size="sm" onClick={onClaim} className="w-full bg-primary hover:bg-primary/90 text-white">Claim</Button>
          )}
          {role === 'volunteer' && donation.status === 'claimed' && !donation.volunteer_email && (
            <Button size="sm" onClick={onAcceptDelivery} className="w-full bg-primary hover:bg-primary/90 text-white gap-1">
              <Truck className="w-3 h-3" /> Accept Delivery
            </Button>
          )}
          {role === 'volunteer' && donation.volunteer_email === userEmail && donation.status === 'claimed' && (
            <Button size="sm" onClick={onPickUp} variant="outline" className="w-full gap-1">
              <CheckCircle2 className="w-3 h-3" /> Mark Picked Up
            </Button>
          )}
          {donation.status === 'picked_up' && donation.qr_code &&
            (donation.volunteer_email === userEmail || donation.claimed_by === userEmail) && (
            <Link to={`/delivery/${donation.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full gap-1">
                <QrCode className="w-3 h-3" /> Verify Delivery
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

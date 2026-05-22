import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import DonationMapView from '@/components/map/DonationMapView';

export default function NearbyDonations() {
  const [selectedId, setSelectedId] = useState(null);

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['available-donations-map'],
    queryFn: () => base44.entities.Donation.filter({ status: 'available' }, '-created_date'),
  });

  const donationsWithCoords = donations.filter(d => d.pickup_lat && d.pickup_lng);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nearby Donations</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse available food donations on the map</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden border shadow-sm h-[500px]">
            <DonationMapView
              donations={donationsWithCoords}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)
          ) : donations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No available donations right now</div>
          ) : (
            donations.map(d => (
              <Card
                key={d.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedId === d.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedId(d.id === selectedId ? null : d.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{d.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.donor_name}</p>
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[10px]">Available</Badge>
                </div>
                <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="w-3 h-3" />{d.quantity}</span>
                  {d.freshness_hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.freshness_hours}h</span>}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{d.pickup_address}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

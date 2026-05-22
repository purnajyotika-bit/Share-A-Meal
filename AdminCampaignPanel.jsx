import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Star, AlertTriangle } from 'lucide-react';

export default function AdminCampaignPanel({ open, onOpenChange }) {
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date', 100),
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });

  const pending = campaigns.filter(c => c.status === 'pending');
  const others = campaigns.filter(c => c.status !== 'pending');

  const statusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Campaign Admin Panel</DialogTitle></DialogHeader>

        {pending.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-foreground mb-3">⏳ Pending Approval ({pending.length})</h3>
            <div className="space-y-3">
              {pending.map(c => (
                <div key={c.id} className="border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">by {c.creator_name} · Goal: ₹{c.goal_amount?.toLocaleString()}</p>
                    </div>
                    {statusBadge(c.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white gap-1"
                      onClick={() => updateMutation.mutate({ id: c.id, data: { status: 'approved' } })}>
                      <CheckCircle2 className="w-3 h-3" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                      onClick={() => updateMutation.mutate({ id: c.id, data: { status: 'rejected' } })}>
                      <XCircle className="w-3 h-3" />Reject
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1"
                      onClick={() => updateMutation.mutate({ id: c.id, data: { is_featured: !c.is_featured } })}>
                      <Star className="w-3 h-3" />{c.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1"
                      onClick={() => updateMutation.mutate({ id: c.id, data: { is_emergency: !c.is_emergency } })}>
                      <AlertTriangle className="w-3 h-3" />{c.is_emergency ? 'Remove Emergency' : 'Mark Emergency'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">All Campaigns ({others.length})</h3>
          <div className="space-y-2">
            {others.map(c => (
              <div key={c.id} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">₹{(c.raised_amount || 0).toLocaleString()} / ₹{c.goal_amount?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(c.status)}
                  {c.is_featured && <span className="text-xs">⭐</span>}
                  {c.is_emergency && <span className="text-xs">🚨</span>}
                  <Button size="sm" variant="outline" className="h-7 gap-1"
                    onClick={() => updateMutation.mutate({ id: c.id, data: { is_featured: !c.is_featured } })}>
                    <Star className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

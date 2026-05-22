import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Award } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const rankBg = ['bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-600', 'bg-orange-100 text-orange-700'];

export default function Leaderboard() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const all = await base44.entities.User.list();
      return all.filter(u => u.role !== 'admin').sort((a, b) => (b.impact_points || 0) - (a.impact_points || 0));
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Community</div>
      <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
        <Trophy className="w-7 h-7 text-primary" /> Impact leaderboard
      </h1>
      <p className="text-muted-foreground text-sm mb-8">Top contributors this season — donors and volunteers turning surplus into supper.</p>

      <div className="bg-card border rounded-2xl overflow-hidden divide-y">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
              <div className="flex-1"><div className="w-32 h-4 bg-muted animate-pulse rounded" /></div>
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No users yet</div>
        ) : (
          users.map((u, i) => {
            const initials = u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
            return (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i < 3 ? rankBg[i] : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </div>
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.role}{u.org_type ? ` · ${u.org_type.replace('_', ' ')}` : ''}</p>
                </div>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-semibold gap-1 shrink-0">
                  <Award className="w-3 h-3" /> {u.impact_points || 0} pts
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

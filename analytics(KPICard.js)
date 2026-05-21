import React from 'react';

export default function KPICard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-card border rounded-2xl p-4 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}

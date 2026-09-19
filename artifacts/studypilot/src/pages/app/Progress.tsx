import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Clock, Zap, BarChart3 } from 'lucide-react';

export default function Progress() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif text-foreground mb-2">Lernfortschritt</h1>
        <p className="text-muted-foreground">Verfolge deine Konstanz und Beherrschung über die Zeit.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} title="Aktuelle Serie" value="12" suffix="Tage" />
        <StatCard icon={Target} title="Gesamte Sitzungen" value="48" suffix="erledigt" />
        <StatCard icon={Clock} title="Lernzeit" value="14.5" suffix="Stunden" />
        <StatCard icon={Zap} title="Gemeisterte Karten" value="342" suffix="Karten" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" /> Lernaktivität (Diese Woche)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-2 px-6 pb-6">
            {[45, 60, 30, 90, 45, 0, 0].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-primary/20 rounded-t-sm relative group cursor-pointer hover:bg-primary/30 transition-colors" style={{ height: `${Math.max(h, 5)}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {h} Min.
                  </div>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {['Mo','Di','Mi','Do','Fr','Sa','So'][i]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg">Kursbeherrschung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MasteryRow name="Biologie 101" percent={65} color="bg-green-500" />
            <MasteryRow name="Ethik" percent={80} color="bg-purple-500" />
            <MasteryRow name="Makroökonomie" percent={30} color="bg-blue-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, suffix }: { icon: any, title: string, value: string, suffix: string }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-3xl font-serif text-foreground">{value}</span>
        <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    </div>
  );
}

function MasteryRow({ name, percent, color }: { name: string, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-medium mb-2">
        <span>{name}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

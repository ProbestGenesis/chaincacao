"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Weight, Clock, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface KPIItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendPositive?: boolean;
}

interface InventoryKPIsProps {
  totalLots: number;
  totalWeight: number;
  pendingVerification: number;
  verifiedLots: number;
}

export function InventoryKPIs({
  totalLots,
  totalWeight,
  pendingVerification,
  verifiedLots,
}: InventoryKPIsProps) {
  const kpiData: KPIItem[] = [
    {
      icon: <Package className="w-6 h-6" />,
      label: 'Total des Lots',
      value: totalLots,
      trend: '+12% ce mois',
      trendPositive: true,
    },
    {
      icon: <Weight className="w-6 h-6" />,
      label: 'Poids Total',
      value: (totalWeight / 1000).toFixed(1),
      unit: 'Tonnes',
      trend: '+5% ce mois',
      trendPositive: true,
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'En Attente de Vérification',
      value: pendingVerification,
      trend: '-8% ce mois',
      trendPositive: false,
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: 'Lots Vérifiés',
      value: verifiedLots,
      trend: '+15% ce mois',
      trendPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.label}
            </CardTitle>
            <div className="text-muted-foreground opacity-70">{kpi.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              {kpi.unit && <div className="text-sm text-muted-foreground">{kpi.unit}</div>}
            </div>
            {kpi.trend && (
              <p
                className={clsx('text-xs mt-2 font-medium', {
                  'text-green-600 dark:text-green-400': kpi.trendPositive,
                  'text-orange-600 dark:text-orange-400': !kpi.trendPositive,
                })}
              >
                {kpi.trend}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

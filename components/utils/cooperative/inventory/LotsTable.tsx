"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

export interface Lot {
  id: string;
  lotId: string;
  farmer: {
    name: string;
    avatar: string;
  };
  weight: number;
  status: 'draft' | 'pending' | 'verified' | 'transferred';
  createdAt: string;
}

interface LotsTableProps {
  lots: Lot[];
}

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300' },
  verified: { label: 'Vérifié', color: 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300' },
  transferred: { label: 'Transféré', color: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300' },
};

export function LotsTable({ lots }: LotsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle>Liste des Lots</CardTitle>
        <span className="text-sm text-muted-foreground">{lots.length} lots</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Left: Lot info */}
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={lot.farmer.avatar} alt={lot.farmer.name} />
                  <AvatarFallback>{lot.farmer.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">LOT #{lot.lotId}</p>
                  <p className="text-xs text-muted-foreground truncate">{lot.farmer.name}</p>
                </div>
              </div>

              {/* Center: Weight */}
              <div className="hidden sm:flex flex-col items-center gap-1 px-4">
                <p className="text-sm font-semibold text-foreground">{lot.weight} kg</p>
                <p className="text-xs text-muted-foreground">{lot.createdAt}</p>
              </div>

              {/* Right: Status & Action */}
              <div className="flex items-center gap-3 ml-4">
                <Badge
                  variant="outline"
                  className={clsx('font-medium text-xs', statusConfig[lot.status].color)}
                >
                  {statusConfig[lot.status].label}
                </Badge>
                <Link href={`/inventory/${lot.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="View lot details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

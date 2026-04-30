"use client"

import { Building2 } from 'lucide-react';

interface Phase2Props {
  cooperative: {
    name: string;
    volume: string;
    description: string;
  };
}

export function Phase2Agrégation({ cooperative }: Phase2Props) {
  return (
    <div className="space-y-4">
      {/* Cooperative Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-gray-900 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Coopérative</p>
            <p className="font-medium text-foreground">{cooperative.name}</p>
          </div>
        </div>

        {/* Volume */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Volume</p>
          <p className="text-lg font-bold text-foreground">{cooperative.volume}</p>
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-foreground leading-relaxed">{cooperative.description}</p>
        </div>
      </div>
    </div>
  );
}

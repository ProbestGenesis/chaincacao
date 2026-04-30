"use client"

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ComplianceSummaryProps {
  eudrStatus: string;
  diligenceDate: string;
  countryRisk: string;
  esgScore: string;
}

export function ComplianceSummary({
  eudrStatus,
  diligenceDate,
  countryRisk,
  esgScore,
}: ComplianceSummaryProps) {
  return (
    <div className="bg-amber-900 dark:bg-amber-950 text-white rounded-2xl p-6 space-y-6">
      <h3 className="text-xl font-bold">Résumé de Conformité</h3>

      {/* Summary Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-amber-800/40">
          <span className="text-sm font-medium text-amber-100">Statut EUDR</span>
          <span className="font-bold text-white">{eudrStatus}</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-amber-800/40">
          <span className="text-sm font-medium text-amber-100">Date de diligence</span>
          <span className="font-bold text-white">{diligenceDate}</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-amber-800/40">
          <span className="text-sm font-medium text-amber-100">Risque Pays</span>
          <span className="font-bold text-white">{countryRisk}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-100">Score ESG</span>
          <span className="font-bold text-xl text-white">{esgScore}</span>
        </div>
      </div>

      {/* PDF Button */}
      <Button
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-sm py-2 h-auto"
        onClick={() => console.log('Download PDF')}
      >
        <Download className="w-4 h-4 mr-2" />
        TÉLÉCHARGER RAPPORT PDF
      </Button>
    </div>
  );
}

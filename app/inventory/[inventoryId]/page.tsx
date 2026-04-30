
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import {
  TimelinePhase,
  Phase1Récolte,
  Phase2Agrégation,
  Phase3Certification,
  ComplianceSummary,
  OriginMap,
} from '@/components/utils/cooperative/inventory';
import { Leaf, Package, BadgeCheck } from 'lucide-react';

// Mock data
const mockData = {
  lotId: 'AGO-2024-AF-001',
  title: 'Vérification de Conformité EUDR',
  description: 'Accédez à la timeline complète et aux preuves de traçabilité pour validation finale.',
  status: 'Conforme',
  
  phases: [
    {
      id: 1,
      name: 'Récolte',
      date: '12 Oct 2023',
      icon: Leaf,
      farmer: {
        name: 'Koffi Mensah',
        avatar: 'https://i.pravatar.cc/48?u=koffi',
        coordinates: "6°12'15\"N, 1°13'42\"E",
      },
      map: 'https://picsum.photos/400/200?random=1&blur=2',
    },
    {
      id: 2,
      name: 'Agrégation',
      date: '15 Oct 2023',
      icon: Package,
      cooperative: {
        name: "Union des Producteurs d'Atakpamé",
        volume: '2,450 kg',
        description:
          "Le lot a été reçu au centre de collecte #CC-04. Vérification d'absence de mélange avec des zones de déboisement confirmée par imagerie satellite.",
      },
    },
    {
      id: 3,
      name: 'Qualité & Certification',
      date: '18 Oct 2023',
      icon: BadgeCheck,
      certificates: [
        { label: 'CERTIFICAT BIO', value: 'ECO-CERT-2023-99' },
        { label: 'ANALYSE GRADE', value: 'Grade A - Premium' },
      ],
    },
  ],

  summary: {
    eudrStatus: 'Validé',
    diligenceDate: '20 Oct 2023',
    countryRisk: 'Faible',
    esgScore: '94/100',
  },

  origin: {
    region: 'Atakpamé, Plateaux Region',
    country: 'Togo',
    map: 'https://picsum.photos/250/200?random=2&blur=1',
  },
};

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span>DASHBOARD</span>
            <span>/</span>
            <span>INVENTORY</span>
            <span>/</span>
            <span className="text-foreground font-medium">LOT #{mockData.lotId}</span>
          </div>

          {/* Title Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {mockData.title}
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl">
                {mockData.description}
              </p>
            </div>

            {/* Status Button */}
            <Button
              className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 h-auto flex items-center gap-2 flex-shrink-0 w-fit"
            >
              <CheckCircle2 className="w-5 h-5" />
              {mockData.status}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2 space-y-2">
            {mockData.phases.map((phase) => (
              <React.Fragment key={phase.id}>
                <TimelinePhase
                  phaseNumber={phase.id}
                  phaseName={phase.name}
                  date={phase.date}
                  icon={<phase.icon className="w-6 h-6" />}
                >
                  {phase.id === 1 && (
                    <Phase1Récolte
                      farmer={(phase as any).farmer}
                      mapImage={(phase as any).map}
                    />
                  )}
                  {phase.id === 2 && (
                    <Phase2Agrégation
                      cooperative={(phase as any).cooperative}
                    />
                  )}
                  {phase.id === 3 && (
                    <Phase3Certification
                      certificates={(phase as any).certificates}
                    />
                  )}
                </TimelinePhase>
              </React.Fragment>
            ))}
          </div>

          {/* Right Column - Summary & Origin */}
          <div className="lg:col-span-1 space-y-6">
            <ComplianceSummary
              eudrStatus={mockData.summary.eudrStatus}
              diligenceDate={mockData.summary.diligenceDate}
              countryRisk={mockData.summary.countryRisk}
              esgScore={mockData.summary.esgScore}
            />
            <OriginMap
              region={mockData.origin.region}
              country={mockData.origin.country}
              mapImage={mockData.origin.map}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

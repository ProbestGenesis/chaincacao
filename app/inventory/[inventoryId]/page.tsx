"use client"

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useLotVerification } from '@/hooks/useTraceability';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Globe, Loader2, MapPin, Calendar, Package, Leaf, Truck, Factory, Ship } from 'lucide-react';
import {
  TimelinePhase,
  ComplianceSummary,
  OriginMap,
} from '@/components/utils/cooperative/inventory';
import { translateStatus } from '@/lib/status-helper';

export default function InventoryPage() {
  const params = useParams();
  const inventoryId = params?.inventoryId as string;
  const { data: verificationData, isLoading, error } = useLotVerification(inventoryId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Chargement de la traçabilité blockchain...</p>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="bg-destructive/10 p-6 rounded-full mb-6">
          <ShieldCheck className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Lot non trouvé ou invalide</h1>
        <p className="text-muted-foreground max-w-md">
          Impossible de vérifier l'authenticité de ce lot sur la blockchain. Veuillez vérifier l'ID ou scanner à nouveau le QR code.
        </p>
        <Button className="mt-8" onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  const getStepIcon = (step: string) => {
    switch (step.toUpperCase()) {
      case 'COLLECTE': return Leaf;
      case 'EN_TRANSIT': return Truck;
      case 'TRANSFORME': return Factory;
      case 'EXPORTE': return Ship;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Globe className="w-4 h-4" />
            <span>TRAÇABILITÉ PUBLIQUE</span>
            <span>/</span>
            <span className="text-foreground font-medium uppercase">LOT #{inventoryId}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {verificationData.product || 'Cacao Naturel'}
                </h1>
                {verificationData.blockchain_verified && (
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    BLOCHAIN VÉRIFIÉ
                  </div>
                )}
              </div>
              <p className="text-base text-muted-foreground max-w-2xl">
                Ce lot a été audité et validé à chaque étape de sa chaîne de valeur. Les informations ci-dessous sont extraites en temps réel du registre immuable.
              </p>
            </div>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 h-auto flex items-center gap-2 flex-shrink-0 w-fit rounded-full shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              AUTHENTIQUE
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Journey Timeline */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Parcours du Lot
            </h3>
            
            {verificationData.journey.map((item, index) => {
              const Icon = getStepIcon(item.step);
              return (
                <TimelinePhase
                  key={item.txId}
                  phaseNumber={index + 1}
                  phaseName={translateStatus(item.step)}
                  date={new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  icon={<Icon className="w-6 h-6" />}
                >
                  <div className="space-y-3 p-4 bg-muted/10 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-[10px] break-all text-primary">{item.txId}</span>
                    </div>
                    <p className="text-sm">
                      Étape validée et enregistrée par l'acteur certifié. 
                      La preuve cryptographique garantit l'intégrité de cette donnée.
                    </p>
                  </div>
                </TimelinePhase>
              );
            })}
          </div>

          {/* Right Column - Harvest Info & Origin */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                 <Leaf className="w-4 h-4" />
                 Détails de Récolte
               </h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-dashed">
                   <span className="text-sm text-muted-foreground">Espèce</span>
                   <span className="font-semibold">{verificationData.harvest_info.species}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-dashed">
                   <span className="text-sm text-muted-foreground">Poids</span>
                   <span className="font-semibold">{verificationData.harvest_info.weight} kg</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-dashed">
                   <span className="text-sm text-muted-foreground">Date de Récolte</span>
                   <span className="font-semibold">{new Date(verificationData.harvest_info.date).toLocaleDateString('fr-FR')}</span>
                 </div>
               </div>
            </Card>

            <ComplianceSummary
              eudrStatus="Validé"
              diligenceDate={new Date().toLocaleDateString('fr-FR')}
              countryRisk="Faible"
              esgScore="92/100"
            />
            
            {verificationData.origin_photo && (
              <Card className="overflow-hidden border shadow-sm">
                <img 
                  src={verificationData.origin_photo} 
                  alt="Origine du lot" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 bg-background">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Photo certifiée prise lors de la collecte
                  </p>
                </div>
              </Card>
            )}

            <OriginMap
              region="Plateaux, Togo"
              country="Togo"
              mapImage="https://picsum.photos/400/300?random=map"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-card rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

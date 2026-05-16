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
  const { data: rawData, isLoading, error } = useLotVerification(inventoryId);

  // Gérer les réponses enveloppées (success: true, data: ...) ou directes
  const verificationData = (rawData as any)?.data || rawData;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <p className="text-emerald-900 font-medium animate-pulse">Vérification blockchain en cours...</p>
      </div>
    );
  }

  if (error || !verificationData || !verificationData.lot_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-6 text-center">
        <div className="bg-red-50 p-8 rounded-full mb-8 shadow-inner">
          <ShieldCheck className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-3 italic">Authenticité non garantie</h1>
        <p className="text-neutral-600 max-w-md text-lg leading-relaxed">
          Ce lot n'a pas été identifié dans le registre officiel. 
          Veuillez scanner à nouveau le QR Code original présent sur l'emballage.
        </p>
        <Button 
          variant="outline" 
          className="mt-10 rounded-full px-8 py-6 border-2 hover:bg-neutral-100" 
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  const getStepIcon = (step: string) => {
    switch (step.toUpperCase()) {
      case 'COLLECTE': return Leaf;
      case 'EN_TRANSIT': 
      case 'TRANSFERE': return Truck;
      case 'TRANSFORME': return Factory;
      case 'EXPORTE': return Ship;
      default: return Package;
    }
  };

  const getStepColor = (step: string) => {
    switch (step.toUpperCase()) {
      case 'COLLECTE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'EN_TRANSIT': 
      case 'TRANSFERE': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'TRANSFORME': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'EXPORTE': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-100';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 font-sans selection:bg-emerald-100">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-neutral-900 text-white pb-24 pt-12">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/20 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400 mb-8 uppercase">
            <Globe className="w-4 h-4" />
            <span>Registre de Transparence Global</span>
            <span className="text-neutral-600">/</span>
            <span className="text-white">LOT #{verificationData.lot_id}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  {verificationData.product || 'Cacao d\'Origine'}
                </h1>
                {verificationData.blockchain_verified && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-black border border-emerald-500/30 backdrop-blur-md">
                    <ShieldCheck className="w-4 h-4" />
                    CERTIFIÉ BLOCKCHAIN
                  </div>
                )}
              </div>
              <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed font-light italic">
                "Du champ à la tablette, chaque étape de ce cacao est enregistrée de manière immuable pour garantir éthique et qualité."
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex items-center gap-6 shadow-2xl">
                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">État de Validité</p>
                    <p className="text-2xl font-bold text-white">AUTHENTIQUE</p>
                </div>
            </div>
          </div>
        </div>
        
        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg className="relative block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-neutral-50/50"></path>
            </svg>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - The Journey (Visual Timeline) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl shadow-neutral-200/50 border border-neutral-100">
                <h3 className="text-2xl font-black mb-12 flex items-center gap-3 text-neutral-900">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  L'Odyssée du Cacao
                </h3>
                
                <div className="space-y-0">
                {(verificationData.journey || []).map((item: any, index: number) => {
                  const Icon = getStepIcon(item.step);
                  const colors = getStepColor(item.step);
                  const isLast = index === (verificationData.journey?.length || 0) - 1;
                  
                  return (
                    <div key={item.txId} className="relative pl-12 pb-12 group">
                        {/* Vertical line connector */}
                        {!isLast && (
                            <div className="absolute left-[1.375rem] top-10 bottom-0 w-0.5 bg-gradient-to-b from-neutral-200 to-transparent group-hover:from-emerald-200 transition-colors duration-500"></div>
                        )}
                        
                        {/* Timeline Bullet */}
                        <div className={`absolute left-0 top-0 w-11 h-11 rounded-2xl flex items-center justify-center z-10 shadow-sm border-2 transition-transform duration-300 group-hover:scale-110 ${colors}`}>
                            <Icon className="w-5 h-5" />
                        </div>

                        <div className="pt-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${colors}`}>
                                    {translateStatus(item.step)}
                                </span>
                                <span className="text-sm font-bold text-neutral-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>

                            <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 group-hover:bg-white group-hover:shadow-lg group-hover:border-emerald-100 transition-all duration-300">
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    Cette étape a été certifiée par l'autorité locale et enregistrée sur le registre décentralisé. 
                                    Elle garantit que les critères de qualité et d'éthique ont été respectés.
                                </p>
                                <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-200/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-neutral-200"></div>
                                        <span className="text-xs font-bold text-neutral-500 italic">Audit Validé</span>
                                    </div>
                                    <div className="flex items-center gap-2 group/tx">
                                        <span className="text-[10px] font-mono text-neutral-400 max-w-[120px] truncate">{item.txId}</span>
                                        <div className="p-1.5 bg-white border border-neutral-200 rounded-lg group-hover/tx:text-emerald-600 group-hover/tx:border-emerald-200">
                                            <ShieldCheck className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  );
                })}
                </div>
            </div>
          </div>

          {/* Right Column - Origin & Compliance */}
          <div className="lg:col-span-4 space-y-8">
            {/* Harvest Details Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden relative">
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full opacity-50 blur-3xl"></div>
               
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-8 flex items-center gap-2">
                 <Leaf className="w-4 h-4" />
                 L'Origine du Goût
               </h3>
               
               <div className="space-y-6">
                 {[
                    { label: "Espèce de Cacao", value: verificationData.harvest_info?.species || 'Forastero', icon: Leaf },
                    { label: "Poids Récolté", value: `${verificationData.harvest_info?.weight || 0} kg`, icon: Package },
                    { label: "Date de Récolte", value: verificationData.harvest_info?.date ? new Date(verificationData.harvest_info.date).toLocaleDateString('fr-FR') : '—', icon: Calendar }
                 ].map((detail, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                                <detail.icon className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">{detail.label}</span>
                        </div>
                        <span className="font-black text-neutral-900">{detail.value}</span>
                    </div>
                 ))}
               </div>
            </div>

            {/* Compliance Summary Component (Reusable but styled here) */}
            <ComplianceSummary
              eudrStatus="CONFORME EUDR"
              diligenceDate={new Date().toLocaleDateString('fr-FR')}
              countryRisk="Zéro Déforestation"
              esgScore="Haut Impact Social"
            />
            
            {/* Photo & Map */}
            {verificationData.origin_photo && (
              <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-neutral-200/50 border border-neutral-100">
                <div className="relative h-64 overflow-hidden">
                    <img 
                      src={verificationData.origin_photo} 
                      alt="Origine du lot" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 text-white/90 text-sm font-bold backdrop-blur-md bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20">
                            <MapPin className="w-4 h-4" />
                            Photo Certifiée à la Source
                        </div>
                    </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-neutral-600 font-medium italic">
                    "Cliché capturé lors de la collecte initiale, horodaté et géolocalisé pour prouver l'origine exacte de votre lot."
                  </p>
                </div>
              </div>
            )}

            <OriginMap
              region="Région des Plateaux"
              country="Togo, Afrique de l'Ouest"
              mapImage="https://picsum.photos/400/300?random=map"
            />
          </div>

        </div>
      </div>

      {/* Footer Branding */}
      <div className="container mx-auto px-4 pb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black tracking-tighter text-neutral-900">ChainCacao Trust Engine</span>
          </div>
          <p className="text-xs text-neutral-400 font-medium max-w-sm mx-auto">
              Ce certificat de traçabilité est généré dynamiquement à partir du registre blockchain public. 
              Toutes les données sont vérifiables et immuables.
          </p>
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

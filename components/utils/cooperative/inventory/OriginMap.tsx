"use client"

import { MapPin } from 'lucide-react';

interface OriginMapProps {
  region: string;
  country: string;
  mapImage: string;
}

export function OriginMap({ region, country, mapImage }: OriginMapProps) {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Map Image */}
      <div className="bg-gray-100 dark:bg-gray-800 relative">
        <img
          src={mapImage}
          alt="World map"
          className="w-full h-auto object-cover"
          style={{ aspectRatio: '5/4' }}
        />
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-3">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Carte de l'Origine
        </h4>
        
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Origine: {region}</p>
          <p className="text-xs mt-1">{country}</p>
        </div>
      </div>
    </div>
  );
}

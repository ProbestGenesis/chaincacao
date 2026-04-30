"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';
import { clsx } from 'clsx';

interface Phase1Props {
  farmer: {
    name: string;
    avatar: string;
    coordinates: string;
  };
  mapImage: string;
}

export function Phase1Récolte({ farmer, mapImage }: Phase1Props) {
  return (
    <div className="space-y-4">
      {/* Farmer Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={farmer.avatar} alt={farmer.name} />
            <AvatarFallback>{farmer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Agriculteur</p>
            <p className="font-medium text-foreground">{farmer.name}</p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-start gap-2 pt-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Coordonnées GPS</p>
            <p className="text-sm text-foreground font-mono">{farmer.coordinates}</p>
          </div>
        </div>
      </div>

      {/* Map Image */}
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={mapImage}
          alt="Location map"
          className="w-full h-auto object-cover"
          style={{ aspectRatio: '2/1' }}
        />
        {/* Map tooltip overlay */}
        <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1.5 rounded text-xs font-medium shadow-lg">
          Voir la Géolocalisation
        </div>
      </div>
    </div>
  );
}

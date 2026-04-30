"use client"

import * as React from 'react';
import { useState, useMemo } from 'react';
import { InventoryKPIs, LotsTable, InventoryFilters, type Lot } from '@/components/utils/cooperative/inventory';

// Mock data
const mockLots: Lot[] = [
  {
    id: '1',
    lotId: 'AGO-2024-AF-001',
    farmer: { name: 'Koffi Mensah', avatar: 'https://i.pravatar.cc/48?u=koffi' },
    weight: 2450,
    status: 'verified',
    createdAt: '12 Oct 2023',
  },
  {
    id: '2',
    lotId: 'AGO-2024-AF-002',
    farmer: { name: 'Ama Osei', avatar: 'https://i.pravatar.cc/48?u=ama' },
    weight: 1800,
    status: 'pending',
    createdAt: '15 Oct 2023',
  },
  {
    id: '3',
    lotId: 'AGO-2024-AF-003',
    farmer: { name: 'Kwame Asante', avatar: 'https://i.pravatar.cc/48?u=kwame' },
    weight: 3200,
    status: 'transferred',
    createdAt: '18 Oct 2023',
  },
  {
    id: '4',
    lotId: 'AGO-2024-AF-004',
    farmer: { name: 'Abena Kofi', avatar: 'https://i.pravatar.cc/48?u=abena' },
    weight: 2100,
    status: 'draft',
    createdAt: '20 Oct 2023',
  },
  {
    id: '5',
    lotId: 'AGO-2024-AF-005',
    farmer: { name: 'Yaw Mensah', avatar: 'https://i.pravatar.cc/48?u=yaw' },
    weight: 2750,
    status: 'verified',
    createdAt: '22 Oct 2023',
  },
  {
    id: '6',
    lotId: 'AGO-2024-AF-006',
    farmer: { name: 'Efua Akosua', avatar: 'https://i.pravatar.cc/48?u=efua' },
    weight: 1950,
    status: 'pending',
    createdAt: '24 Oct 2023',
  },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter and search logic
  const filteredLots = useMemo(() => {
    let result = mockLots;

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter((lot) => lot.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lot) =>
          lot.lotId.toLowerCase().includes(query) ||
          lot.farmer.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeFilter]);

  // Calculate KPIs
  const kpis = {
    totalLots: mockLots.length,
    totalWeight: mockLots.reduce((sum, lot) => sum + lot.weight, 0),
    pendingVerification: mockLots.filter((lot) => lot.status === 'pending').length,
    verifiedLots: mockLots.filter((lot) => lot.status === 'verified').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Inventaire des Lots
          </h1>
          <p className="text-base text-muted-foreground">
            Gérez et suivez tous vos lots de cacao en un seul endroit
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-10">
        {/* KPIs Section */}
        <InventoryKPIs
          totalLots={kpis.totalLots}
          totalWeight={kpis.totalWeight}
          pendingVerification={kpis.pendingVerification}
          verifiedLots={kpis.verifiedLots}
        />

        {/* Filters Section */}
        <InventoryFilters
          onSearch={setSearchQuery}
          onFilterChange={setActiveFilter}
        />

        {/* Lots Table Section */}
        {filteredLots.length > 0 ? (
          <LotsTable lots={filteredLots} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucun lot trouvé. Essayez de modifier vos filtres ou votre recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

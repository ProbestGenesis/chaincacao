"use client"

import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface InventoryFiltersProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

const filterOptions = [
  { id: 'all', label: 'Tous les lots' },
  { id: 'pending', label: 'En attente' },
  { id: 'verified', label: 'Vérifiés' },
  { id: 'transferred', label: 'Transférés' },
];

export function InventoryFilters({ onSearch, onFilterChange }: InventoryFiltersProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange?.(filterId);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un lot..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {filterOptions.map((option) => (
          <Button
            key={option.id}
            variant={activeFilter === option.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

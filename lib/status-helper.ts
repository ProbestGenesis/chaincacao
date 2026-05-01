export const translateStatus = (status: string | undefined): string => {
  if (!status) return "Inconnu";
  
  const statusMap: Record<string, string> = {
    // Lots & General
    draft: "Brouillon",
    pending: "En attente",
    transferred: "Transféré",
    transformed: "Transformé",
    exported: "Exporté",
    
    // Sync
    synced: "Synchronisé",
    error: "Erreur",
    
    // Orders / Transport
    assigne: "Assigné",
    assigned: "Assigné",
    picked_up: "Récupéré",
    in_transit: "En transit",
    delivered: "Livré",
    cancelled: "Annulé",
    
    // KYC & Validation
    verified: "Vérifié",
    rejected: "Rejeté",
    confirmed: "Confirmé",
  };

  return statusMap[status.toLowerCase()] || status;
};

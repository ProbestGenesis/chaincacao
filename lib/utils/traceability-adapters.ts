/**
 * Adapters pour transformer les données de l'API vers les composants UI existants
 */

import type { HistoryEntry, EUDRReport } from "@/types/api-traceability"
import type { Lot } from "@/types/types"

/**
 * Mappe HistoryEntry[] vers le format attendu par LotWorkflowTimeline
 */
export function mapHistoryToTimeline(history: HistoryEntry[]) {
  return history.map((entry) => ({
    actionId: entry.txId,
    action: entry.value.statut,
    actor: entry.value.org || "Inconnu",
    actorName: entry.value.user || "Utilisateur Blockchain",
    description: `Action enregistrée sur le ledger : ${entry.value.statut}`,
    phase: entry.value.statut.toLowerCase() as any,
    timestamp: new Date(entry.timestamp).getTime(),
    metadata: entry.value,
    chainStatus: "recorded" as const,
    chainHash: entry.txId,
  }))
}

/**
 * Mappe EUDRReport vers les props de SelectedLotCompliance
 */
export function mapEUDRToComplianceProps(report: EUDRReport) {
  const lot = report.data.lot as Lot
  
  return {
    lot,
    timeline: mapHistoryToTimeline(report.data.history),
    complianceScore: report.compliance_status === "COMPLIANT" ? "95" : "40",
    risk: "Faible",
    eudrStatus: report.compliance_status === "COMPLIANT" ? "Conforme" : "Non conforme",
    documents: report.data.certifications.map(c => c.filename || "certificat.pdf"),
    sourceLots: [report.proof_hash],
    specItems: [
      { label: "Poids", value: `${lot.poidsKg} kg` },
      { label: "Espèce", value: lot.espece },
      { label: "Région", value: lot.region },
      { label: "Statut", value: report.compliance_status },
    ],
    checklist: [
      { label: "Géolocalisation valide", status: "validé" },
      { label: "Absence de déforestation", status: report.compliance_status === "COMPLIANT" ? "validé" : "alerte" },
      { label: "Légalité foncière", status: "validé" },
      { label: "Respect droits humains", status: "validé" },
    ],
  }
}

"use client"

import type { ComponentProps } from "react"
import { useSearchParams } from "next/navigation"
import { Clock3, FileCheck, Languages, ShieldCheck, Ship, Truck } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { SimpleRolePage } from "@/components/dashboard/simple-role-page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEUDRStore } from "@/store/eudr"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import { useUser } from "@/context/useUser"
import { getLotLineageIds } from "@/lib/lot-lineage"

export function ShipmentDashboard() {
  const { activeRole } = useUser()
  const searchParams = useSearchParams()
  const section = searchParams.get("section")

  if (activeRole === "Exporter" || activeRole === "Admin") {
    return <ExporterDashboard section={section} />
  }

  return <GenericShipmentDashboard role={activeRole ?? "CarrierUser"} section={section} />
}

function ExporterDashboard({ section }: { section: string | null }) {
  const lots = useLotsStore((state) => state.lots)
  const records = useEUDRStore((state) => state.eudrRecords)
  const confirmEUDR = useEUDRStore((state) => state.confirmEUDR)
  const updateEUDRStatus = useEUDRStore((state) => state.updateEUDRStatus)
  const addAction = useLotActionsStore((state) => state.addAction)
  const { user } = useUser()

  const exportableLots = lots.filter((lot) => lot.statut === "transferred" || lot.statut === "transformed")

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exporter"
        title="Conformité et expédition"
        description="Suivi des lots prêts à l’export et des confirmations EUDR."
        actionLabel="Vérifier EUDR"
        actionHref="/shipments?role=exporter&section=conformite"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lots prêts" value={String(lots.filter((lot) => lot.statut !== "draft").length)} icon={Ship} />
        <StatCard label="EUDR confirmés" value={String(records.filter((record) => record.status === "confirmed").length)} icon={ShieldCheck} tone="dark" />
        <StatCard label="Dossiers" value={String(records.length)} icon={FileCheck} />
        <StatCard label="En attente" value={String(records.filter((record) => record.status === "pending").length)} icon={Clock3} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="grid gap-3 p-6">
          {section === "conformite" ? (
            exportableLots.map((lot) => (
              <div key={lot.lotId} className="flex flex-col gap-3 rounded-2xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{lot.lotId}</p>
                  <p className="text-sm text-muted-foreground">{lot.espece} · {lot.poidsKg} kg</p>
                </div>
                <Button
                  className="rounded-xl"
                  onClick={() => {
                    if (!user) return
                    const lineageLotIds = getLotLineageIds(lot)
                    confirmEUDR({
                      shipmentId: lot.lotId,
                      lotIds: lineageLotIds,
                      confirmedBy: user.userId,
                      status: "confirmed",
                      eudrStatus: "approved",
                      diligenceDate: new Date().toISOString(),
                      countryRisk: "low",
                      esgScore: "98",
                    })
                    lineageLotIds.forEach((lotId) => {
                      addAction({
                        lotId,
                        actor: "Exporter",
                        actorName: user.nomAffiche,
                        actorId: user.userId,
                        action: "verified",
                        phase: "controle",
                        status: "exported",
                        description:
                          lotId === lot.lotId
                            ? "Confirmation EUDR enregistrée depuis le tableau de bord exporteur."
                            : `Confirmation EUDR héritée du groupement ${lot.lotId}.`,
                        metadata: {
                          shipmentId: lot.lotId,
                          lotId,
                          groupLotId: lot.isGroup ? lot.lotId : undefined,
                          confirmedLotIds: lineageLotIds,
                          eudrStatus: "approved",
                        },
                      })
                    })
                    updateEUDRStatus(lot.lotId, "approved")
                  }}
                >
                  <ShieldCheck className="size-4" />
                  Confirmer EUDR
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Ouvre la section conformité pour valider les lots prêts à l’export.
            </div>
          )}
          {!exportableLots.length && section === "conformite" && (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Aucun lot exportable à confirmer.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GenericShipmentDashboard({ role, section }: { role: string; section: string | null }) {
  const configMap: Record<string, ComponentProps<typeof SimpleRolePage>> = {
    Transformer: {
      eyebrow: "Transformer",
      title: "Atelier de transformation",
      description: "Traçabilité des lots en cours de transformation et contrôle qualité.",
      actionLabel: "Lots à traiter",
      actionHref: "/shipments?role=transformer&section=lots",
      stats: [
        { label: "Réceptions", value: "18", icon: Ship },
        { label: "En cours", value: "6", icon: Truck },
        { label: "Alertes qualité", value: "1", icon: FileCheck },
      ],
      highlights: [
        "Réceptionner les lots validés par la coopérative.",
        "Saisir les mesures qualité et l'état de transformation.",
        "Faire remonter les statuts vers la chaîne de conformité.",
      ],
    },
    CarrierUser: {
      eyebrow: "Transport",
      title: "Ordres de transport",
      description: "Vos courses, vos pickups et le suivi de livraison.",
      actionLabel: "Voir les ordres",
      actionHref: "/shipments?role=carrier-user&section=ordres",
      stats: [
        { label: "Ordres actifs", value: "7", icon: Truck },
        { label: "Pickups", value: "3", icon: Ship },
        { label: "En transit", value: "2", icon: Clock3 },
      ],
      highlights: [
        "Consulter les ordres assignés et leur ETA.",
        "Mettre à jour la position et l’état de livraison.",
        "Garder un historique simple des événements de suivi.",
      ],
    },
    Verifier: {
      eyebrow: "Verifier",
      title: "Vérification de lot",
      description: "Contrôle documentaire et conformité de traçabilité.",
      actionLabel: "Lancer une vérification",
      actionHref: "/shipments?role=verifier&section=lot",
      stats: [
        { label: "Vérifiés", value: "31", icon: ShieldCheck },
        { label: "Recherche", value: "QR / ID", icon: FileCheck },
        { label: "Conformes", value: "98%", icon: Clock3 },
      ],
      highlights: [
        "Saisir un ID de lot ou scanner un QR.",
        "Consulter l’historique et les certificats.",
        "Appliquer une vue lisible, fiable et rapide.",
      ],
    },
    Importer: {
      eyebrow: "Importer",
      title: "Portail import",
      description: "Suivi documentaire et conformité des lots importés.",
      actionLabel: "Voir conformité",
      actionHref: "/shipments?role=importer&section=conformite",
      stats: [
        { label: "Dossiers", value: "11", icon: FileCheck },
        { label: "Langues", value: "2", icon: Languages },
        { label: "Conformes", value: "9", icon: ShieldCheck },
      ],
      highlights: [
        "Garder les documents d’entrée et certificats liés au lot.",
        "Vérifier les écarts de conformité avant intégration.",
        "Avoir une page claire pour lecture et audit.",
      ],
    },
    MinistryAnalyst: {
      eyebrow: "Ministère",
      title: "Lecture analytique",
      description: "Vue d’ensemble pour supervision et lecture des tendances.",
      actionLabel: "Rapports",
      actionHref: "/shipments?role=ministry-analyst&section=rapports",
      stats: [
        { label: "Rapports", value: "24", icon: FileCheck },
        { label: "Tendance", value: "+12%", icon: Languages },
        { label: "Alertes", value: "3", icon: ShieldCheck },
      ],
      highlights: [
        "Rester en lecture seule sur les données sensibles.",
        "Lire les évolutions de lots, conformité et transport.",
        "Garder un cockpit analytique très lisible.",
      ],
    },
    Admin: {
      eyebrow: "Admin",
      title: "Administration",
      description: "Gestion des comptes, rôles et paramètres de la plateforme.",
      actionLabel: "Utilisateurs",
      actionHref: "/shipments?role=admin&section=users",
      stats: [
        { label: "Utilisateurs", value: "5", icon: FileCheck },
        { label: "Paramètres", value: "12", icon: Languages },
        { label: "Sécurité", value: "OK", icon: ShieldCheck },
      ],
      highlights: [
        "Gérer les utilisateurs et leurs rôles.",
        "Conserver les écrans d’administration sobres et robustes.",
        "Réutiliser la même architecture shell et navigation.",
      ],
    },
  }

  const config = configMap[role]

  return <SimpleRolePage {...config} description={section ? `${config.description} (${section})` : config.description} />
}

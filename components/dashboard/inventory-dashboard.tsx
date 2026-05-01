"use client"

import { BadgeCheck, MapPinned, Scale, Sprout } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { AddLotDialog } from "@/components/dialogs/add-lot-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/context/useUser"
import { useCooperativeStore } from "@/store/cooperative"
import { useLotsStore } from "@/store/lots"

export function InventoryDashboard() {
  const { user, activeRole } = useUser()
  const searchParams = useSearchParams()
  const allLots = useLotsStore((state) => state.lots)
  const groups = useCooperativeStore((state) => state.groups)
  const section = searchParams.get("section")

  const farmerLots = useMemo(() => {
    const farmerId = user?.userId
    if (!farmerId) return []
    return allLots.filter((lot) => lot.farmerId === farmerId)
  }, [allLots, user?.userId])

  if (activeRole === "CoopManager") {
    return (
      <CooperativeDashboard lots={allLots} groups={groups} section={section} />
    )
  }

  return (
    <FarmerDashboard
      lots={farmerLots}
      userName={user?.nomAffiche ?? "Koffi"}
      section={section}
    />
  )
}

function FarmerDashboard({
  lots,
  userName,
  section,
}: {
  lots: ReturnType<typeof useLotsStore.getState>["lots"]
  userName: string
  section: string | null
}) {
  const totalKg = lots.reduce((sum, lot) => sum + lot.poidsKg, 0)
  const activeLots = lots.filter((lot) => lot.statut !== "exported")
  const pendingLots = lots.filter((lot) => lot.statut === "pending").length
  const isCreatingLot = section === "new"

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Agriculteur"
        title={`Bonjour ${userName}`}
        description="Vue web de vos parcelles, lots et confirmations de traçabilité."
        actionLabel="Ajouter un lot"
        actionHref="/inventory?role=agriculteur&section=new"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lots enregistrés"
          value={String(lots.length)}
          note="Historique persistant"
          icon={Sprout}
        />
        <StatCard
          label="Lots actifs"
          value={String(activeLots.length)}
          note="À suivre dans la chaîne"
          icon={BadgeCheck}
        />
        <StatCard
          label="Poids total"
          value={`${totalKg.toLocaleString()} kg`}
          note="Agrégé depuis vos lots"
          icon={Scale}
          tone="dark"
        />
        <StatCard
          label="En attente"
          value={String(pendingLots)}
          note="Brouillons / synchronisation"
          icon={MapPinned}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              {isCreatingLot ? "Créer un lot" : "Lots récents"}
            </CardTitle>
            <AddLotDialog />
          </CardHeader>
          <CardContent className="grid gap-3">
            {isCreatingLot ? (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Ouvre le formulaire avec le bouton “Ajouter un lot” pour
                enregistrer une nouvelle récolte.
              </div>
            ) : (
              lots.slice(0, 4).map((lot) => (
                <div
                  key={lot.lotId}
                  className="flex items-center justify-between rounded-2xl border bg-muted/30 p-4"
                >
                  <div>
                    <p className="font-medium">{lot.espece}</p>
                    <p className="text-sm text-muted-foreground">
                      {lot.region} · {lot.poidsKg} kg
                    </p>
                  </div>
                  <Badge
                    variant={lot.statut === "draft" ? "outline" : "secondary"}
                  >
                    {lot.statut}
                  </Badge>
                </div>
              ))
            )}
            {!lots.length && !isCreatingLot && (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Aucun lot encore. Commencez par créer votre premier lot.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-foreground text-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-background">Flux rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-background/80">
              Ce tableau de bord reprend la logique mobile, mais en version web
              plus lisible.
            </p>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-background/10 p-4">
                Enregistrer un lot depuis la parcelle
              </div>
              <div className="rounded-2xl bg-background/10 p-4">
                Vérifier les photos et le GPS
              </div>
              <div className="rounded-2xl bg-background/10 p-4">
                Suivre la synchronisation et l'état du lot
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CooperativeDashboard({
  lots,
  groups,
  section,
}: {
  lots: ReturnType<typeof useLotsStore.getState>["lots"]
  groups: ReturnType<typeof useCooperativeStore.getState>["groups"]
  section: string | null
}) {
  const isLotsSection = section === "lots"

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoopManager"
        title="Tableau de bord Coopérative"
        description="Vue web de l’inventaire, des lots groupés et du suivi des flux."
        actionLabel="Gestion lots"
        actionHref="/inventory?role=coop-manager&section=lots"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lots totaux"
          value={String(lots.length)}
          icon={Sprout}
        />
        <StatCard
          label="Groupements"
          value={String(groups.length)}
          icon={BadgeCheck}
        />
        <StatCard
          label="Poids agrégé"
          value={`${lots.reduce((sum, lot) => sum + lot.poidsKg, 0).toLocaleString()} kg`}
          icon={Scale}
          tone="dark"
        />
        <StatCard
          label="Alertes"
          value={String(
            lots.filter((lot) => lot.syncStatus === "error").length
          )}
          icon={MapPinned}
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="grid gap-3 p-6">
          {isLotsSection ? (
            groups.slice(0, 4).map((group) => (
              <div
                key={group.groupId}
                className="flex flex-col gap-2 rounded-2xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{group.coopName}</p>
                  <p className="text-sm text-muted-foreground">
                    {group.lotIds.length} lots ·{" "}
                    {group.totalWeight.toLocaleString()} kg
                  </p>
                </div>
                <Badge variant="secondary">Manager {group.managerId}</Badge>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Passe sur “Gestion lots” dans le menu pour afficher les
              groupements et leurs agrégats.
            </div>
          )}
          {!groups.length && !isLotsSection && (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Aucun groupement coopératif pour le moment.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Plus } from "lucide-react"

import { useLotsStore } from "@/store/lots"
import { useLotActionsStore } from "@/store/lot-actions"
import { useCooperativeStore } from "@/store/cooperative"
import { useUser } from "@/context/useUser"
import { useLots } from "@/hooks/useLots"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { TransferLotDialog } from "@/components/traceability/transfer-lot-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import type { Lot } from "@/types/types"
import { translateStatus } from "@/lib/status-helper"
import { getLotTraceabilityIds, getSourceLotIds } from "@/lib/lot-lineage"
import { useTraceability } from "@/hooks/useTraceability"

const averageCoordinates = (lots: Lot[]) => {
  if (lots.length === 0) {
    return { latitude: 0, longitude: 0 }
  }

  const total = lots.reduce(
    (acc, lot) => ({
      latitude: acc.latitude + lot.gps.latitude,
      longitude: acc.longitude + lot.gps.longitude,
    }),
    { latitude: 0, longitude: 0 }
  )

  return {
    latitude: total.latitude / lots.length,
    longitude: total.longitude / lots.length,
  }
}

export default function GestionLotsPage() {
  const { user } = useUser()
  const { addLot, getLotById } = useLotsStore()
  const { serverLots, loadLots, isLoading, regroupLots, isRegrouping } = useLots()
  const { addAction } = useLotActionsStore()
  const { createGroup, getGroupsByManager, setGroupLotId } = useCooperativeStore()
  const { createTransfer, isSubmitting: isTransferring } = useTraceability()
  const allGroups = useCooperativeStore((state) => state.groups)
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [lotDetailOpen, setLotDetailOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isGrouping, setIsGrouping] = useState(false)

  // ID blockchain de la coopérative pour filtrer ses lots
  const coopBlockchainId = user?.blockchainId || user?.userId || ""

  useEffect(() => {
    loadLots()
  }, [loadLots])

  // Les lots serveur sont déjà normalisés (lotId = lotHash) par getLots()
  const allLots = useMemo(() => {
    return serverLots
  }, [serverLots])

  const groupedLotIds = useMemo(
    () => new Set(allGroups.flatMap((group: any) => group.lotIds as string[])),
    [allGroups]
  )
  const coopLots = useMemo(
    () => allLots.filter((lot: any) => {
      const lotId = lot.lotId || lot.lotHash || lot.id
      const isNotGroup = !lot.isGroup
      const isNotGrouped = !groupedLotIds.has(lotId)

      // Correspondance par coopId blockchain (format COOPERATIVE-xxx)
      const matchesCoopId = coopBlockchainId && lot.coopId === coopBlockchainId
      // Correspondance par coopName (store local)
      const coopName = lot.coopName || lot.coop_name
      const matchesCoopName = coopName && (coopName === user?.nomAffiche || coopName === user?.orgName)

      // Debug
      if (process.env.NODE_ENV === 'development') {
        if (!matchesCoopId && !matchesCoopName) {
          // Pas de match silencieux
        }
      }

      // Si aucun ID coop défini, afficher tous les lots (mode développement)
      if (!coopBlockchainId) return isNotGroup && isNotGrouped

      return (matchesCoopId || matchesCoopName) && isNotGroup && isNotGrouped
    }),
    [groupedLotIds, allLots, user, coopBlockchainId]
  )
  const selectedLot = selectedLotId
    ? allLots.find((lot: any) => (lot.lotId || lot.lotHash || lot.id) === selectedLotId) ?? null
    : null
  const groups = user ? getGroupsByManager(user.userId) : []

  const handleCreateGroup = async () => {
    if (!user || selectedLots.length === 0 || !newGroupName) return

    const sourceLots = allLots.filter((lot: any) => selectedLots.includes(lot.lotId || lot.id))
    if (sourceLots.length === 0) return

    const alreadyGrouped = sourceLots.filter((lot: any) => groupedLotIds.has(lot.lotId || lot.id))
    if (alreadyGrouped.length > 0) {
      setStatusMessage(`Ce lot a déjà été regroupé: ${alreadyGrouped[0].lotId || alreadyGrouped[0].id}`)
      return
    }

    setIsGrouping(true)
    const totalWeight = sourceLots.reduce((sum: number, lot: any) => sum + (lot.poidsKg || lot.poids_kg || 0), 0)
    const sourceLotIds: string[] = sourceLots.map((lot: any) => (lot.lotId || lot.id) as string)
    const uniquePhotoUrls: string[] = Array.from(new Set(sourceLots.flatMap((lot: any) => (lot.photoUrls || []) as string[])))
    const uniquePhotoHashes: string[] = Array.from(new Set(sourceLots.flatMap((lot: any) => (lot.photoHashes || []) as string[])))
    const firstLot = sourceLots[0] as any

    // Appel blockchain via le hook (avec invalidation de cache automatique)
    const bundleHash = `BUNDLE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    let blockchainSuccess = false
    try {
      await regroupLots({
        bundleHash,
        lotHashes: sourceLotIds,
        coopId: coopBlockchainId,
      })
      blockchainSuccess = true
    } catch (e) {
      console.warn("[Groupement] Blockchain regroup call failed, creating locally only:", e)
    }

    // Calculer le GPS moyen (robuste: gps peut être tableau ou objet)
    const getCoords = (lot: any) => {
      if (!lot.gps) return { latitude: 0, longitude: 0 }
      if (Array.isArray(lot.gps) && lot.gps.length > 0) return lot.gps[0]
      return lot.gps
    }
    const gpsCoords = sourceLots.map(getCoords)
    const groupBase = {
      latitude: gpsCoords.reduce((s: number, g: any) => s + (g.latitude || 0), 0) / (gpsCoords.length || 1),
      longitude: gpsCoords.reduce((s: number, g: any) => s + (g.longitude || 0), 0) / (gpsCoords.length || 1),
    }

    const groupRecord = createGroup(newGroupName, user.userId, sourceLotIds, totalWeight)

    const groupLot = addLot({
      farmerId: user.userId,
      photoUrls: uniquePhotoUrls,
      photoHashes: uniquePhotoHashes,
      gps: groupBase,
      region: firstLot.region || firstLot.espece || "—",
      poidsKg: totalWeight,
      espece: firstLot.espece || "—",
      dateCollecte: Date.now(),
      coopName: newGroupName,
      statut: "transferred",
      syncStatus: blockchainSuccess ? "synced" : "pending",
      createdBy: user.userId,
      isGroup: true,
      groupId: groupRecord.groupId,
      groupName: newGroupName,
      sourceLotIds,
    })

    addAction({
      lotId: groupLot.lotId,
      actor: "CoopManager",
      actorName: user.nomAffiche,
      actorId: user.userId,
      action: "grouped",
      phase: "regroupement",
      status: "transferred",
      description: `Groupement ${newGroupName} créé à partir de ${sourceLotIds.length} lots.`,
      metadata: {
        groupId: groupRecord.groupId,
        groupName: newGroupName,
        sourceLots: sourceLotIds,
        sourceLotCount: sourceLotIds.length,
        totalWeight,
        bundleHash,
        blockchainConfirmed: blockchainSuccess,
      },
    })

    getSourceLotIds(groupLot).forEach((sourceLotId) => {
      addAction({
        lotId: sourceLotId,
        actor: "CoopManager",
        actorName: user.nomAffiche,
        actorId: user.userId,
        action: "grouped",
        phase: "regroupement",
        status: "transferred",
        description: `Lot intégré au groupement ${newGroupName}.`,
        metadata: {
          groupId: groupRecord.groupId,
          groupName: newGroupName,
          groupLotId: groupLot.lotId,
          sourceLotId,
          sourceLotIds,
          sourceLotCount: sourceLotIds.length,
          totalWeight,
        },
      })
    })

    setGroupLotId(groupRecord.groupId, groupLot.lotId)
    setSelectedLots([])
    setNewGroupName("")
    setOpen(false)
    setSelectedLotId(groupLot.lotId)
    setLotDetailOpen(true)
    setIsGrouping(false)
    setStatusMessage(
      blockchainSuccess
        ? `✅ Groupement "${newGroupName}" créé et enregistré sur la blockchain (${bundleHash}).`
        : `⚠️ Groupement "${newGroupName}" créé localement. L'enregistrement blockchain a échoué — il sera retentera automatiquement.`
    )
  }

  const openLot = (lotId: string) => {
    // Chercher d'abord dans allLots (lots blockchain + locaux normalisés)
    const lotFromAll = allLots.find((l: any) => (l.lotId || l.lotHash || l.id) === lotId)
    if (lotFromAll) {
      setSelectedLotId(lotId)
      setLotDetailOpen(true)
      return
    }
    // Fallback: chercher dans le store local
    const lot = getLotById(lotId)
    if (!lot) {
      setStatusMessage(`Lot ${lotId} introuvable — il se peut qu'il n'ait pas encore été synchronisé.`)
      return
    }
    setSelectedLotId(lot.lotId)
    setLotDetailOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Lots</h1>
          <p className="mt-1 text-muted-foreground">
            Regroupez les lots de la coopérative et suivez le lot maître comme un lot unique.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/cooperative" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Créer un Groupement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Groupement</DialogTitle>
              <DialogDescription>
                Le groupement sera matérialisé comme un lot maître pour la suite de la chaîne.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Nom du Groupement</FieldLabel>
                  <Input
                    placeholder="ex: Groupement Nord"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </Field>
              </FieldGroup>

              <div className="space-y-2">
                <p className="text-sm font-medium">Sélectionner les lots :</p>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {coopLots.map((lot) => (
                    <label
                      key={lot.lotId}
                      className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLots.includes(lot.lotId)}
                        disabled={groupedLotIds.has(lot.lotId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLots([...selectedLots, lot.lotId])
                          } else {
                            setSelectedLots(selectedLots.filter((id) => id !== lot.lotId))
                          }
                        }}
                      />
                      <span className="text-sm">
                        {lot.lotId} - {lot.poidsKg} kg
                      </span>
                    </label>
                  ))}
                </div>
                {coopLots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun lot disponible pour un nouveau groupement.
                  </p>
                ) : null}
              </div>

              <Button
                onClick={handleCreateGroup}
                disabled={!newGroupName || selectedLots.length === 0 || isGrouping}
                className="w-full"
              >
                {isGrouping ? "Enregistrement en cours..." : "Créer le Groupement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {statusMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lots Disponibles ({coopLots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : coopLots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-semibold">ID Lot</th>
                    <th className="px-4 py-3 text-left font-semibold">Producteur</th>
                    <th className="px-4 py-3 text-left font-semibold">Poids</th>
                    <th className="px-4 py-3 text-left font-semibold">Région</th>
                    <th className="px-4 py-3 text-left font-semibold">Statut</th>
                    <th className="px-4 py-3 text-left font-semibold">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {coopLots.map((lot) => (
                    <tr
                      key={lot.lotId || lot.id}
                      className="cursor-pointer border-b hover:bg-muted/50"
                      onClick={() => {
                        setSelectedLotId(lot.lotId || lot.id)
                        setLotDetailOpen(true)
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{(lot as any).lotId || (lot as any).lotHash || (lot as any).id}</td>
                      <td className="px-4 py-3">{(lot as any).farmerId || (lot as any).coopName || (lot as any).coop_name || "—"}</td>
                      <td className="px-4 py-3">{(lot as any).poidsKg || (lot as any).poids_kg || "0"} kg</td>
                      <td className="px-4 py-3">{(lot as any).region || (lot as any).espece || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{translateStatus(lot.statut)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          Voir
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">Aucun lot disponible</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Groupements Créés ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => {
                const groupLot = group.groupLotId ? getLotById(group.groupLotId) : undefined

                return (
                  <div key={group.groupId} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{group.coopName}</p>
                          <Badge variant="secondary">{group.lotIds.length} lots</Badge>
                          <Badge variant="outline">{group.totalWeight} kg</Badge>
                          {groupLot ? <Badge>{translateStatus(groupLot.statut)}</Badge> : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Le lot maître suit ensuite le même parcours que n’importe quel lot de la
                          chaîne.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.lotIds.map((lotId) => (
                            <Button
                              key={lotId}
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-full border px-3 text-xs"
                              onClick={() => openLot(lotId)}
                            >
                              {lotId}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        {groupLot ? (
                          <>
                            <Button onClick={() => openLot(groupLot.lotId)} variant="outline">
                              Ouvrir le groupement
                            </Button>
                            <TransferLotDialog
                              lotHashes={getLotTraceabilityIds(groupLot)}
                              isSubmitting={isTransferring}
                              onSubmit={(payload, onSuccess) => {
                                createTransfer(payload)
                                  .then(() => {
                                    onSuccess()
                                    setStatusMessage(`✅ Groupement "${group.coopName}" transféré avec succès.`)
                                  })
                                  .catch((e) => setStatusMessage(`❌ Erreur: ${e.message}`))
                              }}
                            />
                          </>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(group.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">Aucun groupement créé</p>
          )}
        </CardContent>
      </Card>

      <LotDetailModal
        lot={(selectedLotId ? allLots.find((l: any) => (l.lotId || l.lotHash || l.id) === selectedLotId) ?? getLotById(selectedLotId) ?? null : null) as any}
        open={lotDetailOpen}
        onOpenChange={setLotDetailOpen}
      />
    </div>
  )
}

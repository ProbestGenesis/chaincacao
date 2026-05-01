"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Plus } from "lucide-react"

import { useLotsStore } from "@/store/lots"
import { useLotActionsStore } from "@/store/lot-actions"
import { useCooperativeStore } from "@/store/cooperative"
import { useUser } from "@/context/useUser"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
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
import { getSourceLotIds } from "@/lib/lot-lineage"

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
  const { lots, addLot, getLotById } = useLotsStore()
  const { addAction } = useLotActionsStore()
  const { createGroup, getGroupsByManager, setGroupLotId } = useCooperativeStore()
  const allGroups = useCooperativeStore((state) => state.groups)
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [lotDetailOpen, setLotDetailOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const groupedLotIds = useMemo(
    () => new Set(allGroups.flatMap((group) => group.lotIds)),
    [allGroups]
  )
  const coopLots = useMemo(
    () => lots.filter((lot) => lot.coopName && !lot.isGroup && !groupedLotIds.has(lot.lotId)),
    [groupedLotIds, lots]
  )
  const groups = user ? getGroupsByManager(user.userId) : []

  const handleCreateGroup = () => {
    if (!user || selectedLots.length === 0 || !newGroupName) return

    const sourceLots = lots.filter((lot) => selectedLots.includes(lot.lotId))
    if (sourceLots.length === 0) return

    const alreadyGrouped = sourceLots.filter((lot) => groupedLotIds.has(lot.lotId))
    if (alreadyGrouped.length > 0) {
      setStatusMessage(`Ce lot a déjà été regroupé: ${alreadyGrouped[0].lotId}`)
      return
    }

    const totalWeight = sourceLots.reduce((sum, lot) => sum + lot.poidsKg, 0)
    const groupBase = averageCoordinates(sourceLots)
    const sourceLotIds = sourceLots.map((lot) => lot.lotId)
    const uniquePhotoUrls = Array.from(new Set(sourceLots.flatMap((lot) => lot.photoUrls)))
    const uniquePhotoHashes = Array.from(new Set(sourceLots.flatMap((lot) => lot.photoHashes)))
    const firstLot = sourceLots[0]

    const groupRecord = createGroup(newGroupName, user.userId, sourceLotIds, totalWeight)

    const groupLot = addLot({
      farmerId: user.userId,
      photoUrls: uniquePhotoUrls,
      photoHashes: uniquePhotoHashes,
      gps: groupBase,
      region: firstLot.region,
      poidsKg: totalWeight,
      espece: firstLot.espece,
      dateCollecte: Date.now(),
      coopName: newGroupName,
      statut: "transferred",
      syncStatus: "pending",
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
    setSelectedLot(groupLot)
    setLotDetailOpen(true)
    setStatusMessage(`Groupement ${newGroupName} créé avec succès.`)
  }

  const openLot = (lotId: string) => {
    const lot = getLotById(lotId)
    if (!lot) return
    setSelectedLot(lot)
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
                disabled={!newGroupName || selectedLots.length === 0}
                className="w-full"
              >
                Créer le Groupement
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
          {coopLots.length > 0 ? (
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
                      key={lot.lotId}
                      className="cursor-pointer border-b hover:bg-muted/50"
                      onClick={() => {
                        setSelectedLot(lot)
                        setLotDetailOpen(true)
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{lot.lotId}</td>
                      <td className="px-4 py-3">{lot.coopName}</td>
                      <td className="px-4 py-3">{lot.poidsKg} kg</td>
                      <td className="px-4 py-3">{lot.region}</td>
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
                          <Button onClick={() => openLot(groupLot.lotId)} variant="outline">
                            Ouvrir le groupement
                          </Button>
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

      <LotDetailModal lot={selectedLot} open={lotDetailOpen} onOpenChange={setLotDetailOpen} />
    </div>
  )
}

"use client"

import { useLotsStore } from "@/store/lots"
import { useCooperativeStore } from "@/store/cooperative"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function GestionLotsPage() {
  const { user } = useUser()
  const { lots } = useLotsStore()
  const { createGroup, getGroupsByManager } = useCooperativeStore()
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState("")
  const [open, setOpen] = useState(false)

  const coopLots = lots.filter((lot) => lot.coopName)
  const groups = user ? getGroupsByManager(user.userId) : []

  const handleCreateGroup = () => {
    if (!user || selectedLots.length === 0 || !newGroupName) return

    const groupWeight = lots
      .filter((l) => selectedLots.includes(l.lotId))
      .reduce((sum, l) => sum + l.poidsKg, 0)

    createGroup(newGroupName, user.userId, selectedLots, groupWeight)
    setSelectedLots([])
    setNewGroupName("")
    setOpen(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Lots</h1>
          <p className="text-muted-foreground mt-1">Agrégez et groupez les lots coopératifs</p>
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
              <DialogDescription>Sélectionnez les lots à regrouper</DialogDescription>
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
                <p className="text-sm font-medium">Sélectionner les lots:</p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {coopLots.map((lot) => (
                    <label key={lot.lotId} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={selectedLots.includes(lot.lotId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLots([...selectedLots, lot.lotId])
                          } else {
                            setSelectedLots(selectedLots.filter((id) => id !== lot.lotId))
                          }
                        }}
                      />
                      <span className="text-sm">
                        {lot.lotId} - {lot.poidsKg}kg
                      </span>
                    </label>
                  ))}
                </div>
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

      {/* Lots Table */}
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
                    <th className="text-left py-3 px-4 font-semibold">ID Lot</th>
                    <th className="text-left py-3 px-4 font-semibold">Producteur</th>
                    <th className="text-left py-3 px-4 font-semibold">Poids</th>
                    <th className="text-left py-3 px-4 font-semibold">Région</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {coopLots.map((lot) => (
                    <tr key={lot.lotId} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{lot.lotId}</td>
                      <td className="py-3 px-4">{lot.coopName}</td>
                      <td className="py-3 px-4">{lot.poidsKg} kg</td>
                      <td className="py-3 px-4">{lot.region}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{lot.statut}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun lot disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Groupements Créés ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.groupId} className="border rounded p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{group.coopName}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.lotIds.length} lots • {group.totalWeight} kg
                      </p>
                    </div>
                    <Badge>{group.totalWeight} kg</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Aucun groupement créé</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

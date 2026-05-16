"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, ShieldCheck, UserPlus, ArrowRightLeft, Search, FileText, LayoutDashboard } from "lucide-react"
import { useActors } from "@/hooks/useActors"
import { useTraceability } from "@/hooks/useTraceability"
import { useOwnedLots } from "@/hooks/useLots"
import { useUser } from "@/context/useUser"
import { ActorsTable } from "@/components/actors/actors-table"
import { RegisterProducerDialog } from "@/components/actors/register-producer-dialog"
import { RegisterAgentDialog } from "@/components/actors/register-agent-dialog"
import { AuditQueryPanel } from "@/components/traceability/audit-query-panel"
import { TransferLotDialog } from "@/components/traceability/transfer-lot-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { CoopReportsTab } from "./coop-reports-tab"
import { normalizeRole } from "@/lib/navigation/role-config"
import type { RegisterAgentPayload, RegisterProducerPayload } from "@/types/api-actors"
import type { TransferPayload } from "@/types/api-traceability"

/**
 * Rôles qu'une Coopérative peut créer pour ses agents internes.
 * Elle ne peut valider que ses PRODUCTEURS (règle API).
 */
const COOP_AGENT_ROLES = [
  { value: "PRODUCTEUR" as const, label: "Producteur / Délégué terrain" },
]

export function CoopManagement() {
  const { user } = useUser()
  const {
    users,
    pendingUsers,
    isLoading: isLoadingActors,
    isSubmitting: isSubmittingActor,
    loadUsers,
    loadPendingRegistrations,
    validateOnBlockchain,
    addProducer,
    addAgent,
  } = useActors()

  const { createTransfer, isSubmitting: isSubmittingTransfer } = useTraceability()
  const { data: lots = [], isLoading: isLoadingLots } = useOwnedLots(user?.blockchainId || "")
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("reports")
  const [searchFarmerId, setSearchFarmerId] = useState("")

  useEffect(() => {
    loadUsers()
    loadPendingRegistrations()
  }, [loadUsers, loadPendingRegistrations])

  const isLoading = isLoadingActors || isLoadingLots

  const producers = users.filter((u) => normalizeRole(u.role) === "Agriculteur")
  const delegates = users.filter((u) => normalizeRole(u.role) !== "Agriculteur")
  const pendingCount = pendingUsers.length
  const validatedCount = producers.filter((u) => u.blockchain_validated).length

  // Filtrer les lots de la coopérative qui ne sont pas encore transférés (inclut les groupements)
  const availableLots = lots.filter((l: any) => 
    l.statut === "pending" || 
    l.statut === "verified" || 
    l.statut === "transferred" ||
    l.statut === "transformed"
  )

  const handleTransfer = async (data: TransferPayload, onSuccess: () => void) => {
    try {
      await createTransfer(data)
      setSelectedLots([])
      onSuccess()
    } catch (error) {
      console.error("Transfer error:", error)
    }
  }

  const toggleLot = (hash: string) => {
    setSelectedLots(prev => 
      prev.includes(hash) ? prev.filter(h => h !== hash) : [...prev, hash]
    )
  }

  const handleAddProducer = async (data: RegisterProducerPayload, onSuccess: () => void) => {
    try {
      await addProducer(data)
      onSuccess()
    } catch (error) {
      console.error("Add producer error:", error)
    }
  }

  const handleAddAgent = async (data: RegisterAgentPayload, onSuccess: () => void) => {
    try {
      await addAgent(data)
      onSuccess()
    } catch (error) {
      console.error("Add agent error:", error)
    }
  }

  const handleViewLots = (userId: string) => {
    setSearchFarmerId(userId)
    setActiveTab("audit")
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestion des Membres
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inscrivez vos producteurs et délégués, validez leurs comptes sur la Blockchain.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RegisterProducerDialog
            isSubmitting={isSubmittingActor}
            onSubmit={handleAddProducer}
          />
          <RegisterAgentDialog
            availableRoles={COOP_AGENT_ROLES}
            isSubmitting={isSubmittingActor}
            onSubmit={handleAddAgent}
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
            <Users className="size-4 text-muted-foreground" />
            <CardDescription>Producteurs membres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{producers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-500" />
            <CardDescription>Validés Blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{validatedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
            <UserCheck className="size-4 text-amber-500 dark:text-amber-400" />
            <CardDescription>En attente de validation</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{pendingCount}</div>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                À valider
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports" className="gap-2">
            <LayoutDashboard className="size-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="producers" className="gap-2">
            <Users className="size-4" />
            Producteurs
            {pendingCount > 0 && (
              <Badge className="ml-1 h-5 rounded-full px-1.5 text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <UserCheck className="size-4" />
            À valider
          </TabsTrigger>
          <TabsTrigger value="lots" className="gap-2">
            <ArrowRightLeft className="size-4" />
            Lots à transférer
            {availableLots.length > 0 && (
              <Badge variant="outline" className="ml-1 h-5 rounded-full px-1.5 text-[10px]">
                {availableLots.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delegates" className="gap-2">
            <UserPlus className="size-4" />
            Agents / Délégués
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Search className="size-4" />
            Audit Lots
          </TabsTrigger>
        </TabsList>
 
        {/* Rapports / Vue d'ensemble */}
        <TabsContent value="reports" className="mt-4">
          <CoopReportsTab />
        </TabsContent>
 
        {/* Lots à transférer */}
        <TabsContent value="lots" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Lots prêts pour l'export</CardTitle>
                <CardDescription>Sélectionnez les lots pour les transférer</CardDescription>
              </div>
              <TransferLotDialog 
                lotHashes={selectedLots} 
                isSubmitting={isSubmittingTransfer} 
                onSubmit={handleTransfer} 
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Lot ID</TableHead>
                    <TableHead>Poids (kg)</TableHead>
                    <TableHead>Espèce</TableHead>
                    <TableHead>Producteur</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableLots.map((lot: any) => (
                    <TableRow key={lot.lotId}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedLots.includes(lot.lotId)} 
                          onCheckedChange={() => toggleLot(lot.lotId)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <span>{lot.lotId}</span>
                          {lot.isGroup && (
                            <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-4">
                              Groupement
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{lot.poidsKg}</TableCell>
                      <TableCell>{lot.espece}</TableCell>
                      <TableCell>{lot.farmerId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{lot.statut}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {availableLots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun lot prêt pour le transfert.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tous les producteurs */}
        <TabsContent value="producers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Producteurs membres</CardTitle>
              <CardDescription>
                Liste de tous les producteurs rattachés à votre coopérative.
                Vous pouvez valider ceux qui ne sont pas encore sur la Blockchain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={producers}
                isLoading={isLoading}
                showValidate
                showLots
                onViewLots={handleViewLots}
                isSubmitting={isSubmittingActor}
                onValidate={validateOnBlockchain}
                emptyMessage="Aucun producteur inscrit. Utilisez le bouton ci-dessus pour en ajouter un."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Producteurs non validés */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Producteurs en attente</CardTitle>
              <CardDescription>
                Ces producteurs se sont inscrits mais n'ont pas encore été validés sur la Blockchain.
                En les validant, vous les enrôlez officiellement dans la Fabric CA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={pendingUsers}
                isLoading={isLoading}
                showValidate
                showLots
                onViewLots={handleViewLots}
                isSubmitting={isSubmittingActor}
                onValidate={validateOnBlockchain}
                emptyMessage="Tous vos producteurs sont validés sur la Blockchain ✓"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents et délégués */}
        <TabsContent value="delegates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agents & Délégués</CardTitle>
              <CardDescription>
                Membres du personnel de votre coopérative (délégués terrain, agents de collecte).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={delegates}
                isLoading={isLoading}
                showValidate={false}
                emptyMessage="Aucun agent ou délégué enregistré."
              />
            </CardContent>
          </Card>
        </TabsContent>
 
        {/* Audit Avancé */}
        <TabsContent value="audit" className="mt-4">
          <AuditQueryPanel initialSearch={{ type: "farmer", value: searchFarmerId }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

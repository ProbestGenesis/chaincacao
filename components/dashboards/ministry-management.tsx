"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Users, Clock, CheckCircle2, Search, FileBarChart, LayoutDashboard } from "lucide-react"
import { useActors } from "@/hooks/useActors"
import { useTraceability, useLotEUDR } from "@/hooks/useTraceability"
import { ActorsTable } from "@/components/actors/actors-table"
import { RegisterAgentDialog } from "@/components/actors/register-agent-dialog"
import { AuditQueryPanel } from "@/components/traceability/audit-query-panel"
import { MinistryReportsTab } from "./ministry-reports-tab"
import { SelectedLotCompliance } from "@/components/exporter/selected-lot-compliance"
import { mapEUDRToComplianceProps } from "@/lib/utils/traceability-adapters"
import { normalizeRole } from "@/lib/navigation/role-config"
import type { RegisterAgentPayload } from "@/types/api-actors"
import { useState } from "react"

/** Rôles que le Ministère peut créer (tous sauf MINISTERE lui-même) */
const MINISTRY_AGENT_ROLES = [
  { value: "PRODUCTEUR" as const, label: "Producteur" },
  { value: "COOPERATIVE" as const, label: "Coopérative" },
  { value: "EXPORTATEUR" as const, label: "Exportateur" },
  { value: "TRANSFORMATEUR" as const, label: "Transformateur" },
  { value: "CERTIF" as const, label: "Organisme de Certification" },
]

export function MinistryManagement() {
  const {
    users,
    pendingUsers,
    isLoading,
    isSubmitting,
    loadUsers,
    loadPendingRegistrations,
    validateOnBlockchain,
    addAgent,
  } = useActors()

  const [selectedLotHash, setSelectedLotHash] = useState<string | null>(null)
  const { data: eudrReport, isLoading: isLoadingAudit } = useLotEUDR(selectedLotHash || "")

  useEffect(() => {
    loadUsers()
    loadPendingRegistrations()
  }, [loadUsers, loadPendingRegistrations])

  const handleViewAudit = (lotHash: string) => {
    setSelectedLotHash(lotHash)
  }

  const handleAddAgent = async (data: RegisterAgentPayload, onSuccess: () => void) => {
    try {
      await addAgent(data)
      onSuccess()
    } catch (error) {
      console.error("Add agent error:", error)
    }
  }

  const validatedCount = users.filter((u) => u.blockchain_validated).length
  const pendingCount = pendingUsers.length

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestion des Acteurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisez et validez les enregistrements de tous les acteurs de la chaîne.
          </p>
        </div>
        <RegisterAgentDialog
          availableRoles={MINISTRY_AGENT_ROLES}
          isSubmitting={isSubmitting}
          onSubmit={handleAddAgent}
        />
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports" className="gap-2">
            <LayoutDashboard className="size-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <ShieldAlert className="size-4" />
            En attente
            {pendingCount > 0 && (
              <Badge className="ml-1 h-5 rounded-full px-1.5 text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Users className="size-4" />
            Tous les acteurs
          </TabsTrigger>
          <TabsTrigger value="producers" className="gap-2">
            Producteurs
          </TabsTrigger>
          <TabsTrigger value="institutions" className="gap-2">
            Annuaire Blockchain
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Search className="size-4" />
            Audit Avancé
          </TabsTrigger>
        </TabsList>
 
        {/* Rapports / Vue d'ensemble */}
        <TabsContent value="reports" className="mt-4">
          <MinistryReportsTab />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inscriptions en attente</CardTitle>
              <CardDescription>
                Ces acteurs se sont inscrits mais n'ont pas encore été validés sur la Blockchain Fabric.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={pendingUsers}
                isLoading={isLoading}
                showValidate
                isSubmitting={isSubmitting}
                onValidate={validateOnBlockchain}
                emptyMessage="Aucune inscription en attente de validation."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tous les acteurs */}
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tous les acteurs</CardTitle>
              <CardDescription>
                Liste complète des acteurs enregistrés dans le système.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={users}
                isLoading={isLoading}
                showValidate
                isSubmitting={isSubmitting}
                onValidate={validateOnBlockchain}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Producteurs uniquement */}
        <TabsContent value="producers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Producteurs</CardTitle>
              <CardDescription>
                Agriculteurs et producteurs de cacao enregistrés.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={users.filter((u) => normalizeRole(u.role) === "Agriculteur")}
                isLoading={isLoading}
                showValidate
                isSubmitting={isSubmitting}
                onValidate={validateOnBlockchain}
                emptyMessage="Aucun producteur enregistré."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acteurs institutionnels */}
        <TabsContent value="institutions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acteurs Institutionnels</CardTitle>
              <CardDescription>
                Coopératives, exportateurs, transformateurs et organismes de certification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActorsTable
                users={users.filter((u) =>
                  ["CoopManager", "Exporter", "Transformer", "Verifier"].includes(normalizeRole(u.role))
                )}
                isLoading={isLoading}
                showValidate
                isSubmitting={isSubmitting}
                onValidate={validateOnBlockchain}
                emptyMessage="Aucun acteur institutionnel enregistré."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Avancé */}
        <TabsContent value="audit" className="mt-4">
          <AuditQueryPanel />
        </TabsContent>

      </Tabs>

      {/* Section Audit EUDR (Si un lot est sélectionné) */}
      {selectedLotHash && (
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Audit de Conformité : {selectedLotHash}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedLotHash(null)}>Fermer l'audit</Button>
          </div>
          
          {isLoadingAudit ? (
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          ) : eudrReport ? (
            <SelectedLotCompliance {...mapEUDRToComplianceProps(eudrReport)} />
          ) : (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              Erreur lors de la génération du rapport pour ce lot.
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

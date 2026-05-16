"use client"

import { useUser } from "@/context/useUser"
import { useTraceability } from "@/hooks/useTraceability"
import { usePermission } from "@/hooks/usePermission"
import type { Lot, UserRole } from "@/types/types"
import type { 
  TransferPayload, 
  TransformationPayload, 
  ShipmentPayload, 
  CertificationPayload 
} from "@/types/api-traceability"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, CheckCircle2, Truck, PackageOpen, ShieldCheck, FileCheck2, ClipboardList, ArrowRightLeft } from "lucide-react"

import { TransferRoleDialog } from "./transfer-role-dialog"
import { CreateShipmentDialog } from "@/components/traceability/create-shipment-dialog"
import { TransformationDialog } from "@/components/traceability/transformation-dialog"
import { TransferLotDialog } from "@/components/traceability/transfer-lot-dialog"
import { useState } from "react"
import { getLotTraceabilityIds } from "@/lib/lot-lineage"
import { useLotActionsStore } from "@/store/lot-actions"

interface LotActionsPanelProps {
  lot: Lot
}

type ActionTemplate = {
  label: string
  icon: typeof CheckCircle2
  action: "created" | "validated" | "received" | "transferred" | "grouped" | "transformed" | "verified" | "audited" | "exported" | "comment"
  phase: "recolte" | "transfert" | "regroupement" | "transport" | "transformation" | "controle" | "import" | "commentaire"
  status: "draft" | "pending" | "verified" | "transferred" | "transformed" | "exported"
  description: string
}

const roleActions: Partial<Record<UserRole, ActionTemplate[]>> = {
  Agriculteur: [
    {
      label: "Signer l'enregistrement de récolte",
      icon: CheckCircle2,
      action: "created",
      phase: "recolte",
      status: "draft",
      description: "Création du lot directement depuis la parcelle avec preuves visuelles.",
    },
    {
      label: "Transférer à la coopérative",
      icon: ArrowRightLeft,
      action: "transferred",
      phase: "transfert",
      status: "pending",
      description: "Initier le transfert de propriété vers votre coopérative.",
    },
  ],
  CoopManager: [
    {
      label: "Transférer le lot",
      icon: ArrowRightLeft,
      action: "transferred",
      phase: "transfert",
      status: "transferred",
      description: "Transfert de propriété vers un exportateur ou un transformateur.",
    },
    {
      label: "Créer le regroupement",
      icon: PackageOpen,
      action: "grouped",
      phase: "regroupement",
      status: "transferred",
      description: "Regroupement du lot avec conservation des lots sources.",
    },
  ],
  Transformer: [
    {
      label: "Valider la réception",
      icon: CheckCircle2,
      action: "received",
      phase: "transfert",
      status: "transferred",
      description: "Réception confirmée par l’atelier après transfert de la coopérative.",
    },
    {
      label: "Enregistrer une transformation",
      icon: PackageOpen,
      action: "transformed",
      phase: "transformation",
      status: "transformed",
      description: "Enregistrement du processus industriel et du rapport de transformation.",
    },
    {
      label: "Enregistrer un transfert",
      icon: ArrowRightLeft,
      action: "transferred",
      phase: "transfert",
      status: "transferred",
      description: "Transfert de propriété vers un exportateur après transformation.",
    },
  ],
  Exporter: [
    {
      label: "Vérifier la conformité",
      icon: ShieldCheck,
      action: "verified",
      phase: "controle",
      status: "transformed",
      description: "Contrôle EUDR et préparation documentaire pour l'export.",
    },
    {
      label: "Finaliser l'export",
      icon: Truck,
      action: "exported",
      phase: "controle",
      status: "exported",
      description: "Lot prêt pour expédition et dédouanement.",
    },
  ],
  CarrierUser: [
    {
      label: "Confirmer la prise en charge",
      icon: Truck,
      action: "received",
      phase: "transport",
      status: "transferred",
      description: "Le transporteur confirme le retrait du lot au point de collecte.",
    },
    {
      label: "Marquer livré",
      icon: CheckCircle2,
      action: "validated",
      phase: "transport",
      status: "transferred",
      description: "Le lot est marqué comme livré à l'étape suivante.",
    },
  ],
  Verifier: [
    {
      label: "Valider la conformité",
      icon: ShieldCheck,
      action: "verified",
      phase: "controle",
      status: "transferred",
      description: "Contrôle documentaire et validation de conformité.",
    },
  ],
  Importer: [
    {
      label: "Enregistrer le contrôle import",
      icon: FileCheck2,
      action: "audited",
      phase: "import",
      status: "exported",
      description: "Consultation via QR code avant achat ou dédouanement.",
    },
  ],
  MinistryAnalyst: [
    {
      label: "Archiver l'analyse",
      icon: ClipboardList,
      action: "comment",
      phase: "commentaire",
      status: "exported",
      description: "Observation analytique et lecture de la traçabilité complète.",
    },
  ],
  Admin: [
    {
      label: "Réinitialiser le lot",
      icon: ShieldCheck,
      action: "validated",
      phase: "commentaire",
      status: "draft",
      description: "Lot réinitialisé par l'administration.",
    },
  ],
}

export function LotActionsPanel({ lot }: LotActionsPanelProps) {
  const { user, activeRole } = useUser()
  const can = usePermission()
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false)
  const [transformationDialogOpen, setTransformationDialogOpen] = useState(false)
  const [transferLotDialogOpen, setTransferLotDialogOpen] = useState(false)
  const {
    createTransfer,
    createTransformation,
    createCertification,
    createShipment,
    isSubmitting
  } = useTraceability()
  const hasLotAction = useLotActionsStore((state) => state.hasLotAction)
  const traceabilityLotIds = getLotTraceabilityIds(lot)

  if (!user || !activeRole) return null

  // Normalize role to handle both frontend and backend role names
  const normalizedRole: UserRole = (() => {
    switch (activeRole) {
      case "PRODUCTEUR": return "Agriculteur"
      case "COOPERATIVE": return "CoopManager"
      case "TRANSFORMATEUR": return "Transformer"
      case "EXPORTATEUR": return "Exporter"
      case "CERTIF": return "Verifier"
      case "MINISTERE": return "MinistryAnalyst"
      default: return activeRole
    }
  })()

  const canAct = (): boolean => {
    const status = lot.statut?.toLowerCase()
    switch (normalizedRole) {
      case "Agriculteur":
        return status === "draft" || status === "pending" || status === "collecte"
      case "CoopManager":
        return status === "draft" || status === "pending" || status === "transferred" || status === "collecte" || status === "en_transit"
      case "Transformer":
        return ["transferred", "pending", "transformed", "collecte", "en_transit", "transforme", "verified"].includes(status || "")
      case "Exporter":
        return ["transformed", "transforme", "verified", "exported", "exporte"].includes(status || "")
      case "CarrierUser":
        return status === "transferred" || status === "en_transit" || status === "collecte"
      case "Verifier":
        return true
      case "Importer":
        return status === "exported" || status === "exporte"
      case "MinistryAnalyst":
      case "Admin":
        return true
      default:
        return false
    }
  }

  const getActionsForLot = (): ActionTemplate[] => {
    const customizeForGroup = (action: ActionTemplate): ActionTemplate => {
      if (!lot.isGroup) return action

      if (action.phase === "transfert") {
        return {
          ...action,
          label: "Signer le transfert du groupement",
          description: "Transfert de propriété signé pour le lot maître du groupement.",
        }
      }

      if (action.phase === "regroupement") {
        return {
          ...action,
          label: "Actualiser le groupement",
          description: "Mettre à jour les lots sources et la traçabilité du groupement.",
        }
      }

      if (action.phase === "transformation") {
        return {
          ...action,
          label: "Lancer la transformation du groupement",
        }
      }

      if (action.phase === "controle" && normalizedRole === "Exporter") {
        return {
          ...action,
          label: "Vérifier la conformité du groupement",
        }
      }

      return action
    }

    if (normalizedRole === "Transformer") {
      const transformerActions = roleActions.Transformer || []
      const status = lot.statut?.toLowerCase()
      const actions: ActionTemplate[] = []

      // 1. Réception
      if ((status === "pending" || status === "collecte" || status === "en_transit") && transformerActions[0]) {
        actions.push(transformerActions[0])
      }

      // 2. Transformation (si réceptionné)
      if (status === "transferred" && transformerActions[1]) {
        actions.push(transformerActions[1])
        // On permet aussi le transfert direct si besoin
        actions.push(transformerActions[2])
      }
      
      // 3. Transfert à l'exportateur (si transformé ou vérifié)
      if (["transformed", "transforme", "verified"].includes(status || "") && transformerActions[2]) {
        actions.push(transformerActions[2])
      }
      
      return actions.filter(Boolean).map(customizeForGroup)
    }

    return (roleActions[normalizedRole] ?? []).map(customizeForGroup)
  }

  const handleAction = async (template: ActionTemplate) => {
    try {
      switch (template.action) {
        case "received":
          await Promise.all(
            traceabilityLotIds.map((lotHash, index) => {
              const certPayload: CertificationPayload = {
                certHash: `REC-${Date.now()}-${index}`,
                refHash: lotHash,
                verificateurId: user.userId,
                statut: "RECU",
                rapportHash: `RAP-REC-${Date.now()}-${index}`,
                metadata: {
                  action: "received",
                  phase: "transfert",
                  actorRole: activeRole,
                  actorName: user.nomAffiche
                }
              }
              return createCertification(certPayload)
            })
          )
          break

        case "transferred":
          if (normalizedRole === "Transformer") {
            setTransferLotDialogOpen(true)
          } else {
            setTransferDialogOpen(true)
          }
          break
        
        case "transformed":
          setTransformationDialogOpen(true)
          break

        case "exported":
          setShipmentDialogOpen(true)
          break

        case "verified":
          await Promise.all(
            traceabilityLotIds.map((lotHash, index) => {
              const certPayload: CertificationPayload = {
                certHash: `CERT-${Date.now()}-${index}`,
                refHash: lotHash,
                verificateurId: user.userId,
                statut: "CONFORME",
                rapportHash: `RAP-${Date.now()}-${index}`,
                metadata: {
                  action: "verified",
                  phase: "controle",
                  groupLotId: lot.isGroup ? (lot as any).lotHash || lot.lotId : undefined,
                  sourceLotIds: lot.sourceLotIds ?? [],
                }
              }

              return createCertification(certPayload)
            })
          )
          break

        default:
          console.log("Action non gérée via API directe:", template.action)
      }
    } catch (error) {
      console.error("Action error:", error)
    }
  }

  const actions = getActionsForLot()

  if (!canAct() || actions.length === 0) {
    return (
      <Card className="border-dashed bg-muted/40">
        <CardContent className="pt-6 text-center">
          <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {normalizedRole} peut consulter ce lot, mais aucune action n’est disponible à ce stade.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions disponibles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          const isDone = hasLotAction(lot.lotId, action.action, action.phase)

          return (
            <Button
              key={action.label}
              onClick={() => handleAction(action)}
              variant="outline"
              className="w-full justify-start rounded-xl"
              disabled={
                isSubmitting || 
                isDone ||
                (action.action === "transferred" && !can.canCreateTransfer()) ||
                (action.action === "transformed" && !can.check("traceability:create_transformation")) ||
                (action.action === "exported" && !can.check("traceability:create_shipment")) ||
                (action.action === "verified" && !can.check("audit:create_certification"))
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {isSubmitting ? "En cours..." : isDone ? `${action.label} (Effectué)` : action.label}
            </Button>
          )
        })}
      </CardContent>
      <TransferRoleDialog
        lot={lot}
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        activeRole={activeRole}
        currentUserId={user.userId}
      />
      <CreateShipmentDialog
        lotHashes={traceabilityLotIds}
        isSubmitting={isSubmitting}
        open={shipmentDialogOpen}
        onOpenChange={setShipmentDialogOpen}
        onSubmit={async (payload, onSuccess) => {
          try {
            await createShipment(payload)
            onSuccess()
          } catch (e) {
            console.error("Shipment error:", e)
          }
        }}
      />
      <TransformationDialog
        lotHashes={traceabilityLotIds}
        open={transformationDialogOpen}
        onOpenChange={setTransformationDialogOpen}
        onSuccess={() => {
          setTransformationDialogOpen(false)
        }}
      />
      <TransferLotDialog
        lotHashes={traceabilityLotIds}
        isSubmitting={isSubmitting}
        open={transferLotDialogOpen}
        onOpenChange={setTransferLotDialogOpen}
        onSubmit={async (payload, onSuccess) => {
          try {
            await createTransfer(payload)
            onSuccess()
          } catch (e) {
            console.error("Transfer error:", e)
          }
        }}
      />
    </Card>
  )
}

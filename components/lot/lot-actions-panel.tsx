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
import { useState } from "react"

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
      label: "Lancer la transformation",
      icon: PackageOpen,
      action: "transformed",
      phase: "transformation",
      status: "transformed",
      description: "Transformation du lot avec suivi qualité et conservation de la traçabilité.",
    },
    {
      label: "Valider le contrôle qualité",
      icon: ShieldCheck,
      action: "verified",
      phase: "controle",
      status: "verified",
      description: "Contrôle qualité et conformité du lot transformé avant l’étape suivante.",
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
  const { 
    createTransfer, 
    createTransformation, 
    createShipment, 
    createCertification,
    isSubmitting 
  } = useTraceability()

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
    switch (normalizedRole) {
      case "Agriculteur":
        return lot.statut === "draft" || lot.statut === "pending"
      case "CoopManager":
        return lot.statut === "draft" || lot.statut === "pending" || lot.statut === "transferred"
      case "Transformer":
        return lot.statut === "transferred" || lot.statut === "pending" || lot.statut === "transformed"
      case "Exporter":
        return lot.statut === "transformed"
      case "CarrierUser":
        return lot.statut === "transferred"
      case "Verifier":
        return true
      case "Importer":
        return lot.statut === "exported"
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
      if (lot.statut === "pending" && transformerActions[0]) {
        return [customizeForGroup(transformerActions[0])]
      }

      if (lot.statut === "transferred" && transformerActions[1]) {
        return [customizeForGroup(transformerActions[1])]
      }

      if (lot.statut === "transformed" && transformerActions[2]) {
        return [customizeForGroup(transformerActions[2])]
      }
    }

    return (roleActions[normalizedRole] ?? []).map(customizeForGroup)
  }

  const handleAction = async (template: ActionTemplate) => {
    try {
      switch (template.action) {
        case "transferred":
          setTransferDialogOpen(true)
          break
        
        case "transformed":
          const transformPayload: TransformationPayload = {
            transformationHash: `TSF-${Date.now()}`,
            lotHashes: [lot.lotId],
            typeProcessus: "Fermentation & Séchage",
            file: new File([""], "proof.pdf", { type: "application/pdf" })
          }
          await createTransformation(transformPayload)
          break

        case "exported":
          const shipmentPayload: ShipmentPayload = {
            shipmentHash: `SHP-${Date.now()}`,
            lotHashes: [lot.lotId],
            exportateurId: user.userId,
            destination: "Europe",
            dateDepartPrevue: new Date().toISOString(),
            dateArriveePrevue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            file: new File([""], "bill_of_lading.pdf", { type: "application/pdf" })
          }
          await createShipment(shipmentPayload)
          break

        case "verified":
          const certPayload: CertificationPayload = {
            lot_hash: lot.lotId,
            certifier_id: user.userId,
            type: "EUDR_COMPLIANCE",
            ref_hash: `CERT-${Date.now()}`,
            metadata: { action: "verified", phase: "controle" }
          }
          await createCertification(certPayload)
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

          return (
            <Button
              key={action.label}
              onClick={() => handleAction(action)}
              variant="outline"
              className="w-full justify-start rounded-xl"
              disabled={
                isSubmitting || 
                (action.action === "transferred" && !can.canCreateTransfer()) ||
                (action.action === "transformed" && !can.check("traceability:create_transformation")) ||
                (action.action === "exported" && !can.check("traceability:create_shipment")) ||
                (action.action === "verified" && !can.check("audit:create_certification"))
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {isSubmitting ? "En cours..." : action.label}
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
    </Card>
  )
}

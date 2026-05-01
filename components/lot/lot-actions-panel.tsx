"use client"

import { Lot, UserRole } from "@/types/types"
import { useUser } from "@/context/useUser"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Truck, Lock } from "lucide-react"

interface LotActionsPanelProps {
  lot: Lot
}

export function LotActionsPanel({ lot }: LotActionsPanelProps) {
  const { user, activeRole } = useUser()
  const { addAction } = useLotActionsStore()
  const { updateLotStatus } = useLotsStore()

  if (!user || !activeRole) return null

  const handleAction = (
    action: string,
    newStatus: string,
    description: string
  ) => {
    // Add action to timeline
    addAction({
      lotId: lot.lotId,
      actor: activeRole,
      actorName: user.nomAffiche,
      actorId: user.userId,
      action: action as any,
      status: newStatus as any,
      description,
    })

    // Update lot status
    if (newStatus !== lot.statut) {
      updateLotStatus(lot.lotId, newStatus as any)
    }
  }

  const canAct = (): boolean => {
    switch (activeRole) {
      case "Agriculteur":
        return lot.statut === "draft" || lot.statut === "pending"
      case "CoopManager":
        return lot.statut === "pending"
      case "Transformer":
        return lot.statut === "transferred"
      case "Exporter":
        return lot.statut === "transformed"
      case "Verifier":
        return lot.statut === "pending"
      default:
        return false
    }
  }

  const getActionsForRole = (): { label: string; icon: any; action: string; status: string; description: string }[] => {
    const actionsMap: Record<UserRole, any[]> = {
      Agriculteur: [
        {
          label: "Soumettre pour agrégation",
          icon: CheckCircle2,
          action: "validated",
          status: "pending",
          description: "Lot soumis à la coopérative pour agrégation",
        },
      ],
      CoopManager: [
        {
          label: "Transférer à transformer",
          icon: Truck,
          action: "transferred",
          status: "transferred",
          description: "Lot transféré au transformateur",
        },
      ],
      Transformer: [
        {
          label: "Transformation complète",
          icon: CheckCircle2,
          action: "transformed",
          status: "transformed",
          description: "Lot transformé et prêt pour export",
        },
      ],
      Exporter: [
        {
          label: "Vérifier conformité EUDR",
          icon: CheckCircle2,
          action: "verified",
          status: "transformed",
          description: "Conformité EUDR vérifiée",
        },
        {
          label: "Exporter",
          icon: Truck,
          action: "exported",
          status: "exported",
          description: "Lot exporté avec succès",
        },
      ],
      Verifier: [
        {
          label: "Vérifier conformité",
          icon: CheckCircle2,
          action: "verified",
          status: "pending",
          description: "Lot vérifié et conforme",
        },
      ],
      CarrierUser: [],
      Importer: [],
      MinistryAnalyst: [],
      Admin: [
        {
          label: "Réinitialiser le lot",
          icon: AlertCircle,
          action: "validated",
          status: "draft",
          description: "Lot réinitialisé par administrateur",
        },
      ],
    }

    return actionsMap[activeRole] || []
  }

  const actions = getActionsForRole()

  if (!canAct() || actions.length === 0) {
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6 text-center">
          <Lock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {activeRole} ne peut pas agir sur ce lot à ce stade
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions Disponibles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Button
              key={idx}
              onClick={() =>
                handleAction(action.action, action.status, action.description)
              }
              variant="outline"
              className="w-full justify-start"
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}

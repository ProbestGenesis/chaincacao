"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, ShieldCheck, User } from "lucide-react"
import { actorTypeLabels, type ApiUser } from "@/types/api-actors"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ActorsTableProps {
  users: ApiUser[]
  isLoading: boolean
  /** Afficher le bouton de validation blockchain */
  showValidate?: boolean
  isSubmitting?: boolean
  onValidate?: (user: ApiUser) => void
  /** Afficher le bouton pour voir les lots d'un producteur */
  showLots?: boolean
  onViewLots?: (userId: string) => void
  /** Afficher le bouton d'audit EUDR */
  showAudit?: boolean
  onAudit?: (lotHash: string) => void
  emptyMessage?: string
}

function StatusBadge({ validated }: { validated: boolean }) {
  return validated ? (
    <Badge variant="default" className="gap-1 bg-emerald-600 text-white">
      <CheckCircle2 className="size-3" />
      Validé
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <Clock className="size-3" />
      En attente
    </Badge>
  )
}

export function ActorsTable({
  users,
  isLoading,
  showValidate = false,
  showAudit = false,
  showLots = false,
  isSubmitting = false,
  onValidate,
  onAudit,
  onViewLots,
  emptyMessage = "Aucun utilisateur trouvé.",
}: ActorsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <User className="size-8 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Organisation</TableHead>
          <TableHead>Statut Blockchain</TableHead>
          <TableHead>Inscrit le</TableHead>
          {(showValidate || showAudit || showLots) && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, idx) => (
          <TableRow key={user.blockchain_id || user.email || `user-${idx}`}>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {user.email || user.numero_telephone || "—"}
            </TableCell>
            <TableCell>
              {actorTypeLabels[user.role] ?? user.role}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {user.org_name}
            </TableCell>
            <TableCell>
              <StatusBadge validated={user.blockchain_validated} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {user.created_at 
                ? format(new Date(user.created_at), "d MMM yyyy", { locale: fr })
                : "—"}
            </TableCell>
            {(showValidate || showAudit || showLots) && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {showAudit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs"
                      onClick={() => onAudit?.(user.blockchain_id || `USER-${user.id}`)}
                    >
                      <ShieldCheck className="size-3.5" />
                      Audit EUDR
                    </Button>
                  )}
                  {showValidate && !user.blockchain_validated && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      disabled={isSubmitting}
                      onClick={() => onValidate?.(user)}
                    >
                      <ShieldCheck className="size-3.5" />
                      Valider
                    </Button>
                  )}
                  {showLots && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs"
                      onClick={() => onViewLots?.(user.blockchain_id || String(user.id))}
                    >
                      <Clock className="size-3.5" />
                      Voir Lots
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

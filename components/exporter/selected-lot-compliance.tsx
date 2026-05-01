"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Lot } from "@/types/types"

type TimelineEntry = {
  actionId: string
  actorName: string
  actor: string
  description: string
  phase: string
  timestamp: number
  metadata?: Record<string, unknown> | undefined
}

type ComplianceDetailProps = {
  lot: Lot
  timeline: TimelineEntry[]
  complianceScore: string
  risk: string
  eudrStatus: string
  documents: string[]
  sourceLots: string[]
  specItems: Array<{ label: string; value: string }>
  checklist: Array<{ label: string; status: string }>
  onDownloadReport?: () => void
  onShowMessage?: (message: string) => void
}

export function SelectedLotCompliance({
  lot,
  timeline,
  complianceScore,
  risk,
  eudrStatus,
  documents,
  sourceLots,
  specItems,
  checklist,
  onDownloadReport,
  onShowMessage,
}: ComplianceDetailProps) {
  const displayedDocuments = documents.length > 0 ? documents : ["rapport-eudr.pdf", "liste-pieces-export.pdf"]
  const displayedSourceLots = sourceLots.length > 0 ? sourceLots : [lot.lotId]

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <div
          className="relative overflow-hidden rounded-[1.75rem] border bg-[linear-gradient(135deg,#dbe9c7_0%,#9ec36a_35%,#53783d_100%)] p-5 text-white shadow-sm"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.16), transparent 20%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12), transparent 18%), linear-gradient(135deg, #dbe9c7 0%, #9ec36a 35%, #53783d 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="relative max-w-sm rounded-2xl bg-black/30 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Origine de la parcelle</p>
            <p className="mt-2 text-xl font-semibold">{lot.region}</p>
            <p className="text-sm text-white/80">{lot.coopName}</p>
            <p className="mt-2 text-sm text-white/75">
              Coordonnées: {lot.gps.latitude.toFixed(4)}° N, {lot.gps.longitude.toFixed(4)}° E
            </p>
          </div>
          <div className="relative mt-28 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              className="rounded-full bg-white/95 text-[#2f1713] hover:bg-white"
              onClick={() => {
                onDownloadReport?.()
                onShowMessage?.(`Rapport EUDR prêt pour ${lot.lotId}`)
              }}
            >
              Télécharger le rapport EUDR
            </Button>
          </div>
        </div>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-lg">Parcours de la chaîne d'approvisionnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length > 0 ? (
              timeline.map((entry, index) => (
                <div key={entry.actionId} className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <div className="relative">
                    <div className="absolute left-3 top-3 h-full w-px bg-border" />
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-[#2f1713]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {entry.phase}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{entry.actorName}</p>
                      <Badge variant="outline">{entry.actor}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
                    {entry.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(entry.metadata)
                          .filter(([, value]) => typeof value === "string")
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="rounded-full">
                              {String(value)}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun événement enregistré sur ce lot.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.75rem] border bg-[#2f1713] p-5 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/65">
            Score de conformité EUDR
          </p>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-6xl font-bold leading-none">{complianceScore}</p>
            <span className="pb-1 text-2xl text-white/60">/100</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${complianceScore}%` }} />
          </div>
          <p className="mt-4 text-sm text-white/75">
            Ce score dépasse les exigences minimales pour l’entrée sur le marché européen.
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Etat courant</p>
            <p className="mt-1 text-sm font-medium">
              {eudrStatus} • Risque pays {risk}
            </p>
          </div>
        </div>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-base">Intégrité des documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl bg-muted/30 px-4 py-3 text-sm"
              >
                <span>{item.label}</span>
                <Badge variant={item.status === "validé" ? "default" : "secondary"} className="rounded-full">
                  {item.status}
                </Badge>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Documents joints
              </p>
              <div className="space-y-2">
                {displayedDocuments.map((document) => (
                  <div
                    key={document}
                    className="rounded-xl border bg-background/80 px-3 py-2 text-sm"
                  >
                    {document}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Lots sources
              </p>
              <div className="flex flex-wrap gap-2">
                {displayedSourceLots.map((sourceLot) => (
                  <Badge key={sourceLot} variant="secondary" className="rounded-full">
                    {sourceLot}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-base">Spécifications du lot</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {specItems.map((spec) => (
              <div key={spec.label} className="rounded-2xl bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">{spec.label}</p>
                <p className="mt-1 text-lg font-semibold">{spec.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

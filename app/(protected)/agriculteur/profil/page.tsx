"use client"

import { useUser } from "@/context/useUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilPage() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="p-6">
        <p>Chargement...</p>
      </div>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR")
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil</h1>
          <p className="text-muted-foreground mt-1">Vos informations personnelles</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nom</p>
            <p className="text-lg font-semibold">{user.nomAffiche}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
            <p className="text-lg">{user.telephone}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <Badge variant={user.statut === "actif" ? "default" : "secondary"}>
              {user.statut === "actif" ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rôles et Autorisations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Rôles assignés</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date de création</p>
            <p className="text-lg">{formatDate(user.dateCreation)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Dernière connexion</p>
            <p className="text-lg">{formatDate(user.derniereConnexion)}</p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full">
        Modifier le profil
      </Button>
    </div>
  )
}

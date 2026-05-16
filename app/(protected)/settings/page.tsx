"use client"

import { useUser } from "@/context/useUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Lock, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  const { user, activeRole } = useUser()

  const initials = user?.nomAffiche
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez votre profil et vos préférences de compte.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Public
            </CardTitle>
            <CardDescription>Informations visibles par les autres acteurs de la chaîne.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline">Changer l'image</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet</label>
                <Input defaultValue={user?.nomAffiche} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse E-mail</label>
                <Input defaultValue={user?.email} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organisation</label>
                <Input defaultValue={user?.orgName} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle Actif</label>
                <div className="flex items-center gap-2">
                  <Badge>{activeRole}</Badge>
                </div>
              </div>
            </div>
            <Button>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>Mettez à jour votre mot de passe et sécurisez votre compte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe actuel</label>
              <Input type="password" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau mot de passe</label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                <Input type="password" />
              </div>
            </div>
            <Button variant="outline">Mettre à jour le mot de passe</Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Choisissez comment vous souhaitez être informé.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div>
                  <p className="font-medium">Notifications par E-mail</p>
                  <p className="text-xs text-muted-foreground">Recevoir des alertes sur mes lots par e-mail.</p>
                </div>
                <div className="h-6 w-11 bg-primary rounded-full relative">
                  <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div>
                  <p className="font-medium">Alertes de Conformité</p>
                  <p className="text-xs text-muted-foreground">Être prévenu en cas de problème EUDR.</p>
                </div>
                <div className="h-6 w-11 bg-primary rounded-full relative">
                  <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

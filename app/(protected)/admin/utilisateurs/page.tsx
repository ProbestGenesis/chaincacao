"use client"

import { useUsersStore } from "@/store/users"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, UserPlus, MoreHorizontal, Shield, Mail, Phone } from "lucide-react"
import { useState } from "react"

export default function AdminUtilisateursPage() {
  const { users } = useUsersStore()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(u => 
    u.nomAffiche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground mt-1">Administrez les comptes, les rôles et les permissions.</p>
          </div>
        </div>
        <Button className="rounded-xl gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Comptes Enregistrés ({users.length})</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom ou email..." 
                className="pl-9 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-4 px-4 font-semibold">Utilisateur</th>
                  <th className="text-left py-4 px-4 font-semibold">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold">Rôles</th>
                  <th className="text-left py-4 px-4 font-semibold">Statut</th>
                  <th className="text-right py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const initials = user.nomAffiche.split(" ").map(n => n[0]).join("").toUpperCase()
                  return (
                    <tr key={user.userId} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[150px]">{user.nomAffiche}</p>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">{user.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                          </div>
                          {user.telephone && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {user.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={user.statut === "actif" ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : "bg-slate-100 text-slate-700 border-none"}>
                          {user.statut || "actif"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

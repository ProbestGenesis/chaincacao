"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, MessageCircle, Phone, BookOpen } from "lucide-react"

export default function SupportPage() {
  const faqs = [
    {
      q: "Comment créer un nouveau lot ?",
      a: "Allez sur votre tableau de bord et cliquez sur 'Ajouter un Lot'. Remplissez les informations requises sur l'espèce et le poids."
    },
    {
      q: "Qu'est-ce que la conformité EUDR ?",
      a: "L'EUDR est le règlement européen contre la déforestation. ChainCacao assure la traçabilité de vos produits pour prouver qu'ils ne sont pas issus de zones déforestées."
    },
    {
      q: "Comment changer mon rôle ?",
      a: "Vous pouvez basculer entre vos rôles autorisés via le menu de profil en haut à droite."
    }
  ]

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Support & Aide</h1>
        <p className="text-muted-foreground">Besoin d'aide avec ChainCacao ? Nous sommes là pour vous.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contactez-nous
            </CardTitle>
            <CardDescription>Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sujet</label>
              <Input placeholder="De quoi avez-vous besoin ?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Décrivez votre problème en détail..." className="min-h-[120px]" />
            </div>
            <Button className="w-full">Envoyer le message</Button>
          </CardContent>
        </Card>

        {/* Support Channels */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Appelez-nous</p>
                  <p className="text-sm text-muted-foreground">+229 96 28 68 68</p>
                  <p className="text-xs text-muted-foreground">Lun - Ven, 8h - 18h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Centre de documentation</p>
                  <p className="text-sm text-muted-foreground">Guides détaillés et tutoriels vidéos.</p>
                  <Button variant="link" className="p-0 h-auto">Consulter les guides</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Questions Fréquentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <p className="font-semibold">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

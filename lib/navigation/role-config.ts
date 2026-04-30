import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  FolderTree,
  Home,
  Languages,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Truck,
  UserRound,
  Warehouse,
  ChartColumn,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { UserRole } from "@/types/types"

export type RoleNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type RoleConfig = {
  role: UserRole
  label: string
  dashboardPath: string
  description: string
  ctaLabel: string
  ctaHref: string
  items: RoleNavItem[]
  footerItems: RoleNavItem[]
}

export const roleRouteMap: Record<UserRole, string> = {
  Agriculteur: "/agriculteur",
  CoopManager: "/cooperative",
  Transformer: "/transformer",
  Exporter: "/exporter",
  CarrierUser: "/carrier",
  Verifier: "/verifier",
  Importer: "/importer",
  MinistryAnalyst: "/ministry",
  Admin: "/admin",
}

const roleConfigMap: Record<UserRole, RoleConfig> = {
  Agriculteur: {
    role: "Agriculteur",
    label: "Agriculteur",
    dashboardPath: "/agriculteur",
    description: "Suivi de récolte, lots et profil producteur",
    ctaLabel: "Ajouter un lot",
    ctaHref: "/agriculteur/nouveau-lot",
    items: [
      { title: "Accueil", href: "/agriculteur", icon: Home },
      { title: "Mes lots", href: "/agriculteur/lots", icon: PackageOpen },
      { title: "Nouveau lot", href: "/agriculteur/nouveau-lot", icon: FolderTree },
      { title: "Profil", href: "/agriculteur/profil", icon: UserRound },
    ],
    footerItems: [
      { title: "Support", href: "/support", icon: CheckCircle2 },
      { title: "Déconnexion", href: "/auth", icon: ShieldCheck },
    ],
  },
  CoopManager: {
    role: "CoopManager",
    label: "Coop Manager",
    dashboardPath: "/cooperative",
    description: "Agrégation des lots, KPIs coop et groupements",
    ctaLabel: "Créer un groupement",
    ctaHref: "/cooperative/lots",
    items: [
      { title: "Tableau de bord", href: "/cooperative", icon: Home },
      { title: "Gestion lots", href: "/cooperative/lots", icon: Warehouse },
    ],
    footerItems: [
      { title: "Rapports", href: "/cooperative/lots", icon: ChartColumn },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  Transformer: {
    role: "Transformer",
    label: "Transformer",
    dashboardPath: "/transformer",
    description: "Réception, transformation et contrôle qualité",
    ctaLabel: "Voir les lots",
    ctaHref: "/transformer/lots",
    items: [
      { title: "Accueil", href: "/transformer", icon: Home },
      { title: "Lots à traiter", href: "/transformer/lots", icon: PackageOpen },
    ],
    footerItems: [
      { title: "Qualité", href: "/transformer/lots", icon: ClipboardCheck },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  Exporter: {
    role: "Exporter",
    label: "Exporter",
    dashboardPath: "/exporter",
    description: "Conformité EUDR et préparation export",
    ctaLabel: "Vérifier EUDR",
    ctaHref: "/exporter/conformite",
    items: [
      { title: "Accueil", href: "/exporter", icon: Home },
      { title: "Conformité", href: "/exporter/conformite", icon: ShieldCheck },
    ],
    footerItems: [
      { title: "Expéditions", href: "/exporter/conformite", icon: Truck },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  CarrierUser: {
    role: "CarrierUser",
    label: "Transport",
    dashboardPath: "/carrier",
    description: "Ordres transport et suivi terrain",
    ctaLabel: "Voir les ordres",
    ctaHref: "/carrier/ordres",
    items: [
      { title: "Accueil", href: "/carrier", icon: Home },
      { title: "Ordres", href: "/carrier/ordres", icon: Truck },
    ],
    footerItems: [
      { title: "Suivi GPS", href: "/carrier/ordres", icon: MapPin },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  Verifier: {
    role: "Verifier",
    label: "Verifier",
    dashboardPath: "/verifier",
    description: "Contrôle lot, conformité et validation",
    ctaLabel: "Ouvrir une vérification",
    ctaHref: "/verifier/lot",
    items: [
      { title: "Accueil", href: "/verifier", icon: Home },
      { title: "Vérification", href: "/verifier/lot", icon: CheckCircle2 },
    ],
    footerItems: [
      { title: "Rapports", href: "/verifier/lot", icon: ChartColumn },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  Importer: {
    role: "Importer",
    label: "Importer",
    dashboardPath: "/importer",
    description: "Traçabilité import et conformité documentaire",
    ctaLabel: "Voir conformité",
    ctaHref: "/importer/conformite",
    items: [
      { title: "Accueil", href: "/importer", icon: Home },
      { title: "Conformité", href: "/importer/conformite", icon: Languages },
    ],
    footerItems: [
      { title: "Dossiers", href: "/importer/conformite", icon: FolderTree },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  MinistryAnalyst: {
    role: "MinistryAnalyst",
    label: "Ministère",
    dashboardPath: "/ministry",
    description: "Lecture analytique et supervision",
    ctaLabel: "Rapports",
    ctaHref: "/ministry/rapports",
    items: [
      { title: "Accueil", href: "/ministry", icon: Home },
      { title: "Rapports", href: "/ministry/rapports", icon: ChartColumn },
    ],
    footerItems: [
      { title: "Données", href: "/ministry/rapports", icon: FolderTree },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
  Admin: {
    role: "Admin",
    label: "Admin",
    dashboardPath: "/admin",
    description: "Administration des comptes et droits",
    ctaLabel: "Gérer les utilisateurs",
    ctaHref: "/admin/utilisateurs",
    items: [
      { title: "Accueil", href: "/admin", icon: Home },
      { title: "Utilisateurs", href: "/admin/utilisateurs", icon: Crown },
    ],
    footerItems: [
      { title: "Paramètres", href: "/admin/utilisateurs", icon: Building2 },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
}

export function getRoleConfig(role: UserRole | null) {
  return role ? roleConfigMap[role] : roleConfigMap.Agriculteur
}

export function getRoleRoute(role: UserRole | null) {
  return role ? roleRouteMap[role] : roleRouteMap.Agriculteur
}

export function roleFromSignupRoleId(roleId: string): UserRole {
  const map: Record<string, UserRole> = {
    agriculteur: "Agriculteur",
    "coop-manager": "CoopManager",
    transformer: "Transformer",
    exporter: "Exporter",
    "carrier-user": "CarrierUser",
    verifier: "Verifier",
    importer: "Importer",
    "ministry-analyst": "MinistryAnalyst",
  }

  return map[roleId] ?? "Agriculteur"
}

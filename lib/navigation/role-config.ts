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
  UserCog,
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

export const roleRouteMap: Partial<Record<UserRole, string>> = {
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

const roleConfigMap: Partial<Record<UserRole, RoleConfig>> = {
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
      { title: "Mes parcelles", href: "/agriculteur/parcelles", icon: MapPin },
      { title: "Nouveau lot", href: "/agriculteur/nouveau-lot", icon: FolderTree },
      { title: "Historique", href: "/agriculteur/historique", icon: FolderTree },
      { title: "Expéditions", href: "/agriculteur/expedition", icon: Truck },
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
      { title: "Gestion membres", href: "/cooperative/management", icon: UserCog },
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
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
    ctaLabel: "Voir les lots à traiter",
    ctaHref: "/transformer/lots",
    items: [
      { title: "Accueil", href: "/transformer", icon: Home },
      { title: "Lots à traiter", href: "/transformer/lots", icon: PackageOpen },
    ],
    footerItems: [
      { title: "Qualité", href: "/transformer", icon: ClipboardCheck },
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
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
    ],
    footerItems: [
      { title: "Expéditions", href: "/exporter", icon: Truck },
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
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
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
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
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
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
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
      { title: "Gestion acteurs", href: "/ministry/management", icon: UserCog },
      { title: "Rapports", href: "/ministry/rapports", icon: ChartColumn },
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
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
      { title: "Tous les lots", href: "/all-lots", icon: PackageOpen },
    ],
    footerItems: [
      { title: "Paramètres", href: "/admin/utilisateurs", icon: Building2 },
      { title: "Support", href: "/support", icon: CheckCircle2 },
    ],
  },
}

export function normalizeRole(role: string): UserRole {
  const upperRole = role.toUpperCase();
  switch (upperRole) {
    case "PRODUCTEUR":
    case "AGRICULTEUR": 
      return "Agriculteur"
    case "COOPERATIVE":
    case "COOPMANAGER": 
      return "CoopManager"
    case "TRANSFORMATEUR":
    case "TRANSFORMER": 
      return "Transformer"
    case "EXPORTATEUR":
    case "EXPORTER": 
      return "Exporter"
    case "CERTIF":
    case "VERIFIER": 
      return "Verifier"
    case "MINISTERE":
    case "MINISTRYANALYST": 
      return "MinistryAnalyst"
    default: 
      return role as UserRole
  }
}

export function getRoleConfig(role: UserRole | null) {
  if (!role) return roleConfigMap.Agriculteur!
  const normalized = normalizeRole(role)
  return roleConfigMap[normalized] || roleConfigMap.Agriculteur!
}

export function getRoleRoute(role: UserRole | null) {
  if (!role) return roleRouteMap.Agriculteur!
  const normalized = normalizeRole(role)
  return roleRouteMap[normalized] || roleRouteMap.Agriculteur!
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

/**
 * Service API — Acteurs & Enregistrements
 * Endpoints : /api/v1/auth/*, /api/v1/actors/*
 */

import { api } from "@/lib/api"
import type {
  ApiUser,
  RegisterActorPayload,
  ActorRegisterResponse,
  RegisterProducerPayload,
  RegisterAgentPayload,
} from "@/types/api-actors"

/**
 * GET /api/v1/auth/users
 * Ministère → tous les utilisateurs
 * Coopérative → ses membres uniquement
 */
export async function fetchUsers(): Promise<ApiUser[]> {
  return api.get<ApiUser[]>("/api/v1/auth/users")
}

/**
 * GET /api/v1/auth/pending-registrations
 * Ministère uniquement — acteurs institutionnels en attente de validation
 */
export async function fetchPendingRegistrations(): Promise<ApiUser[]> {
  return api.get<ApiUser[]>("/api/v1/auth/pending-registrations")
}

/**
 * GET /api/v1/actors/producers/pending
 * Coopérative uniquement — producteurs en attente de validation
 */
export async function fetchPendingProducers(): Promise<ApiUser[]> {
  return api.get<ApiUser[]>("/api/v1/actors/producers/pending")
}

/**
 * POST /api/v1/actors/register
 * Valide et enregistre un acteur sur la Blockchain + CA Fabric
 * - Ministère : peut valider n'importe quel acteur
 * - Coopérative : peut valider uniquement ses PRODUCTEURS
 */
export async function registerActorOnBlockchain(
  payload: RegisterActorPayload
): Promise<ActorRegisterResponse> {
  return api.post<ActorRegisterResponse>("/api/v1/actors/register", payload)
}

/**
 * POST /api/v1/auth/register-producer
 * Coopérative inscrit directement un producteur (sans email obligatoire)
 */
export async function registerProducer(
  payload: RegisterProducerPayload
): Promise<ApiUser> {
  return api.post<ApiUser>("/api/v1/auth/register-producer", payload)
}

/**
 * POST /api/v1/auth/register-agent
 * Admin d'organisation inscrit un agent/délégué
 */
export async function registerAgent(
  payload: RegisterAgentPayload
): Promise<ApiUser> {
  return api.post<ApiUser>("/api/v1/auth/register-agent", payload)
}

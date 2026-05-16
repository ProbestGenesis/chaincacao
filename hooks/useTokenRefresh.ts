/**
 * Hook pour gérer le refresh automatique des tokens JWT
 * Prévient les ruptures de session inattendues
 */

import { useEffect, useRef } from 'react'
import { useUsersStore } from '@/store/users'
import { api } from '@/lib/api'
import type { LoginResponse } from '@/types/api'

const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000 // 4 minutes avant expiry (token dure 5min par défaut)
const MIN_TIME_BETWEEN_REFRESHES = 10 * 1000 // Min 10 secondes entre chaque refresh

export function useTokenRefresh() {
  const { token, setToken } = useUsersStore()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)

  useEffect(() => {
    if (!token) return

    const attemptRefresh = async () => {
      const now = Date.now()
      // Éviter les appels trop fréquents
      if (now - lastRefreshRef.current < MIN_TIME_BETWEEN_REFRESHES) {
        return
      }

      lastRefreshRef.current = now

      try {
        const response = await api.post<LoginResponse>('/api/v1/auth/refresh', {})
        if (response.access_token) {
          setToken(response.access_token)
        }
      } catch (error) {
        // Le refresh a échoué, on va laisser le user se reconnecter
        console.error('[TokenRefresh] Failed to refresh token:', error)
        // Ne pas effacer le token ici, laisser l'utilisateur terminer son action
        // Le prochain appel API va échouer et déclencher un logout
      }
    }

    // Setup interval pour refresh périodique
    refreshIntervalRef.current = setInterval(attemptRefresh, TOKEN_REFRESH_INTERVAL)

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [token, setToken])
}

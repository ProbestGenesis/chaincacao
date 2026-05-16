import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/types';

interface UsersStore {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  getUserById: (userId: string) => User | undefined;
  getCurrentUser: () => User | null;
  setCurrentUser: (userId: string | null, role?: User['roles'][number] | null) => void;
  currentUserId: string | null;
  currentRole: User['roles'][number] | null;
  setCurrentRole: (role: User['roles'][number] | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useUsersStore = create(
  persist<UsersStore>(
    (set, get) => ({
      users: [],
      currentUserId: null,
      currentRole: null,
      token: null,

      addUser: (user: User) =>
        set((state) => ({
          users: [...state.users, user],
          currentUserId: user.userId,
          currentRole: user.roles[0] ?? null,
        })),

      updateUser: (user: User) =>
        set((state) => ({
          users: state.users.map((item) => (item.userId === user.userId ? user : item)),
        })),

      getUserById: (userId: string) => {
        const { users } = get();
        return users.find((u) => u.userId === userId);
      },

      getCurrentUser: () => {
        const { currentUserId, users } = get();
        if (!currentUserId) return null;
        return users.find((u) => u.userId === currentUserId) || null;
      },

      setCurrentUser: (userId: string | null, role = null) =>
        set((state) => {
          if (!userId) {
            return {
              currentUserId: null,
              currentRole: null,
            };
          }
          const nextUser = state.users.find((user) => user.userId === userId);
          return {
            currentUserId: userId,
            currentRole: role ?? nextUser?.roles[0] ?? state.currentRole,
          };
        }),

      setCurrentRole: (role) => set({ currentRole: role }),

      setToken: (token) => set({ token }),
    }),
    {
      name: 'usersStore',
    }
  )
);

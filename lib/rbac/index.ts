/**
 * Role-Based Access Control (RBAC)
 *
 * Roles: farmer | manager | vet | staff | admin
 * Permissions are additive — higher roles inherit lower role permissions.
 */
import type { UserRole } from '@/types/domain';

export type Permission =
  | 'farm:read'
  | 'farm:create'
  | 'farm:update'
  | 'farm:delete'
  | 'house:read'
  | 'house:create'
  | 'house:update'
  | 'house:delete'
  | 'count:read'
  | 'count:create'
  | 'count:export'
  | 'alert:read'
  | 'alert:dismiss'
  | 'team:read'
  | 'team:invite'
  | 'team:remove'
  | 'analytics:read'
  | 'analytics:export'
  | 'admin:read'
  | 'admin:manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  farmer: [
    'farm:read',
    'farm:create',
    'farm:update',
    'house:read',
    'house:create',
    'house:update',
    'count:read',
    'count:create',
    'count:export',
    'alert:read',
    'alert:dismiss',
    'analytics:read',
  ],
  manager: [
    'farm:read',
    'farm:create',
    'farm:update',
    'farm:delete',
    'house:read',
    'house:create',
    'house:update',
    'house:delete',
    'count:read',
    'count:create',
    'count:export',
    'alert:read',
    'alert:dismiss',
    'team:read',
    'team:invite',
    'analytics:read',
    'analytics:export',
  ],
  vet: ['farm:read', 'house:read', 'count:read', 'alert:read', 'analytics:read'],
  staff: [
    'farm:read',
    'house:read',
    'house:update',
    'count:read',
    'count:create',
    'alert:read',
  ],
  admin: [
    'farm:read',
    'farm:create',
    'farm:update',
    'farm:delete',
    'house:read',
    'house:create',
    'house:update',
    'house:delete',
    'count:read',
    'count:create',
    'count:export',
    'alert:read',
    'alert:dismiss',
    'team:read',
    'team:invite',
    'team:remove',
    'analytics:read',
    'analytics:export',
    'admin:read',
    'admin:manage',
  ],
};

/** Check if a role has a specific permission. */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Get all permissions for a role. */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** React hook — checks permission against the current user's role. */
import { useAuthStore } from '@/lib/stores/auth-store';

export function usePermission(permission: Permission): boolean {
  const role = useAuthStore((s) => s.user?.role ?? 'farmer');
  return hasPermission(role, permission);
}

export function useRole(): UserRole {
  return useAuthStore((s) => s.user?.role ?? 'farmer');
}

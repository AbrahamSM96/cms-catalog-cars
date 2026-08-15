import type { Access, FieldAccess, PayloadRequest } from 'payload'

type AdminUser = {
  id: string
  roles?: string[]
}

type AdminGate = (args: { req: PayloadRequest }) => boolean

/**
 * Returns true when the given user holds any of the given roles.
 *
 * @param user - The requesting user, possibly null.
 * @param roles - The roles to check for.
 */
const hasAnyRole = (user: unknown, roles: string[]): boolean =>
  (user as AdminUser | null)?.roles?.some((role) => roles.includes(role)) ?? false

/**
 * Returns true when the given user holds the admin role.
 *
 * @param user - The requesting user, possibly null.
 */
const hasAdminRole = (user: unknown): boolean => hasAnyRole(user, ['admin'])

/**
 * Grants access only to users holding the admin role. Usable for any
 * collection, field, or admin-panel access slot.
 *
 * @param args - Access control arguments.
 */
export const adminsOnly: AdminGate = (args) => hasAdminRole(args.req.user)

/**
 * Grants access to users holding the admin or editor role. Usable for the
 * create and update slots of content collections.
 *
 * @param args - Access control arguments.
 */
export const editorsAndAdmins: AdminGate = (args) =>
  hasAnyRole(args.req.user, ['admin', 'editor'])

/**
 * Grants field read access to admins and to users reading their own record.
 * Field access must return a plain boolean.
 *
 * @param args - Field access arguments.
 */
export const adminsOrSelfFieldRead: FieldAccess = (args) => {
  const { id, req } = args
  if (hasAdminRole(req.user)) return true
  if (!req.user) return false
  return String(id) === String(req.user.id)
}

/**
 * Grants full access to admins and scopes updates to the requesting user.
 *
 * @param args - Access control arguments.
 */
export const adminsOrSelf: Access = (args) => {
  const { user } = args.req
  if (hasAdminRole(user)) return true
  return { id: { equals: user?.id } }
}

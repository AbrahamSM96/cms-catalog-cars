import type { Access, PayloadRequest } from 'payload'

type AdminUser = {
  id: string
  roles?: string[]
}

type AdminGate = (args: { req: PayloadRequest }) => boolean

/**
 * Returns true when the given user holds the admin role.
 *
 * @param user - The requesting user, possibly null.
 */
const hasAdminRole = (user: unknown): boolean =>
  (user as AdminUser | null)?.roles?.includes('admin') ?? false

/**
 * Grants access only to users holding the admin role. Usable for any
 * collection, field, or admin-panel access slot.
 *
 * @param args - Access control arguments.
 */
export const adminsOnly: AdminGate = (args) => hasAdminRole(args.req.user)

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

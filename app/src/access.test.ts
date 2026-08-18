import type { Access, FieldAccess } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  adminsOnly,
  adminsOrSelf,
  adminsOrSelfFieldRead,
  editorsAndAdmins,
} from './access'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// oxlint-disable-next-line typescript/no-explicit-any
const reqWith = (user: unknown): any => ({ req: { user } })

const adminUser = { id: '1', roles: ['admin'] }
const editorUser = { id: '2', roles: ['editor'] }
const regularUser = { id: '3', roles: ['user'] }
const noRolesUser = { id: '4' }

// ---------------------------------------------------------------------------
// adminsOnly
// ---------------------------------------------------------------------------

describe('adminsOnly', () => {
  it('grants access to admin users', () => {
    expect(adminsOnly(reqWith(adminUser))).toBe(true)
  })

  it('denies access to editor users', () => {
    expect(adminsOnly(reqWith(editorUser))).toBe(false)
  })

  it('denies access to regular users', () => {
    expect(adminsOnly(reqWith(regularUser))).toBe(false)
  })

  it('denies access when user is null', () => {
    expect(adminsOnly(reqWith(null))).toBe(false)
  })

  it('denies access when user has no roles', () => {
    expect(adminsOnly(reqWith(noRolesUser))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// editorsAndAdmins
// ---------------------------------------------------------------------------

describe('editorsAndAdmins', () => {
  it('grants access to admin users', () => {
    expect(editorsAndAdmins(reqWith(adminUser))).toBe(true)
  })

  it('grants access to editor users', () => {
    expect(editorsAndAdmins(reqWith(editorUser))).toBe(true)
  })

  it('denies access to regular users', () => {
    expect(editorsAndAdmins(reqWith(regularUser))).toBe(false)
  })

  it('denies access when user is null', () => {
    expect(editorsAndAdmins(reqWith(null))).toBe(false)
  })

  it('denies access when user has no roles', () => {
    expect(editorsAndAdmins(reqWith(noRolesUser))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// adminsOrSelfFieldRead
// ---------------------------------------------------------------------------

describe('adminsOrSelfFieldRead', () => {
  const fieldAccess = adminsOrSelfFieldRead as FieldAccess

  it('grants access to admin users', () => {
    expect(fieldAccess({ id: '99', req: { user: adminUser } } as never)).toBe(
      true
    )
  })

  it('denies access when user is undefined', () => {
    expect(fieldAccess({ id: '99', req: { user: undefined } } as never)).toBe(
      false
    )
  })

  it('grants access when reading own record', () => {
    expect(fieldAccess({ id: '3', req: { user: regularUser } } as never)).toBe(
      true
    )
  })

  it('denies access when reading another user record', () => {
    expect(fieldAccess({ id: '99', req: { user: regularUser } } as never)).toBe(
      false
    )
  })

  it('compares ids as strings (numeric id vs string user id)', () => {
    expect(fieldAccess({ id: 4, req: { user: { id: '4' } } } as never)).toBe(
      true
    )
  })
})

// ---------------------------------------------------------------------------
// adminsOrSelf
// ---------------------------------------------------------------------------

describe('adminsOrSelf', () => {
  const accessFn = adminsOrSelf as Access

  it('returns true for admin users', () => {
    expect(accessFn(reqWith(adminUser))).toBe(true)
  })

  it('returns a query object for non-admin users', () => {
    const result = accessFn(reqWith(regularUser))
    expect(result).toEqual({ id: { equals: '3' } })
  })

  it('returns a query with undefined equals when user is null', () => {
    const result = accessFn(reqWith(null))
    expect(result).toEqual({ id: { equals: undefined } })
  })
})

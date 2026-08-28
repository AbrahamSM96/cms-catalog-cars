import { describe, expect, it, vi } from 'vitest'

import { ensureBrandExists } from '../collections/CarModels'

function makeHookProps(
  data: Record<string, unknown> = {},
  // oxlint-disable-next-line typescript/no-explicit-any
  findByID: ReturnType<typeof vi.fn> = vi.fn(),
  language = 'en'
  // oxlint-disable-next-line typescript/no-explicit-any
): any {
  return { data, req: { i18n: { language }, payload: { findByID } } }
}

describe('ensureBrandExists', () => {
  it('returns data unchanged when brand is null', async () => {
    const props = makeHookProps({ brand: null, name: 'Versa' })
    const result = await ensureBrandExists(props)
    expect(result).toEqual({ brand: null, name: 'Versa' })
  })

  it('returns data unchanged when brand is undefined', async () => {
    const props = makeHookProps({ name: 'Versa' })
    const result = await ensureBrandExists(props)
    expect(result).toEqual({ name: 'Versa' })
  })

  it('calls findByID when brand is a string id', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 'abc', name: 'Nissan' })
    const props = makeHookProps({ brand: 'abc', name: 'Versa' }, findByID)
    const result = await ensureBrandExists(props)
    expect(result).toEqual({ brand: 'abc', name: 'Versa' })
    expect(findByID).toHaveBeenCalledWith({
      collection: 'brands',
      depth: 0,
      id: 'abc',
    })
  })

  it('calls findByID when brand is an object with id', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 'xyz', name: 'Honda' })
    const props = makeHookProps(
      { brand: { id: 'xyz' }, name: 'Civic' },
      findByID
    )
    const result = await ensureBrandExists(props)
    expect(result).toEqual({ brand: { id: 'xyz' }, name: 'Civic' })
    expect(findByID).toHaveBeenCalledWith({
      collection: 'brands',
      depth: 0,
      id: 'xyz',
    })
  })

  it('returns data when brand object has null id', async () => {
    const findByID = vi.fn()
    const props = makeHookProps({ brand: { id: null }, name: 'X' }, findByID)
    const result = await ensureBrandExists(props)
    expect(result).toEqual({ brand: { id: null }, name: 'X' })
    expect(findByID).not.toHaveBeenCalled()
  })

  it('returns data when brand object has undefined id', async () => {
    const findByID = vi.fn()
    const props = makeHookProps({ brand: {}, name: 'X' }, findByID)
    const result = await ensureBrandExists(props)
    expect(result).toEqual({ brand: {}, name: 'X' })
    expect(findByID).not.toHaveBeenCalled()
  })

  it('throws when brand id does not exist', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('not found'))
    const props = makeHookProps({ brand: 'bad-id', name: 'X' }, findByID)
    await expect(ensureBrandExists(props)).rejects.toThrow(
      'The selected brand does not exist (id: bad-id).'
    )
  })

  it('throws with numeric id in error message', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('not found'))
    const props = makeHookProps({ brand: 99, name: 'X' }, findByID)
    await expect(ensureBrandExists(props)).rejects.toThrow(
      'The selected brand does not exist (id: 99).'
    )
  })

  it('throws the localized error in Spanish when request language is es', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('not found'))
    const props = makeHookProps({ brand: 'bad-id', name: 'X' }, findByID, 'es')
    await expect(ensureBrandExists(props)).rejects.toThrow(
      'La marca seleccionada no existe (id: bad-id).'
    )
  })

  it('falls back to English when req has no i18n', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('not found'))
    // oxlint-disable-next-line typescript/no-explicit-any
    const props: any = {
      data: { brand: 'bad-id', name: 'X' },
      req: { payload: { findByID } },
    }
    await expect(ensureBrandExists(props)).rejects.toThrow(
      'The selected brand does not exist (id: bad-id).'
    )
  })

  it('returns data (undefined) when data itself is undefined', async () => {
    // Bypass makeHookProps: its `= {}` default would swallow the undefined and
    // turn `data` into `{}`, hiding the `data?.brand` branch under test.
    // oxlint-disable-next-line typescript/no-explicit-any
    const props: any = {
      data: undefined,
      req: { payload: { findByID: vi.fn() } },
    }
    const result = await ensureBrandExists(props)
    expect(result).toBeUndefined()
  })
})

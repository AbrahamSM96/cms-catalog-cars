'use server'

import config from '@payload-config'
import { importMap } from './admin/importMap.js'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'

export const serverFunction: ServerFunctionClient = async (args) => {
  return handleServerFunctions({
    ...args,
    config: await config,
    importMap,
  })
}

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */

/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import '@payloadcms/next/css'

import config from '@payload-config'
import { importMap } from './admin/importMap.js'
import { RootLayout } from '@payloadcms/next/layouts'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { serverFunction } from './actions'


type Args = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Payload Admin',
  description: 'Payload CMS Admin Panel',
}

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
)

export default Layout

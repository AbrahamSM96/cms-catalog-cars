/* eslint-disable react/no-danger */
import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import '../globals.css'
import { Footer } from '@/components/frontend/Footer'
import { getContact } from '@/lib/payload-client'
import { inter } from '@/commons/inter'
import { Navbar } from '@/components/frontend/Navbar'
import { poppins } from '@/commons/poppins'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  description:
    'Encuentra tu auto seminuevo ideal. La mejor selección de autos con garantía de calidad, financiamiento disponible y facilidades de pago.',
  keywords: [
    'autos seminuevos',
    'carros usados',
    'venta de autos',
    'autos de segunda mano',
    'financiamiento de autos',
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description:
      'La mejor selección de autos seminuevos con garantía de calidad',
    title: 'CMS Catalog Cars - Autos Seminuevos de Calidad',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: 'CMS Catalog Cars - Autos Seminuevos de Calidad',
    template: '%s | CMS Catalog Cars',
  },
}

/**
 * RootLayout
 *
 * @param props - component props
 * @param props.children - child components
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.JSX.Element> {
  const contact = await getContact()

  const socials = [
    contact?.social?.facebook,
    contact?.social?.instagram,
    contact?.social?.tiktok,
    contact?.social?.youtube,
  ].filter((url): url is string => Boolean(url))

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...(contact?.phone
      ? {
          contactPoint: [
            {
              '@type': 'ContactPoint',
              availableLanguage: ['es'],
              contactType: 'sales',
              telephone: contact.phone,
            },
          ],
        }
      : {}),
    name: 'CMS Catalog Cars',
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    url: SITE_URL,
  }

  return (
    <html
      className={`${poppins.variable} ${inter.variable} antialiased`}
      lang="es"
    >
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
          type="application/ld+json"
        />
        <NextTopLoader
          color="#DC2626"
          height={3}
          shadow="0 0 10px #DC2626,0 0 5px #DC2626"
          showSpinner={false}
          speed={200}
          zIndex={9999}
        />
        <Navbar whatsapp={contact?.whatsapp} />
        {children}
        <Footer contact={contact} />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import '../globals.css'
import { Footer } from '@/components/frontend/Footer'
import { getContact } from '@/lib/payload-client'
import { inter } from '@/commons/inter'
import { Navbar } from '@/components/frontend/Navbar'
import { poppins } from '@/commons/poppins'

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
  openGraph: {
    description:
      'La mejor selección de autos seminuevos con garantía de calidad',
    title: 'CMS Catalog Cars - Autos Seminuevos de Calidad',
    type: 'website',
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

  return (
    <html
      className={`${poppins.variable} ${inter.variable} antialiased`}
      lang="es"
    >
      <body>
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

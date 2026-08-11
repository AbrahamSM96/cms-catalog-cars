import type { Metadata } from "next";
import { poppins } from '@/commons/poppins';
import { inter } from '@/commons/inter';
import NextTopLoader from 'nextjs-toploader';
import { getContact } from "@/lib/payload-client";
import { Navbar } from "@/components/frontend/Navbar";
import { Footer } from "@/components/frontend/Footer";
import "../globals.css";


export const metadata: Metadata = {
  title: {
    default: "CMS Catalog Cars - Autos Seminuevos de Calidad",
    template: "%s | CMS Catalog Cars",
  },
  description:
    "Encuentra tu auto seminuevo ideal. La mejor selección de autos con garantía de calidad, financiamiento disponible y facilidades de pago.",
  keywords: [
    "autos seminuevos",
    "carros usados",
    "venta de autos",
    "autos de segunda mano",
    "financiamiento de autos",
  ],
  openGraph: {
    title: "CMS Catalog Cars - Autos Seminuevos de Calidad",
    description: "La mejor selección de autos seminuevos con garantía de calidad",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getContact();

  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable} antialiased`}>
      <body>
        <NextTopLoader
          color="#DC2626"
          height={3}
          showSpinner={false}
          speed={200}
          shadow="0 0 10px #DC2626,0 0 5px #DC2626"
          zIndex={9999}
        />
        <Navbar whatsapp={contact?.whatsapp} />
        {children}
        <Footer contact={contact} />
      </body>
    </html>
  );
}

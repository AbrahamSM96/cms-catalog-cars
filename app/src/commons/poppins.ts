import { Poppins } from 'next/font/google'

export const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  // Poppins no tiene corte variable en Google Fonts, así que cada peso es un
  // archivo aparte: se declaran los cuatro que el UI realmente usa
  // (font-normal / font-medium / font-semibold / font-bold). Sin 500 y 600 el
  // matching de CSS los colapsaba a 400 y 700.
  weight: ['400', '500', '600', '700'],
})

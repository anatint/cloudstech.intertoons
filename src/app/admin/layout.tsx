import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import '../globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'Admin | Intertoons',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="min-h-screen font-sans antialiased bg-slate-50">
        {children}
      </body>
    </html>
  )
}

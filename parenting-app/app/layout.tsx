import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { ProfileWrapper } from "@/components/ProfileWrapper";

const inter = Inter({ subsets: ['latin'] })
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Parenting App Course',
  description: 'AI-Powered Parenting Course Viewer',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${outfit.variable}`}>
        <ProfileWrapper />
        <Header />
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}

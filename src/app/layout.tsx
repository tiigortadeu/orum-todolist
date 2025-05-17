import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CategoryProvider } from '@/lib/contexts/CategoryContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orumaiv',
  description: 'Your personal AI assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <CategoryProvider>
          {children}
        </CategoryProvider>
      </body>
    </html>
  )
} 
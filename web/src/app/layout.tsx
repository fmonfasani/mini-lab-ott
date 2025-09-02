import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BarChart3, Play, Shield, Globe, Home } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini-Lab OTT - Plataforma de pruebas DRM/CDN",
  description: "Plataforma de testing para DRM, CAS, CDN y observabilidad en sistemas OTT",
};

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Player Lab', href: '/player', icon: Play },
  { name: 'DRM/CAS Lab', href: '/drm-cas', icon: Shield },
  { name: 'CDN Lab', href: '/cdn', icon: Globe },
  { name: 'Observability', href: '/observability', icon: BarChart3 },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Navigation Header */}
          <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link 
                    href="/" 
                    className="flex items-center px-4 text-lg font-bold text-gray-900 dark:text-white"
                  >
                    <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                    Mini-Lab OTT
                  </Link>
                  
                  <div className="hidden md:flex ml-8 space-x-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                
                {/* Health Status */}
                <div className="flex items-center">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    System Online
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 py-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mini-Lab OTT v1.0.0 - Testing platform for OTT services
                </p>
                <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/api/health" className="hover:text-gray-700 dark:hover:text-gray-300">
                    Health Check
                  </Link>
                  <span>•</span>
                  <span>Deploy: Vercel</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
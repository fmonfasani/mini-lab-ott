import Link from 'next/link';
import { Play, Shield, Globe, BarChart3 } from 'lucide-react';
import KpiSummary from '@/components/KpiSummary';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mini-Lab OTT
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Plataforma de pruebas para DRM, CAS, CDN y Observabilidad
          </p>
        </header>

        {/* KPI Summary */}
        <div className="mb-12">
          <KpiSummary />
        </div>

        {/* Lab Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/player" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Player Lab
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pruebas de playback HLS/DASH con métricas QoE y DRM simulado
              </p>
            </div>
          </Link>

          <Link href="/drm-cas" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                DRM/CAS Lab
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Simulación de licencias Widevine/PlayReady y validación CAS
              </p>
            </div>
          </Link>

          <Link href="/cdn" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                CDN Lab
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Medición de latencia P95 y throughput P90 contra múltiples URLs
              </p>
            </div>
          </Link>

          <Link href="/observability" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Observability
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Dashboard estilo Grafana con métricas, logs y trazas
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/cdn?urls=https://httpbin.org/delay/1,https://jsonplaceholder.typicode.com/posts/1"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Test CDN Rápido
            </Link>
            <Link 
              href="/drm-cas?preset=widevine"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Test DRM Widevine
            </Link>
            <Link 
              href="/player?manifest=https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Test HLS Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
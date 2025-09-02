'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiData {
  drm_success_rate: number;
  license_rtt_p95: number;
  token_expired_rate: number;
  cas_reject_rate: number;
  playback_error_rate: number;
  startup_time_p95: number;
  rebuffer_ratio: number;
  cdn_latency_p95: number;
  cdn_throughput_p90: number;
  error_4xx_count: number;
  error_5xx_count: number;
  cors_error_count: number;
  timeout_error_count: number;
}

export default function KpiSummary() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kpis')
      .then(res => res.json())
      .then(setKpis)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No se pudieron cargar las métricas</p>
      </div>
    );
  }

  const getTrendIcon = (value: number, goodDirection: 'up' | 'down') => {
    const isGood = goodDirection === 'up' ? value >= 95 : value <= 5;
    return isGood ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const kpiCards = [
    {
      label: 'DRM Success Rate',
      value: `${kpis.drm_success_rate.toFixed(1)}%`,
      trend: getTrendIcon(kpis.drm_success_rate, 'up'),
      color: 'blue'
    },
    {
      label: 'License RTT P95',
      value: `${kpis.license_rtt_p95.toFixed(0)}ms`,
      trend: getTrendIcon(kpis.license_rtt_p95, 'down'),
      color: 'green'
    },
    {
      label: 'CAS Reject Rate',
      value: `${kpis.cas_reject_rate.toFixed(1)}%`,
      trend: getTrendIcon(kpis.cas_reject_rate, 'down'),
      color: 'yellow'
    },
    {
      label: 'Playback Errors',
      value: `${kpis.playback_error_rate.toFixed(1)}%`,
      trend: getTrendIcon(kpis.playback_error_rate, 'down'),
      color: 'red'
    },
    {
      label: 'Startup Time P95',
      value: `${kpis.startup_time_p95.toFixed(0)}ms`,
      trend: getTrendIcon(kpis.startup_time_p95, 'down'),
      color: 'purple'
    },
    {
      label: 'Rebuffer Ratio',
      value: `${kpis.rebuffer_ratio.toFixed(2)}`,
      trend: getTrendIcon(kpis.rebuffer_ratio, 'down'),
      color: 'pink'
    },
    {
      label: 'CDN Latency P95',
      value: `${kpis.cdn_latency_p95.toFixed(0)}ms`,
      trend: getTrendIcon(kpis.cdn_latency_p95, 'down'),
      color: 'indigo'
    },
    {
      label: 'CDN Throughput P90',
      value: `${(kpis.cdn_throughput_p90 / 1024 / 1024).toFixed(1)}MB/s`,
      trend: getTrendIcon(kpis.cdn_throughput_p90, 'up'),
      color: 'teal'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        KPIs Resumen (Última Hora)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </p>
              </div>
              <div className="ml-2">
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Counters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contadores de Errores (Última Hora)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{kpis.error_4xx_count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">4xx Errors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">{kpis.error_5xx_count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">5xx Errors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{kpis.cors_error_count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">CORS Errors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{kpis.timeout_error_count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Timeouts</p>
          </div>
        </div>
      </div>
    </div>
  );
}